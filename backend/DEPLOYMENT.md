# Deployment Guide - Agentic Chatbot System v2.0

**Status:** Production-Ready
**Last Updated:** January 2025
**Version:** 2.0.0 (Agentic)

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **OS:** Linux (Ubuntu 20.04+), macOS, Windows Server 2019+
- **Python:** 3.9+
- **RAM:** 2GB (4GB recommended)
- **CPU:** 2 cores (4+ cores recommended)
- **Disk:** 5GB free space
- **Database:** PostgreSQL 14+ with pgvector extension

### External Services Required
- **Supabase** (PostgreSQL + Storage) or self-hosted PostgreSQL with pgvector
- **Groq API** (LLM provider) - Free tier: 14,400 requests/day
- **SMTP Server** (optional, for email tool)
- **SerpAPI** (optional, for web search)

---

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] Run all tests: `pytest tests/`
- [ ] Run performance benchmarks: `pytest tests/benchmarks/`
- [ ] Check code coverage: Should be >= 60%
- [ ] Review security: No hardcoded secrets

### 2. Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Migration
- [ ] Run database schema scripts
- [ ] Create admin user
- [ ] Seed knowledge base (optional)

### 4. Configuration
- [ ] Set all required environment variables
- [ ] Generate secure SECRET_KEY
- [ ] Configure CORS origins
- [ ] Set up SMTP (if using email tool)

---

## Environment Configuration

### Required Environment Variables

Create `.env` file in `backend/` directory:

```bash
# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME="Githaf Consulting Chatbot API"
HOST=0.0.0.0
PORT=8000

# Supabase (Database + Storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Groq API (LLM Provider)
GROQ_API_KEY=your-groq-api-key

# Embedding Model
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# RAG Configuration
RAG_TOP_K=5
RAG_SIMILARITY_THRESHOLD=0.5
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# LLM Configuration
LLM_MODEL=llama-3.1-8b-instant
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=500

# Authentication (CRITICAL - Generate new key!)
SECRET_KEY=generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=["https://your-frontend-domain.com"]

# Email Tool (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com
FROM_NAME=Githaf Consulting Bot

# Web Search Tool (Optional)
SEARCH_PROVIDER=duckduckgo
SERPAPI_KEY=your-serpapi-key-if-using-serpapi
```

### Generate SECRET_KEY

```bash
openssl rand -hex 32
```

### SMTP Setup (Gmail Example)

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: Account → Security → App Passwords
3. Use app password in `SMTP_PASSWORD`

---

## Database Setup

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note project URL and anon key

2. **Enable pgvector Extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Run Database Migrations**
   ```bash
   cd backend/scripts

   # Core tables
   psql $DATABASE_URL < database_schema.sql

   # Phase 4: Memory tables
   psql $DATABASE_URL < create_memory_tables.sql

   # Phase 5: Tool tables
   psql $DATABASE_URL < create_tools_tables.sql

   # System settings
   psql $DATABASE_URL < create_settings_table.sql

   # Vector search function
   psql $DATABASE_URL < vector_search_function.sql
   ```

4. **Create Admin User**
   ```bash
   cd backend
   python scripts/quick_create_admin.py
   ```

   Default credentials:
   - Email: `admin@githaf.com`
   - Password: `admin123` (CHANGE IN PRODUCTION!)

5. **Seed Knowledge Base (Optional)**
   ```bash
   python scripts/seed_knowledge_base.py
   ```

### Option 2: Self-Hosted PostgreSQL

1. **Install PostgreSQL 14+**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Install pgvector**
   ```bash
   cd /tmp
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   sudo make install
   ```

3. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE githaf_chatbot;
   CREATE USER chatbot_user WITH PASSWORD 'secure-password';
   GRANT ALL PRIVILEGES ON DATABASE githaf_chatbot TO chatbot_user;
   ```

4. **Run migrations** (same as Supabase)

---

## Deployment Options

### Option 1: Railway (Easiest)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=...
   railway variables set GROQ_API_KEY=...
   # ... set all other variables
   ```

