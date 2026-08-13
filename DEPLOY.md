# Go live on ruminzuni.com

## Database

The site uses **PostgreSQL** only (local and live). Docker on the VPS runs Postgres. Local products/orders do **not** copy over. After go-live, create the real catalog in **Admin** on the live site.

## Hosting (cheaper than Vercel)

Payload + file uploads + Postgres do not fit cheap Vercel well (serverless limits and extra cost).

**Recommended:** a small Linux VPS, about **$5–8 / month**.

1. **Hostinger KVM 1 or KVM 2** — easy for Pakistan, you can pay locally.
2. **Hetzner CX22** — usually better value if you have an international card.

Choose **Ubuntu 24.04**, Singapore or Germany is fine for Pakistan traffic. Put **Cloudflare** (free) in front of the domain later if you want.

Do **not** use normal cPanel / PHP shared hosting. This app needs Node.js.

## What you still do by hand

Code cannot finish these:

1. Buy the VPS and SSH in.
2. Point DNS: `ruminzuni.com` and `www` **A records** to the VPS IP.
3. Create the first admin at `/admin` with a unique password. Never reuse documented examples.
4. Put your real WhatsApp number in **Admin → Store settings**.
5. Upload real product photos.
6. Set city shipping rates.

## Server commands

SSH into the VPS, then:

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-v2
sudo usermod -aG docker $USER
# log out and back in once
git clone https://github.com/rumman492/RumiNZuni.git
cd RumiNZuni
nano .env
```

Put this in `.env`. Generate secrets on the VPS with `openssl rand -hex 32` — do not paste example passwords.

```
POSTGRES_PASSWORD=
PAYLOAD_SECRET=
NEXT_PUBLIC_SERVER_URL=https://ruminzuni.com
PAYLOAD_DB_PUSH=false

# Optional outbound notifications. Leave off until credentials are ready.
# Customer WhatsApp confirmation uses Admin → Store settings (no API key).
# NOTIFY_OUTBOUND_ENABLED=false
# NOTIFY_WHATSAPP_PROVIDER=none
# NOTIFY_EMAIL_PROVIDER=none
# NOTIFY_SMS_PROVIDER=none

# Media: leave local (Docker ./media volume) or set S3-compatible object storage.
# MEDIA_STORAGE=local
# MEDIA_STORAGE=s3
# S3_BUCKET=
# S3_REGION=auto
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_ENDPOINT=
# S3_FORCE_PATH_STYLE=true
# S3_PREFIX=media
```

At your domain registrar, set:

- `A`  `ruminzuni.com`     → VPS public IP
- `A`  `www.ruminzuni.com` → VPS public IP

Wait for DNS (often 5–30 minutes), then:

```bash
mkdir -p media
sudo chown -R 1001:1001 media
docker compose up -d --build
```

Open:

- https://ruminzuni.com
- https://ruminzuni.com/admin

First visit runs Postgres migrations and creates the database schema. Then create the first admin user on https://ruminzuni.com/admin (Payload first-user setup). Seed is local-only (`npm run seed`); the production image does not include it.

After the first successful boot you can set `PAYLOAD_DB_PUSH=false` in `.env` (dev schema push is already off in production).

## Updates later

```bash
cd RumiNZuni
git pull
docker compose up -d --build
```
