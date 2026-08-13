function readEnv(name: string) {
  const value = process.env[name]?.trim()
  return value || undefined
}

function readFlag(name: string, fallback = false) {
  const value = readEnv(name)?.toLowerCase()
  if (!value) return fallback
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

const WHATSAPP_PROVIDERS = ['none', 'log', 'meta', 'webhook'] as const
const EMAIL_PROVIDERS = ['none', 'log', 'resend', 'webhook'] as const
const SMS_PROVIDERS = ['none', 'log', 'twilio', 'webhook'] as const

type Provider<T extends readonly string[]> = T[number]

function readProvider<T extends readonly string[]>(name: string, allowed: T): Provider<T> {
  const value = (readEnv(name) || 'none').toLowerCase()
  return (allowed.includes(value) ? value : 'none') as Provider<T>
}

export type NotificationConfig = {
  outboundEnabled: boolean
  timeoutMs: number
  staffEmail?: string
  staffPhone?: string
  staffWhatsapp?: string
  emailFrom?: string
  whatsapp: {
    provider: Provider<typeof WHATSAPP_PROVIDERS>
    token?: string
    phoneNumberId?: string
    apiVersion: string
    customerTemplate?: string
    customerTemplateLang: string
    webhookUrl?: string
  }
  email: {
    provider: Provider<typeof EMAIL_PROVIDERS>
    resendApiKey?: string
    webhookUrl?: string
  }
  sms: {
    provider: Provider<typeof SMS_PROVIDERS>
    twilioAccountSid?: string
    twilioAuthToken?: string
    twilioFrom?: string
    webhookUrl?: string
  }
  webhookSecret?: string
}

export function getNotificationConfig(): NotificationConfig {
  return {
    outboundEnabled: readFlag('NOTIFY_OUTBOUND_ENABLED', false),
    timeoutMs: Math.min(Math.max(Number(readEnv('NOTIFY_TIMEOUT_MS') || 8000), 1000), 20000),
    staffEmail: readEnv('NOTIFY_STAFF_EMAIL'),
    staffPhone: readEnv('NOTIFY_STAFF_PHONE'),
    staffWhatsapp: readEnv('NOTIFY_STAFF_WHATSAPP'),
    emailFrom: readEnv('NOTIFY_EMAIL_FROM'),
    whatsapp: {
      provider: readProvider('NOTIFY_WHATSAPP_PROVIDER', WHATSAPP_PROVIDERS),
      token: readEnv('WHATSAPP_TOKEN'),
      phoneNumberId: readEnv('WHATSAPP_PHONE_NUMBER_ID'),
      apiVersion: readEnv('WHATSAPP_API_VERSION') || 'v21.0',
      customerTemplate: readEnv('WHATSAPP_CUSTOMER_TEMPLATE_NAME'),
      customerTemplateLang: readEnv('WHATSAPP_CUSTOMER_TEMPLATE_LANG') || 'en',
      webhookUrl: readEnv('WHATSAPP_WEBHOOK_URL'),
    },
    email: {
      provider: readProvider('NOTIFY_EMAIL_PROVIDER', EMAIL_PROVIDERS),
      resendApiKey: readEnv('RESEND_API_KEY'),
      webhookUrl: readEnv('EMAIL_WEBHOOK_URL'),
    },
    sms: {
      provider: readProvider('NOTIFY_SMS_PROVIDER', SMS_PROVIDERS),
      twilioAccountSid: readEnv('TWILIO_ACCOUNT_SID'),
      twilioAuthToken: readEnv('TWILIO_AUTH_TOKEN'),
      twilioFrom: readEnv('TWILIO_FROM_NUMBER'),
      webhookUrl: readEnv('SMS_WEBHOOK_URL'),
    },
    webhookSecret: readEnv('NOTIFY_WEBHOOK_SECRET'),
  }
}
