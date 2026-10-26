import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Form,
  SelectInput,
  SwitchInput,
  TextInput,
} from '@/components/common/forms'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getSettings, listTemplates, saveSettings } from '@/lib/data'
import type { WorkspaceSettings } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
})

const SETTINGS_SCHEMA = z.object({
  workspaceName: z.string().min(2, 'Workspace name is required'),
  senderId: z
    .string()
    .min(3, 'Sender ID is 3–11 characters')
    .max(11, 'Sender ID is 3–11 characters'),
  defaultTemplateCode: z.string().min(1, 'Pick a default template'),
  monthlyLimit: z.string().regex(/^\d+$/, 'Whole numbers only'),
  deliveryReceipts: z.boolean(),
})

type SettingsValues = z.infer<typeof SETTINGS_SCHEMA>

function Settings() {
  const queryClient = useQueryClient()
  const settings = useQuery({ queryKey: ['settings'], queryFn: getSettings })
  const templates = useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  })

  const save = useMutation({
    mutationFn: (values: SettingsValues) =>
      saveSettings({
        workspaceName: values.workspaceName,
        senderId: values.senderId,
        defaultTemplateCode: values.defaultTemplateCode,
        monthlyLimit: Number(values.monthlyLimit),
        deliveryReceipts: values.deliveryReceipts,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved', {
        description: 'Stored in the mock workspace until the API lands.',
      })
    },
    onError: () => toast.error('Could not save settings'),
  })

  if (!settings.data) {
    return (
      <p className="text-sm text-muted-foreground">
        {settings.isError ? 'Could not load settings.' : 'Loading settings…'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Workspace defaults for outbound sends."
      />

      <SettingsForm
        defaultSettings={settings.data}
        templateOptions={(templates.data ?? []).map((template) => ({
          value: template.code,
          label: template.name,
        }))}
        busy={save.isPending}
        onSubmit={(values) => save.mutate(values)}
      />
    </div>
  )
}

interface SettingsFormProps {
  defaultSettings: WorkspaceSettings
  templateOptions: { value: string; label: string }[]
  busy: boolean
  onSubmit: (values: SettingsValues) => void
}

function SettingsForm({
  defaultSettings,
  templateOptions,
  busy,
  onSubmit,
}: SettingsFormProps) {
  const form = useForm<SettingsValues>({
    resolver: zodResolver(SETTINGS_SCHEMA),
    defaultValues: {
      workspaceName: defaultSettings.workspaceName,
      senderId: defaultSettings.senderId,
      defaultTemplateCode: defaultSettings.defaultTemplateCode,
      monthlyLimit: String(defaultSettings.monthlyLimit),
      deliveryReceipts: defaultSettings.deliveryReceipts,
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-2xl flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>
              What recipients see as the sender.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextInput name="workspaceName" label="Workspace name" required />
            <TextInput
              name="senderId"
              label="Sender ID"
              required
              description="Alphanumeric sender ID registered with the gateway."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
            <CardDescription>Defaults applied to every send.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SelectInput
              name="defaultTemplateCode"
              label="Default template"
              required
              options={templateOptions}
              placeholder="Pick a template"
            />
            <TextInput
              name="monthlyLimit"
              label="Monthly message limit"
              required
              inputMode="numeric"
            />
            <SwitchInput
              name="deliveryReceipts"
              label="Request delivery receipts"
              description="Adds a status callback to every outbound request."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => form.reset()}
          >
            Discard
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
