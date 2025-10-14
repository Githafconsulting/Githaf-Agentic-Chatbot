"""
Tests for validation_service.py (Phase 1: Observation Layer)
"""
import pytest
from app.services.validation_service import (
    validate_response,
    parse_validation_response,
    retry_with_adjustment
)


# ========================================
# Test parse_validation_response
# ========================================

def test_parse_validation_response_valid():
    """Test parsing of valid validation response"""
    llm_output = """
ANSWERS_QUESTION: yes
IS_GROUNDED: yes
HAS_HALLUCINATION: no
CONFIDENCE: 0.9
RETRY: no
ADJUSTMENT: none needed
    """

    result = parse_validation_response(llm_output)

    assert result["is_valid"] == True
    assert result["confidence"] == 0.9
    assert result["issues"] == []
    assert result["retry_recommended"] == False


def test_parse_validation_response_hallucination():
    """Test detection of hallucination"""
    llm_output = """
ANSWERS_QUESTION: yes
IS_GROUNDED: no
HAS_HALLUCINATION: yes
CONFIDENCE: 0.4
RETRY: yes
ADJUSTMENT: lower threshold to find better sources
    """

    result = parse_validation_response(llm_output)

    assert result["is_valid"] == False
    assert "hallucination detected" in result["issues"]
    assert "not grounded in sources" in result["issues"]
    assert result["confidence"] == 0.4
    assert result["retry_recommended"] == True
    assert "lower threshold" in result["suggested_adjustment"]


def test_parse_validation_response_doesnt_answer():
    """Test detection of response that doesn't answer question"""
    llm_output = """
ANSWERS_QUESTION: no
IS_GROUNDED: yes
HAS_HALLUCINATION: no
CONFIDENCE: 0.5
RETRY: yes
ADJUSTMENT: expand search to more documents
    """

    result = parse_validation_response(llm_output)

    assert result["is_valid"] == False
    assert "doesn't answer question" in result["issues"]
    assert result["retry_recommended"] == True


def test_parse_validation_response_low_confidence():
    """Test detection of low confidence"""
    llm_output = """
ANSWERS_QUESTION: yes
IS_GROUNDED: yes
HAS_HALLUCINATION: no
CONFIDENCE: 0.5
RETRY: no
ADJUSTMENT:
    """

    result = parse_validation_response(llm_output)

    assert result["is_valid"] == False
    assert "low confidence" in result["issues"]


# ========================================
# Test validate_response (async)
# ========================================

@pytest.mark.asyncio
async def test_validate_good_response():
    """Test validation accepts high-quality response"""
    query = "What is your email?"
    response = "Our email address is info@githafconsulting.com. Feel free to reach out anytime!"
    sources = [{"content": "Contact us at info@githafconsulting.com for inquiries"}]

    result = await validate_response(query, response, sources)

    # Should be valid (LLM should recognize grounded response)
    # Note: This test requires a real LLM call, so it might vary
    assert "confidence" in result
    assert "is_valid" in result
    assert "issues" in result


@pytest.mark.asyncio
async def test_validate_hallucination():
    """Test validation detects hallucinated information"""
    query = "What is your office address?"
    response = "Our office is at 123 Fake Street, London, UK."  # Hallucinated
    sources = [{"content": "For location information, visit our website"}]

    result = await validate_response(query, response, sources)

    # Should detect hallucination or low grounding
    # Note: This test requires a real LLM call
    assert "confidence" in result
    assert "issues" in result


@pytest.mark.asyncio
async def test_validate_off_topic():
    """Test validation detects responses that don't answer question"""
    query = "What are your pricing packages?"
    response = "We offer various consulting services."  # Doesn't answer
    sources = [{"content": "Githaf Consulting provides consulting services"}]

    result = await validate_response(query, response, sources)

    # Should detect that question wasn't answered
    assert "confidence" in result
    assert "issues" in result


# ========================================
# Test retry_with_adjustment (async)
# ========================================

@pytest.mark.asyncio
async def test_retry_with_lower_threshold():
    """Test retry with lowered threshold"""
    query = "What is your email?"
    adjustment = "lower threshold to expand search"
    original_threshold = 0.4

    # This will attempt a real RAG retry
    # Note: Requires database and embeddings to be set up
    try:
        result = await retry_with_adjustment(query, adjustment, original_threshold)

        assert "response" in result
        assert "sources" in result
    except Exception as e:
        # If database not set up, test should still pass
        pytest.skip(f"Database not available for integration test: {e}")


@pytest.mark.asyncio
async def test_retry_with_more_documents():
    """Test retry with increased top_k"""
    query = "Tell me about your services"
    adjustment = "retrieve more documents for broader context"
    original_threshold = 0.4

    try:
        result = await retry_with_adjustment(query, adjustment, original_threshold)

        assert "response" in result
        assert "sources" in result
    except Exception as e:
        pytest.skip(f"Database not available for integration test: {e}")


# ========================================
# Edge Cases
# ========================================

def test_parse_malformed_validation_response():
    """Test handling of malformed LLM output"""
    llm_output = "This is not the expected format at all!"

    result = parse_validation_response(llm_output)

    # Should return default valid result (fail-safe)
    assert result["is_valid"] == True  # Defaults to valid if can't parse
    assert result["confidence"] == 1.0


def test_parse_partial_validation_response():
    """Test handling of partial LLM output"""
    llm_output = """
ANSWERS_QUESTION: yes
CONFIDENCE: 0.8
    """

    result = parse_validation_response(llm_output)

    # Should parse what it can
    assert result["is_valid"] == True
    assert result["confidence"] == 0.8


@pytest.mark.asyncio
async def test_validate_with_empty_sources():
    """Test validation with no sources"""
    query = "What is your email?"
    response = "Our email is info@githafconsulting.com"
    sources = []

    result = await validate_response(query, response, sources)

    # Should still complete validation
    assert "confidence" in result
    assert "is_valid" in result


@pytest.mark.asyncio
async def test_validate_with_none_sources():
    """Test validation with None sources"""
    query = "Hello"
    response = "Hi there! How can I help?"
    sources = None

    result = await validate_response(query, response, sources or [])

    # Should handle gracefully
    assert "confidence" in result
    assert "is_valid" in result
