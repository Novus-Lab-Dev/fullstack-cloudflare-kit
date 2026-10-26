import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Form,
  SelectInput,
  SwitchInput,
  TextInput,
  TextareaInput,
} from '@/components/common/forms'
import { Badge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { smsSegments } from '@/lib/data'
import type { Template, TemplateDraft } from '@/lib/data'

export const TEMPLATE_KIND_OPTIONS = [
  { value: 'otp', label: 'OTP' },
  { value: 'alert', label: 'Alert' },
  { value: 'campaign', label: 'Campaign' },
] as const

const TEMPLATE_SCHEMA = z.object({
  name: z.string().min(2, 'Give the template a recognisable name'),
  code: z
    .string()
    .min(2, 'Code is required')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Lowercase letters, digits and underscores only',
    ),
  kind: z.enum(['otp', 'alert', 'campaign']),
  body: z.string().min(1, 'Message body is required'),
  variables: z.string(),
  trackDelivery: z.boolean(),
})

type TemplateValues = z.infer<typeof TEMPLATE_SCHEMA>

const EMPTY_TEMPLATE: TemplateValues = {
  name: '',
  code: '',
  kind: 'alert',
  body: '',
  variables: '',
  trackDelivery: false,
}

function toValues(template: Template): TemplateValues {
  return {
    name: template.name,
    code: template.code,
    kind: template.kind,
    body: template.body,
    variables: template.variables.join(', '),
    trackDelivery: template.trackDelivery,
  }
}

function parseVariables(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ]
}

interface TemplateFormProps {
  submitLabel: string
  defaultTemplate?: Template
  busy?: boolean
  onSubmit: (draft: TemplateDraft) => void
  onCancel: () => void
}

/**
 * TemplateForm.
 *
 * The reference for a full-page form: grouped cards, a live preview that
 * reacts through `form.watch`, and enough fields that a drawer would be
 * cramped.
 */
export function TemplateForm({
  submitLabel,
  defaultTemplate,
  busy = false,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const form = useForm<TemplateValues>({
    resolver: zodResolver(TEMPLATE_SCHEMA),
    defaultValues: defaultTemplate ? toValues(defaultTemplate) : EMPTY_TEMPLATE,
  })

  const body = form.watch('body')
  const variables = parseVariables(form.watch('variables'))
  const segments = smsSegments(body)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            name: values.name,
            code: values.code,
            kind: values.kind,
            body: values.body,
            variables: parseVariables(values.variables),
            trackDelivery: values.trackDelivery,
          }),
        )}
        className="flex flex-col gap-6"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
              <CardDescription>
                How the template is named and addressed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TextInput
                name="name"
                label="Name"
                required
                placeholder="Login OTP"
              />
              <TextInput
                name="code"
                label="Code"
                required
                placeholder="otp_login"
                description="Used as template_code in API requests."
              />
              <SelectInput
                name="kind"
                label="Kind"
                required
                options={TEMPLATE_KIND_OPTIONS}
                description="Campaign traffic requires an opt-out line."
              />
              <SwitchInput
                name="trackDelivery"
                label="Track delivery receipts"
                description="Ask the gateway for per-message status updates."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Body text and the variables it expects.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TextareaInput
                name="body"
                label="Message body"
                required
                rows={5}
                placeholder="Your login code is {{code}}."
                description={`${body.length} characters · ${segments} segment${segments === 1 ? '' : 's'} of 160`}
              />
              <TextInput
                name="variables"
                label="Variables"
                placeholder="code, ttl"
                description="Comma separated names used in the body."
              />

              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview
                </p>
                <p className="text-sm break-words whitespace-pre-wrap">
                  {body.length
                    ? body.replace(
                        /\{\{\s*([^}]+?)\s*\}\}/g,
                        (_match, name: string) => `[${name}]`,
                      )
                    : 'Nothing to preview yet.'}
                </p>
                {variables.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((variable) => (
                      <Badge
                        key={variable}
                        tone="neutral"
                        className="font-mono"
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
