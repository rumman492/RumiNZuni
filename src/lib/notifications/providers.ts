import type { Payload } from 'payload'
import { toWhatsAppNumber } from '@/lib/pakistan'
import type { NotificationConfig } from '@/lib/notifications/config'
import type { NotificationResult, OutboundMessage } from '@/lib/notifications/types'

type Logger = Pick<Payload['logger'], 'info' | 'error'>

function nowIso() {
  return new Date().toISOString()
}

function publicError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 280)
  return 'Notification provider failed'
}

async function parseErrorBody(response: Response) {
  const text = await response.text().catch(() => '')
  return text.slice(0, 180).replace(/\s+/g, ' ') || `HTTP ${response.status}`
}

async function postJson(url: string, body: unknown, headers: Record<string, string>, timeoutMs: number) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    throw new Error(await parseErrorBody(response))
  }
}

function webhookHeaders(config: NotificationConfig): Record<string, string> {
  return config.webhookSecret ? { Authorization: `Bearer ${config.webhookSecret}` } : {}
}

function e164Pk(phone: string) {
  return `+${toWhatsAppNumber(phone)}`
}

async function sendWebhook(
  url: string | undefined,
  config: NotificationConfig,
  message: OutboundMessage,
): Promise<void> {
  if (!url) throw new Error('Webhook URL is not configured')
  await postJson(
    url,
    {
      event: 'order.placed',
      channel: message.channel,
      audience: message.audience,
      to: message.to,
      subject: message.subject,
      text: message.text,
      orderNumber: message.payload.orderNumber,
    },
    webhookHeaders(config),
    config.timeoutMs,
  )
}

async function sendMetaWhatsApp(config: NotificationConfig, message: OutboundMessage) {
  const { token, phoneNumberId, apiVersion, customerTemplate, customerTemplateLang } = config.whatsapp
  if (!token || !phoneNumberId) {
    throw new Error('WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are required for the Meta provider')
  }

  const to = toWhatsAppNumber(message.to)
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
  const isCustomer = message.audience === 'customer'
  const body =
    isCustomer && customerTemplate
      ? {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: customerTemplate,
            language: { code: customerTemplateLang },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: message.payload.orderNumber },
                  { type: 'text', text: message.payload.formattedTotal },
                ],
              },
            ],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message.text.slice(0, 4096) },
        }

  if (isCustomer && !customerTemplate) {
    throw new Error('Customer WhatsApp API sends need WHATSAPP_CUSTOMER_TEMPLATE_NAME (click-to-chat is still available)')
  }

  await postJson(url, body, { Authorization: `Bearer ${token}` }, config.timeoutMs)
}

async function sendResendEmail(config: NotificationConfig, message: OutboundMessage) {
  const apiKey = config.email.resendApiKey
  const from = config.emailFrom
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and NOTIFY_EMAIL_FROM are required for the Resend provider')
  }

  await postJson(
    'https://api.resend.com/emails',
    {
      from,
      to: [message.to],
      subject: message.subject || `Order ${message.payload.orderNumber}`,
      text: message.text,
    },
    { Authorization: `Bearer ${apiKey}` },
    config.timeoutMs,
  )
}

async function sendTwilioSms(config: NotificationConfig, message: OutboundMessage) {
  const { twilioAccountSid, twilioAuthToken, twilioFrom } = config.sms
  if (!twilioAccountSid || !twilioAuthToken || !twilioFrom) {
    throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required for the Twilio provider')
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
  const params = new URLSearchParams({
    To: e164Pk(message.to),
    From: twilioFrom,
    Body: message.text.slice(0, 1600),
  })
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    signal: AbortSignal.timeout(config.timeoutMs),
  })
  if (!response.ok) {
    throw new Error(await parseErrorBody(response))
  }
}

export async function sendOutboundMessage(
  config: NotificationConfig,
  message: OutboundMessage,
  logger?: Logger,
): Promise<NotificationResult> {
  const at = nowIso()
  const provider =
    message.channel === 'whatsapp'
      ? config.whatsapp.provider
      : message.channel === 'email'
        ? config.email.provider
        : config.sms.provider

  if (provider === 'none') {
    return { channel: message.channel, audience: message.audience, provider, status: 'skipped', to: message.to, at }
  }

  try {
    if (provider === 'log') {
      logger?.info({
        msg: 'Notification dry-run (log provider)',
        channel: message.channel,
        audience: message.audience,
        to: message.to,
        orderNumber: message.payload.orderNumber,
      })
    } else if (message.channel === 'whatsapp' && provider === 'meta') {
      await sendMetaWhatsApp(config, message)
    } else if (message.channel === 'whatsapp' && provider === 'webhook') {
      await sendWebhook(config.whatsapp.webhookUrl, config, message)
    } else if (message.channel === 'email' && provider === 'resend') {
      await sendResendEmail(config, message)
    } else if (message.channel === 'email' && provider === 'webhook') {
      await sendWebhook(config.email.webhookUrl, config, message)
    } else if (message.channel === 'sms' && provider === 'twilio') {
      await sendTwilioSms(config, message)
    } else if (message.channel === 'sms' && provider === 'webhook') {
      await sendWebhook(config.sms.webhookUrl, config, message)
    } else {
      return {
        channel: message.channel,
        audience: message.audience,
        provider,
        status: 'skipped',
        to: message.to,
        error: `Provider ${provider} is not implemented for ${message.channel}`,
        at,
      }
    }

    return { channel: message.channel, audience: message.audience, provider, status: 'sent', to: message.to, at }
  } catch (error) {
    logger?.error({
      msg: 'Notification send failed',
      channel: message.channel,
      audience: message.audience,
      provider,
      orderNumber: message.payload.orderNumber,
      err: publicError(error),
    })
    return {
      channel: message.channel,
      audience: message.audience,
      provider,
      status: 'failed',
      to: message.to,
      error: publicError(error),
      at,
    }
  }
}
