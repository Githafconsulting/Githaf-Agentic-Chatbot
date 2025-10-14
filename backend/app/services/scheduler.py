"""
Scheduler Service (Phase 3: Self-Improvement Loop)
Background jobs for continuous learning and optimization
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.learning_service import weekly_learning_job
from app.utils.logger import get_logger
from datetime import datetime

logger = get_logger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    """Start background scheduler for learning jobs"""
    if scheduler.running:
        logger.warning("Scheduler already running")
        return

    logger.info("Starting background scheduler")

    # Weekly learning job: Every Sunday at 2 AM
    scheduler.add_job(
        weekly_learning_job,
        trigger=CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="weekly_learning",
        name="Weekly Learning Job",
        replace_existing=True,
        misfire_grace_time=3600  # Allow 1-hour grace period
    )

    scheduler.start()
    logger.info("Scheduler started successfully")


def stop_scheduler():
    """Stop background scheduler"""
    if not scheduler.running:
        logger.warning("Scheduler not running")
        return

    logger.info("Stopping background scheduler")
    scheduler.shutdown(wait=True)
    logger.info("Scheduler stopped")


def get_scheduler_status() -> dict:
    """Get current scheduler status and job info"""
    if not scheduler.running:
        return {
            "running": False,
            "jobs": []
        }

    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        })

    return {
        "running": True,
        "jobs": jobs
    }


async def trigger_learning_job_manually() -> dict:
    """
    Manually trigger learning job for testing/admin use

    Returns:
        Job execution results
    """
    logger.info("Manually triggering learning job")
    result = await weekly_learning_job()
    return result
