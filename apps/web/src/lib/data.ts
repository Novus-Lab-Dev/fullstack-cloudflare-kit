/**
 * Mock in-memory data for the dashboard screens.
 *
 * Every function is async and returns clones, so a screen written against this
 * module keeps working unchanged once the body is swapped for an `api.*` call.
 * Nothing here touches the network.
 */

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed'
export type TemplateKind = 'otp' | 'alert' | 'campaign'

export interface Message {
  id: string
  to: string
  body: string
  templateCode: string
  status: MessageStatus
  segments: number
  createdAt: string
}

export interface Template {
  id: string
  name: string
  code: string
  kind: TemplateKind
  body: string
  variables: string[]
  trackDelivery: boolean
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  group: string
  optedOut: boolean
}

export interface WorkspaceSettings {
  workspaceName: string
  senderId: string
  defaultTemplateCode: string
  monthlyLimit: number
  deliveryReceipts: boolean
}

export interface OverviewStats {
  messagesSent: number
  deliveryRate: number
  templateCount: number
  contactCount: number
  recentMessages: Message[]
  topTemplates: { code: string; name: string; sends: number }[]
}

export type MessageDraft = Pick<Message, 'to' | 'body' | 'templateCode'>
export type TemplateDraft = Omit<Template, 'id' | 'updatedAt'>
export type ContactDraft = Omit<Contact, 'id'>

export const CONTACT_GROUPS = [
  'Students',
  'Faculty',
  'Staff',
  'Alumni',
] as const

const LATENCY_MS = 250

const now = Date.now()
const hoursAgo = (hours: number) =>
  new Date(now - hours * 3_600_000).toISOString()

let sequence = 0
const nextId = (prefix: string) =>
  `${prefix}_${(sequence += 1).toString().padStart(4, '0')}`

const messages: Message[] = [
  {
    id: nextId('msg'),
    to: '+8801710000101',
    body: 'Your login code is 493117. It expires in 5 minutes.',
    templateCode: 'otp_login',
    status: 'delivered',
    segments: 1,
    createdAt: hoursAgo(1),
  },
  {
    id: nextId('msg'),
    to: '+8801710000102',
    body: 'Result publish: your semester results are available in the portal.',
    templateCode: 'alert_result',
    status: 'sent',
    segments: 1,
    createdAt: hoursAgo(3),
  },
  {
    id: nextId('msg'),
    to: '+8801710000103',
    body: 'Fee reminder: your tuition payment is due on the 15th.',
    templateCode: 'alert_fee',
    status: 'queued',
    segments: 1,
    createdAt: hoursAgo(4),
  },
  {
    id: nextId('msg'),
    to: '+8801710000104',
    body: 'Orientation day moved to the main auditorium at 10:00.',
    templateCode: 'campaign_event',
    status: 'failed',
    segments: 1,
    createdAt: hoursAgo(9),
  },
  {
    id: nextId('msg'),
    to: '+8801710000105',
    body: 'Your login code is 812004. It expires in 5 minutes.',
    templateCode: 'otp_login',
    status: 'delivered',
    segments: 1,
    createdAt: hoursAgo(20),
  },
  {
    id: nextId('msg'),
    to: '+8801710000106',
    body: 'Library book AW-2214 is due tomorrow. Renew it online to avoid a fine.',
    templateCode: 'alert_library',
    status: 'delivered',
    segments: 1,
    createdAt: hoursAgo(27),
  },
  {
    id: nextId('msg'),
    to: '+8801710000107',
    body: 'Transport survey: two minutes to tell us your commute, thank you!',
    templateCode: 'campaign_event',
    status: 'failed',
    segments: 2,
    createdAt: hoursAgo(31),
  },
  {
    id: nextId('msg'),
    to: '+8801710000108',
    body: 'ID card ready for collection at the ISDT desk.',
    templateCode: 'alert_result',
    status: 'delivered',
    segments: 1,
    createdAt: hoursAgo(46),
  },
]

const templates: Template[] = [
  {
    id: nextId('tpl'),
    name: 'Login OTP',
    code: 'otp_login',
    kind: 'otp',
    body: 'Your login code is {{code}}. It expires in {{ttl}} minutes.',
    variables: ['code', 'ttl'],
    trackDelivery: false,
    updatedAt: hoursAgo(50),
  },
  {
    id: nextId('tpl'),
    name: 'Result published',
    code: 'alert_result',
    kind: 'alert',
    body: 'Result publish: {{message}}',
    variables: ['message'],
    trackDelivery: true,
    updatedAt: hoursAgo(72),
  },
  {
    id: nextId('tpl'),
    name: 'Fee reminder',
    code: 'alert_fee',
    kind: 'alert',
    body: 'Fee reminder: {{message}}',
    variables: ['message'],
    trackDelivery: true,
    updatedAt: hoursAgo(120),
  },
  {
    id: nextId('tpl'),
    name: 'Event broadcast',
    code: 'campaign_event',
    kind: 'campaign',
    body: '{{message}} Reply STOP to opt out.',
    variables: ['message'],
    trackDelivery: false,
    updatedAt: hoursAgo(200),
  },
]

const contacts: Contact[] = [
  {
    id: nextId('ct'),
    name: 'Ayesha Rahman',
    phone: '+8801710000101',
    group: 'Students',
    optedOut: false,
  },
  {
    id: nextId('ct'),
    name: 'Bashir Alam',
    phone: '+8801710000102',
    group: 'Faculty',
    optedOut: false,
  },
  {
    id: nextId('ct'),
    name: 'Chandra Das',
    phone: '+8801710000103',
    group: 'Students',
    optedOut: true,
  },
  {
    id: nextId('ct'),
    name: 'Dilara Khatun',
    phone: '+8801710000104',
    group: 'Staff',
    optedOut: false,
  },
  {
    id: nextId('ct'),
    name: 'Emran Hossain',
    phone: '+8801710000105',
    group: 'Alumni',
    optedOut: false,
  },
  {
    id: nextId('ct'),
    name: 'Farhana Yeasmin',
    phone: '+8801710000106',
    group: 'Students',
    optedOut: false,
  },
]

