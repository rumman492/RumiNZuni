#!/bin/sh
set -e
mkdir -p /app/media
# Host bind-mount ./media is often root-owned; Payload must write sample photos here.
chown -R nextjs:nodejs /app/media 2>/dev/null || true
chmod -R u+rwX /app/media 2>/dev/null || true
exec su-exec nextjs:nodejs "$@"
