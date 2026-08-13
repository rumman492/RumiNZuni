const DOCKER_BUILD_SECRET = 'build-only-secret-not-used-at-runtime'

const WEAK_SECRETS = [
  '',
  'secret',
  'password',
  'payload',
  'ruminzuni',
  'change-me',
  'change-me-strong',
  'change-me-even-longer',
  'change-this-to-a-long-random-string',
  'pick-a-long-random-password',
  'pick-another-long-random-string',
  'ruminzuni-dev-secret-change-before-production-9f3a2c',
  DOCKER_BUILD_SECRET,
  'build-only-secret',
]

const WEAK_PASSWORDS = [
  'ChangeMeNow1',
  'changeme',
  'password',
  'Password1',
  'Admin123',
  'admin1234',
  'ruminzuni',
  'RumiNZuni1',
]

export function runtimeEnv(name: string) {
  return process.env[name]
}

export function isNextBuild() {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'
  )
}

export function isWeakSecret(value: string | undefined | null) {
  const secret = (value || '').trim()
  if (secret.length < 32) return true
  const lower = secret.toLowerCase()
  if (WEAK_SECRETS.some((item) => item && lower === item.toLowerCase())) return true
  if (lower.includes('change-me') || lower.includes('changeme') || lower.includes('change-this')) return true
  if (lower.includes('build-only')) return true
  if (lower.startsWith('ruminzuni-dev')) return true
  return false
}

export function assertStrongPassword(password: string) {
  if (WEAK_PASSWORDS.some((item) => item.toLowerCase() === password.toLowerCase())) {
    throw new Error('That password is not allowed. Choose a unique password that is not a documented example.')
  }
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters.')
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('Password must include uppercase, lowercase, and a number.')
  }
}

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production' || isNextBuild()) return

  const secret = runtimeEnv('PAYLOAD_SECRET')
  if (isWeakSecret(secret)) {
    throw new Error(
      'PAYLOAD_SECRET must be a unique value of at least 32 characters. Generate one with: openssl rand -hex 32',
    )
  }

  const databaseUrl = runtimeEnv('DATABASE_URL') || ''
  if (!databaseUrl.startsWith('postgres')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string in production.')
  }
  if (/ruminzuni:ruminzuni@/i.test(databaseUrl) || /:build@/i.test(databaseUrl)) {
    throw new Error('DATABASE_URL still uses a documented example password. Set POSTGRES_PASSWORD in .env.')
  }
  if (/127\.0\.0\.1|localhost/i.test(databaseUrl)) {
    throw new Error('DATABASE_URL must point at the production Postgres service, not localhost.')
  }

  const origin = (runtimeEnv('NEXT_PUBLIC_SERVER_URL') || '').replace(/\/$/, '')
  if (origin !== 'https://ruminzuni.com') {
    throw new Error('NEXT_PUBLIC_SERVER_URL must be https://ruminzuni.com in production.')
  }
}

export function productionDatabaseUrl() {
  const fromEnv = runtimeEnv('DATABASE_URL')
  if (process.env.NODE_ENV === 'production' && !isNextBuild()) {
    if (!fromEnv) throw new Error('DATABASE_URL is required in production.')
    return fromEnv
  }
  return fromEnv || 'postgresql://ruminzuni:ruminzuni@127.0.0.1:5432/ruminzuni'
}

export function productionPayloadSecret() {
  const fromEnv = runtimeEnv('PAYLOAD_SECRET') || ''
  if (process.env.NODE_ENV === 'production' && !isNextBuild() && isWeakSecret(fromEnv)) {
    throw new Error('PAYLOAD_SECRET is missing or too weak for production.')
  }
  return fromEnv || (isNextBuild() ? DOCKER_BUILD_SECRET : '')
}
