# Go live on ruminzuni.com

## SQLite vs PostgreSQL

| | Local (this laptop) | Live website |
|---|---|---|
| Database | **SQLite** (`ruminzuni.db` file) | **PostgreSQL** |
| Why | Zero install, fine for testing | Handles orders, admin users, concurrent visitors |

SQLite is a single file. It is **not** for production. Docker on the VPS runs PostgreSQL. Payload already switches automatically: if `DATABASE_URL` starts with `file:` it uses SQLite; if it starts with `postgresql://` it uses Postgres.

Your local products/orders do **not** copy over. After go-live, create the real catalog in **Admin** on the live site (or run `npm run seed` once against Postgres).

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
3. Change the admin password.
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

Put this in `.env` (use your own long passwords):

```
POSTGRES_PASSWORD=change-me-strong
PAYLOAD_SECRET=change-me-even-longer
NEXT_PUBLIC_SERVER_URL=https://ruminzuni.com
PAYLOAD_DB_PUSH=true
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

First visit creates the database schema. Create the first admin user on screen, or run seed inside the app container:

```bash
docker compose exec app node -e "console.log('app is up')"
```

Seed is easiest from a one-off if you still have `tsx` in the image; otherwise create the admin in `/admin` and add products there.

After the first successful boot you can set `PAYLOAD_DB_PUSH=false` and recreate the app so schema is not auto-changed.

## Updates later

```bash
cd RumiNZuni
git pull
docker compose up -d --build
```