const settings: WorkspaceSettings = {
  workspaceName: 'SEU UMS',
  senderId: 'SEU',
  defaultTemplateCode: 'otp_login',
  monthlyLimit: 50_000,
  deliveryReceipts: true,
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
const clone = <T>(value: T): T => structuredClone(value)

export function smsSegments(body: string): number {
  const length = body.trim().length
  return length === 0 ? 0 : Math.ceil(length / 160)
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function listMessages(): Promise<Message[]> {
  await wait()
  return clone(messages)
}

export async function createMessage(draft: MessageDraft): Promise<Message> {
  await wait()
  const message: Message = {
    id: nextId('msg'),
    to: draft.to.trim(),
    body: draft.body.trim(),
    templateCode: draft.templateCode,
    status: 'queued',
    segments: smsSegments(draft.body),
    createdAt: new Date().toISOString(),
  }
  messages.unshift(message)
  return clone(message)
}

/** Mock dispatch: a queued or failed send is retried and lands as delivered. */
export async function retryMessage(id: string): Promise<Message> {
  await wait()
  const message = messages.find((entry) => entry.id === id)
  if (!message) {
    throw new Error(`Unknown message ${id}`)
  }
  message.status = 'sent'
  message.createdAt = new Date().toISOString()
  return clone(message)
}

export async function updateMessage(
  id: string,
  draft: MessageDraft,
): Promise<Message> {
  await wait()
  const message = messages.find((entry) => entry.id === id)
  if (!message) {
    throw new Error(`Unknown message ${id}`)
  }
  Object.assign(message, {
    to: draft.to.trim(),
    body: draft.body.trim(),
    templateCode: draft.templateCode,
    segments: smsSegments(draft.body),
  })
  return clone(message)
}

export async function deleteMessage(id: string): Promise<void> {
  await wait()
  const index = messages.findIndex((entry) => entry.id === id)
  if (index >= 0) {
    messages.splice(index, 1)
  }
}

export async function listTemplates(): Promise<Template[]> {
  await wait()
  return clone(templates)
}

export async function getTemplate(id: string): Promise<Template> {
  await wait()
  const template = templates.find((entry) => entry.id === id)
  if (!template) {
    throw new Error(`Unknown template ${id}`)
  }
  return clone(template)
}

export async function createTemplate(draft: TemplateDraft): Promise<Template> {
  await wait()
  const template: Template = {
    ...draft,
    id: nextId('tpl'),
    updatedAt: new Date().toISOString(),
  }
  templates.unshift(template)
  return clone(template)
}

export async function updateTemplate(
  id: string,
  draft: TemplateDraft,
): Promise<Template> {
  await wait()
  const template = templates.find((entry) => entry.id === id)
  if (!template) {
    throw new Error(`Unknown template ${id}`)
  }
  Object.assign(template, draft, { updatedAt: new Date().toISOString() })
  return clone(template)
}

export async function duplicateTemplate(id: string): Promise<Template> {
  await wait()
  const source = templates.find((entry) => entry.id === id)
  if (!source) {
    throw new Error(`Unknown template ${id}`)
  }
  const copy: Template = {
    ...clone(source),
    id: nextId('tpl'),
    name: `${source.name} (copy)`,
    code: `${source.code}_copy`,
    updatedAt: new Date().toISOString(),
  }
  templates.unshift(copy)
  return clone(copy)
}

export async function deleteTemplate(id: string): Promise<void> {
  await wait()
  const index = templates.findIndex((entry) => entry.id === id)
  if (index >= 0) {
    templates.splice(index, 1)
  }
}

export async function listContacts(): Promise<Contact[]> {
  await wait()
  return clone(contacts)
}

export async function createContact(draft: ContactDraft): Promise<Contact> {
  await wait()
  const contact: Contact = { ...draft, id: nextId('ct') }
  contacts.unshift(contact)
  return clone(contact)
}

export async function deleteContact(id: string): Promise<void> {
  await wait()
  const index = contacts.findIndex((entry) => entry.id === id)
  if (index >= 0) {
    contacts.splice(index, 1)
  }
}

export async function getSettings(): Promise<WorkspaceSettings> {
  await wait()
  return clone(settings)
}

export async function saveSettings(
  next: WorkspaceSettings,
): Promise<WorkspaceSettings> {
  await wait()
  Object.assign(settings, next)
  return clone(settings)
}

export async function getOverview(): Promise<OverviewStats> {
  await wait()
  const delivered = messages.filter(
    (entry) => entry.status === 'delivered',
  ).length
  const terminal = messages.filter(
    (entry) => entry.status === 'delivered' || entry.status === 'failed',
  ).length

  const sends = new Map<string, number>()
  for (const message of messages) {
    sends.set(message.templateCode, (sends.get(message.templateCode) ?? 0) + 1)
  }

  return {
    messagesSent: messages.length,
    deliveryRate: terminal === 0 ? 0 : Math.round((delivered / terminal) * 100),
    templateCount: templates.length,
    contactCount: contacts.length,
    recentMessages: clone(messages.slice(0, 5)),
    topTemplates: [...sends.entries()]
      .map(([code, count]) => ({
        code,
        name: templates.find((entry) => entry.code === code)?.name ?? code,
        sends: count,
      }))
      .sort((left, right) => right.sends - left.sends)
      .slice(0, 4),
  }
}
