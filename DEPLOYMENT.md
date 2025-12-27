# 🚀 Deployment Guide - PCE Campus Assistant

This guide covers multiple deployment options for hosting your Next.js application.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ All environment variables configured
- ✅ Database ready (PostgreSQL recommended for production)
- ✅ API keys (Groq, SMTP credentials)
- ✅ Domain name (optional but recommended)

---

## 🌐 Option 1: Vercel (Recommended for Next.js)

**Best for**: Quick deployment, automatic HTTPS, CDN, zero-config Next.js support

### Steps:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables (see below)
   - Deploy!

3. **Or deploy via CLI**:
   ```bash
   vercel
   ```

### Environment Variables for Vercel:

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database (use Vercel Postgres or external PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
JWT_SECRET="your-very-secure-random-secret-key-min-32-chars"

# Groq LLM
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.1-8b-instant"

# SMTP (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="your-email@gmail.com"
SMTP_SECURE="false"

# Optional: OpenAI (for voice API routes)
OPENAI_API_KEY="your-openai-key"  # Optional
```

### Database Setup for Vercel:

**Option A: Vercel Postgres** (Recommended)
- Go to Project → Storage → Create Database → Postgres
- Copy the `POSTGRES_URL` and use it as `DATABASE_URL`
- Run migrations: `vercel env pull` then `npm run db:push`

**Option B: External PostgreSQL**
- Use services like:
  - [Neon](https://neon.tech) (Free tier available)
  - [Supabase](https://supabase.com) (Free tier available)
  - [Railway](https://railway.app) (Free tier available)
  - [Render](https://render.com) (Free tier available)

### Post-Deployment Steps:

1. **Run Database Migrations**:
   ```bash
   # Connect to Vercel project
   vercel link
   
   # Pull environment variables
   vercel env pull .env.local
   
   # Run migrations
   npm run db:push
   npm run db:seed  # Optional: seed initial data
   ```

2. **Update Prisma Schema** (if using PostgreSQL):
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

---

## 🚂 Option 2: Railway

**Best for**: Full-stack apps with database, easy PostgreSQL setup

### Steps:

1. **Sign up**: Go to [railway.app](https://railway.app)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway automatically creates `DATABASE_URL`

4. **Configure Environment Variables**:
   - Go to Project → Variables
   - Add all required variables (see Vercel section above)

5. **Deploy**:
   - Railway auto-detects Next.js
   - Builds and deploys automatically
   - Provides HTTPS URL

### Railway-Specific Settings:

- **Build Command**: `npm run build` (auto-detected)
- **Start Command**: `npm start` (auto-detected)
- **Node Version**: Set in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

---

## 🎨 Option 3: Render

**Best for**: Free tier available, PostgreSQL included

### Steps:

1. **Sign up**: Go to [render.com](https://render.com)

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

3. **Add PostgreSQL Database**:
   - Click "New" → "PostgreSQL"
   - Copy `Internal Database URL` as `DATABASE_URL`

4. **Set Environment Variables**:
   - Add all required variables in Web Service settings

5. **Deploy**:
   - Render builds and deploys automatically
   - Free tier includes HTTPS

---

## 🐳 Option 4: Docker + Self-Hosting

**Best for**: Full control, custom infrastructure

### Create Dockerfile:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Update next.config.ts:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker
}

module.exports = nextConfig
```

### Create docker-compose.yml:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM}
    env_file:
      - .env
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB:-campus_assistant}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy:

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
```

---

## 🔧 Option 5: Traditional VPS (Ubuntu/Debian)

**Best for**: Full control, custom domain, SSL with Let's Encrypt

### Steps:

1. **Setup Server** (Ubuntu 22.04):
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Setup PostgreSQL**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE campus_assistant;
   CREATE USER campus_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE campus_assistant TO campus_user;
   \q
   ```

3. **Clone and Setup App**:
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/campus-assistant
   cd /var/www/campus-assistant
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Add all environment variables
   
   # Update Prisma schema for PostgreSQL
   # Change datasource provider to "postgresql"
   
   # Generate Prisma Client
   npm run db:generate
   
   # Run migrations
   npm run db:push
   npm run db:seed
   
   # Build for production
   npm run build
   ```

4. **Setup PM2**:
   ```bash
   # Start app with PM2
   pm2 start npm --name "campus-assistant" -- start
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
   ```

5. **Setup Nginx Reverse Proxy**:
   ```bash
   sudo nano /etc/nginx/sites-available/campus-assistant
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/campus-assistant /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

## 📝 Environment Variables Checklist

Ensure all these are set in your hosting platform:

### Required:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Random secret (min 32 characters)
- ✅ `GROQ_API_KEY` - Your Groq API key
- ✅ `SMTP_HOST` - Gmail: `smtp.gmail.com`
- ✅ `SMTP_PORT` - Gmail: `587`
- ✅ `SMTP_USER` - Your Gmail address
- ✅ `SMTP_PASS` - Gmail App Password (16 characters)
- ✅ `SMTP_FROM` - Your Gmail address
- ✅ `SMTP_SECURE` - `false` for port 587

### Optional:
- `GROQ_MODEL` - Default: `llama-3.1-8b-instant`
- `OPENAI_API_KEY` - Only if using voice API routes
- `NODE_ENV` - Set to `production` in production

---

## 🔄 Post-Deployment Checklist

After deploying:

1. ✅ **Update Prisma Schema**:
   - Change `provider = "sqlite"` to `provider = "postgresql"`
   - Update `DATABASE_URL` in environment

2. ✅ **Run Database Migrations**:
   ```bash
   npm run db:push
   npm run db:seed  # Optional
   ```

3. ✅ **Test All Features**:
   - User registration and OTP verification
   - Admin login
   - Chat functionality
   - Email sending (OTP)

4. ✅ **Setup Monitoring** (Optional):
   - Use services like Sentry, LogRocket, or Vercel Analytics

5. ✅ **Configure Custom Domain** (if applicable):
   - Update DNS records
   - Configure SSL certificate

---

## 🆘 Troubleshooting

### Database Connection Issues:
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`
- Check database is accessible from hosting platform
- Ensure firewall allows connections

### Build Failures:
- Check Node.js version (requires 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Email Not Sending:
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check SMTP credentials in environment variables
- Test SMTP connection locally first

### Prisma Issues:
- Run `npm run db:generate` after schema changes
- Ensure `DATABASE_URL` is set correctly
- Check Prisma Client is generated: `node_modules/.prisma/client`

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## 💡 Recommended Setup

For production, we recommend:
- **Hosting**: Vercel (easiest) or Railway (full-stack)
- **Database**: PostgreSQL (Neon, Supabase, or Railway Postgres)
- **Email**: Gmail SMTP with App Password
- **Domain**: Custom domain with SSL
- **Monitoring**: Vercel Analytics or Sentry

---

**Need help?** Check the main README.md or open an issue in the repository.