4. **Access**
   - Railway provides public URL automatically
   - Update CORS origins with Railway URL

### Option 2: Render

1. **Create Render Account**
   - Go to https://render.com

2. **New Web Service**
   - Connect GitHub repository
   - Select `backend` directory
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   - Add all required variables in Render dashboard

4. **Deploy**
   - Render auto-deploys on git push

### Option 3: AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t2.medium (minimum)
   - Security Group: Allow ports 80, 443, 22

2. **SSH and Setup**
   ```bash
   ssh -i key.pem ubuntu@your-ec2-ip

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Python 3.9+
   sudo apt install python3.9 python3.9-venv python3-pip -y

   # Clone repository
   git clone https://github.com/your-repo/githaf-chatbot-system.git
   cd githaf-chatbot-system/backend

   # Create virtual environment
   python3.9 -m venv venv
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Create Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/githaf-chatbot.service
   ```

   ```ini
   [Unit]
   Description=Githaf Chatbot API
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/githaf-chatbot-system/backend
   Environment="PATH=/home/ubuntu/githaf-chatbot-system/backend/venv/bin"
   EnvironmentFile=/home/ubuntu/githaf-chatbot-system/backend/.env
   ExecStart=/home/ubuntu/githaf-chatbot-system/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Enable and Start Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable githaf-chatbot
   sudo systemctl start githaf-chatbot
   sudo systemctl status githaf-chatbot
   ```

5. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/githaf-chatbot
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/githaf-chatbot /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   sudo systemctl restart nginx
   ```

### Option 4: Docker (Recommended for Production)

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.9-slim

   WORKDIR /app

   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       gcc \
       && rm -rf /var/lib/apt/lists/*

   # Copy requirements
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # Copy application
   COPY . .

   # Expose port
   EXPOSE 8000

   # Health check
   HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
       CMD curl -f http://localhost:8000/health || exit 1

   # Run application
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and Run**
   ```bash
   docker build -t githaf-chatbot:v2.0 .
   docker run -d -p 8000:8000 --env-file .env githaf-chatbot:v2.0
   ```

3. **Docker Compose** (with PostgreSQL)
   ```yaml
   version: '3.8'

   services:
     api:
       build: .
       ports:
         - "8000:8000"
       env_file:
         - .env
       depends_on:
         - db
       restart: always

     db:
       image: ankane/pgvector:latest
       environment:
         POSTGRES_DB: githaf_chatbot
         POSTGRES_USER: chatbot_user
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - pgdata:/var/lib/postgresql/data
       restart: always

   volumes:
     pgdata:
   ```

---

## Post-Deployment

### 1. Verify Health
```bash
curl https://your-domain.com/health

# Expected response:
# {"status":"healthy","version":"2.0.0","database":"connected"}
```

### 2. Test API Endpoints
```bash
# Test chat endpoint
curl -X POST https://your-domain.com/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message":"What services do you offer?"}'

