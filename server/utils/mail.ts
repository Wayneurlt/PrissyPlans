import nodemailer, { type Transporter } from 'nodemailer'

interface MailMessage {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

let transporter: Transporter | null | undefined

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter
  const { smtp } = useRuntimeConfig()
  if (!smtp.host) {
    transporter = null
    return transporter
  }
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port || 587),
    secure: String(smtp.secure) === 'true',
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
  })
  return transporter
}

export function isMailConfigured(): boolean {
  return Boolean(useRuntimeConfig().smtp.host)
}

/**
 * Sends an email through SMTP when configured; otherwise logs it so local
 * development still shows exactly what would have been sent.
 */
export async function sendMail(message: MailMessage): Promise<{ delivered: boolean }> {
  const transport = getTransporter()
  const from = useRuntimeConfig().mailFrom
  if (!transport) {
    console.info(`[mail:dev] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`)
    return { delivered: false }
  }
  await transport.sendMail({ from, to: message.to, subject: message.subject, html: message.html, text: message.text, replyTo: message.replyTo })
  return { delivered: true }
}

export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Brand email shell. */
export function renderEmailLayout(title: string, bodyHtml: string, footerNote = ''): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f1e8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#292321;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f1e8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;">
        <tr><td style="background:#3b0019;padding:28px 32px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#ece7c5;letter-spacing:0.02em;">Prissy Plans Events</div>
          <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ece7c5;opacity:0.8;margin-top:6px;">Events Planner</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:24px;margin:0 0 16px;color:#292321;">${escapeHtml(title)}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #efe7da;font-size:12px;color:#6e615c;line-height:1.6;">
          ${footerNote}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function renderDetailRows(rows: Array<[string, string | null | undefined]>): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;font-size:14px;line-height:1.6;">
    ${rows.filter(([, v]) => v).map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px 8px 0;color:#6e615c;vertical-align:top;white-space:nowrap;width:160px;">${escapeHtml(label)}</td>
        <td style="padding:8px 0;color:#292321;vertical-align:top;">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
      </tr>`).join('')}
  </table>`
}