# Test authentication
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@githaf.com&password=admin123"
```

### 3. Change Default Admin Password
```bash
# Via API or database update
UPDATE users SET password_hash = 'new-hash' WHERE email = 'admin@githaf.com';
```

### 4. Upload Knowledge Base
- Login to admin dashboard
- Navigate to Documents page
- Upload company documents (PDF, DOCX, TXT)

### 5. Configure System Settings
- Set default theme, language
- Enable/disable features
- Configure privacy settings

---

## Monitoring & Maintenance

### Health Monitoring

**Endpoint:** `/health`

Monitor:
- Response time (< 500ms expected)
- Database connectivity
- API availability

**Tools:**
- Uptime Robot: https://uptimerobot.com
- Better Uptime: https://betteruptime.com
- Pingdom: https://www.pingdom.com

### Log Monitoring

**Location:** `backend/logs/app.log`

**Setup Log Rotation:**
```bash
sudo nano /etc/logrotate.d/githaf-chatbot
```

```
/home/ubuntu/githaf-chatbot-system/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 ubuntu ubuntu
    sharedscripts
    postrotate
        systemctl reload githaf-chatbot
    endscript
}
```

### Performance Monitoring

**Tools:**
- Sentry (error tracking)
- New Relic (APM)
- Datadog (infrastructure monitoring)

### Database Backups

**Supabase:** Automatic backups (Pro plan)

**Self-hosted:**
```bash
# Daily backup cron job
0 2 * * * pg_dump -U chatbot_user githaf_chatbot > /backups/chatbot_$(date +\%Y\%m\%d).sql
```

### Weekly Maintenance Tasks

- [ ] Review error logs
- [ ] Check disk space
- [ ] Review analytics for anomalies
- [ ] Update dependencies (security patches)
- [ ] Review system settings
- [ ] Check learning service reports

---

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms:** `/health` returns "disconnected"

**Solutions:**
1. Check `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
2. Verify network connectivity: `ping your-project.supabase.co`
3. Check Supabase project status
4. Review firewall rules

### Issue: Slow Response Times

**Symptoms:** Requests take > 5 seconds

**Solutions:**
1. Check Groq API rate limits
2. Increase server resources (RAM, CPU)
3. Review database query performance
4. Check network latency
5. Enable caching (future enhancement)

### Issue: Email Tool Not Working

**Symptoms:** Emails not sending

**Solutions:**
1. Verify SMTP credentials in `.env`
2. Check SMTP port (587 for TLS, 465 for SSL)
3. Enable "Less secure app access" (Gmail) or use App Password
4. Check firewall allows outbound SMTP
5. Review logs for SMTP errors

### Issue: High Memory Usage

**Symptoms:** Server using > 2GB RAM

**Solutions:**
1. Restart service: `sudo systemctl restart githaf-chatbot`
2. Review embedding model size (all-MiniLM-L6-v2 is ~100MB)
3. Check for memory leaks in logs
4. Increase server RAM

### Issue: Rate Limit Errors

**Symptoms:** "Too Many Requests" errors

**Solutions:**
1. Groq API: Wait for rate limit reset (14,400 req/day free tier)
2. Chat endpoint: Current limit is 10 req/min per IP
3. Upgrade Groq plan or adjust `RAG_TOP_K` to reduce LLM calls
4. Implement caching layer

---

## Security Best Practices

1. **Change default admin password immediately**
2. **Use strong SECRET_KEY** (32+ characters, random)
3. **Enable HTTPS** (SSL/TLS) for all traffic
4. **Restrict CORS origins** to your frontend domain only
5. **Keep dependencies updated** (security patches)
6. **Enable rate limiting** on all public endpoints
7. **Monitor logs** for suspicious activity
8. **Regular backups** of database and configuration
9. **Use environment variables** for all secrets (never hardcode)
10. **Implement IP whitelisting** for admin endpoints (optional)

---

## Scaling Considerations

### Horizontal Scaling

**Load Balancer + Multiple Instances:**
- Deploy multiple API instances
- Use Nginx or AWS ALB for load balancing
- Share database across instances
- Consider Redis for session storage

### Vertical Scaling

**Increase Resources:**
- RAM: 4GB → 8GB (better for embedding models)
- CPU: 2 cores → 4+ cores (faster LLM processing)
- Disk: SSD for better I/O

### Database Scaling

**Read Replicas:**
- Separate read/write connections
- Route analytics queries to replicas

**Connection Pooling:**
- Use pgbouncer for PostgreSQL
- Reduce connection overhead

---

## Support & Resources

- **Documentation:** `/docs` endpoint (Swagger UI)
- **GitHub Issues:** https://github.com/your-repo/issues
- **Support Email:** support@githafconsulting.com

---

**Deployment Complete!** 🎉

Your Agentic Chatbot System v2.0 is now production-ready.
