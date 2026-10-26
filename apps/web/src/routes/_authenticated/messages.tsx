import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus, RotateCw, Search, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  SelectInput,
  TextareaInput,
  TextInput,
} from '@/components/common/forms'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { FormDrawer } from '@/components/form-drawer'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createMessage,
  deleteMessage,
  formatDateTime,
  listMessages,
  listTemplates,
  retryMessage,
  smsSegments,
  updateMessage,
} from '@/lib/data'
import type { Message, MessageStatus } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/messages')({
  component: Messages,
})

const MESSAGE_SCHEMA = z.object({
  to: z.string().min(1, 'Recipient is required'),
  templateCode: z.string().optional(),
  body: z.string().min(1, 'Message body is required'),
})

type MessageValues = z.infer<typeof MESSAGE_SCHEMA>

const EMPTY_DRAFT: MessageValues = { to: '', templateCode: '', body: '' }

const STATUS_FILTERS: readonly {
  value: MessageStatus | 'all'
  label: string
}[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
]

type StatusFilter = (typeof STATUS_FILTERS)[number]['value']

function Messages() {
  const queryClient = useQueryClient()
  const messages = useQuery({ queryKey: ['messages'], queryFn: listMessages })
  const templates = useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  })

  const [term, setTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null)

  const form = useForm<MessageValues>({
    resolver: zodResolver(MESSAGE_SCHEMA),
    defaultValues: EMPTY_DRAFT,
  })

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase()
    return (messages.data ?? []).filter((message) => {
      const matchesStatus =
        statusFilter === 'all' || message.status === statusFilter
      const matchesTerm =
        needle.length === 0 ||
        message.to.toLowerCase().includes(needle) ||
        message.body.toLowerCase().includes(needle)
      return matchesStatus && matchesTerm
    })
  }, [messages.data, statusFilter, term])

  const save = useMutation({
    mutationFn: (values: MessageValues & { id: string | null }) => {
      const draft = {
        to: values.to,
        body: values.body,
        templateCode: values.templateCode ?? '',
      }
      return values.id ? updateMessage(values.id, draft) : createMessage(draft)
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      closeDrawer()
      toast.success(editingId ? 'Message updated' : 'Message queued', {
        description: `${message.to} · ${message.segments} segment${message.segments === 1 ? '' : 's'}`,
      })
    },
    onError: () => toast.error('Could not save this message'),
  })

  const retry = useMutation({
    mutationFn: retryMessage,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast.success('Send retried', { description: message.to })
    },
    onError: () => toast.error('Could not retry this send'),
  })

  const remove = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      setPendingDelete(null)
      toast.success('Message deleted')
    },
    onError: () => toast.error('Could not delete this message'),
  })

  function openCreate() {
    setEditingId(null)
    form.reset(EMPTY_DRAFT)
    setIsDrawerOpen(true)
  }

  function openEdit(message: Message) {
    setEditingId(message.id)
    form.reset({
      to: message.to,
      templateCode: message.templateCode,
      body: message.body,
    })
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setEditingId(null)
    form.reset(EMPTY_DRAFT)
  }

  const bodyValue = form.watch('body')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Every send, tracked from queued to delivered."
      >
        <Button size="sm" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          New message
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search recipient or body"
            aria-label="Search messages"
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger
            size="sm"
            className="w-40"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {rows.length} of {messages.data?.length ?? 0}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Body</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="whitespace-nowrap">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {message.to}
                </TableCell>
                <TableCell className="max-w-72 truncate text-muted-foreground">
                  {message.body}
                </TableCell>
                <TableCell>
                  <StatusBadge status={message.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDateTime(message.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {message.status === 'queued' ||
                    message.status === 'failed' ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Retry send"
                        aria-label={`Retry send to ${message.to}`}
                        disabled={retry.isPending}
                        onClick={() => retry.mutate(message.id)}
                      >
                        <RotateCw />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Edit message"
                      aria-label={`Edit message to ${message.to}`}
                      onClick={() => openEdit(message)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Delete message"
                      aria-label={`Delete message to ${message.to}`}
                      onClick={() => setPendingDelete(message)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableEmpty colSpan={5}>
              {messages.isPending
                ? 'Loading messages…'
                : 'No messages match this filter.'}
            </TableEmpty>
          )}
        </TableBody>
      </Table>

      <FormDrawer
        open={isDrawerOpen}
        onOpenChange={(next) => (next ? setIsDrawerOpen(true) : closeDrawer())}
        title={editingId ? 'Edit message' : 'New message'}
        description="Mock dispatch — the send lands in the queue and can be retried from its row."
        form={form}
        busy={save.isPending}
        submitLabel={editingId ? 'Save changes' : 'Queue message'}
        onSubmit={(values) => save.mutate({ ...values, id: editingId })}
      >
        <TextInput
          name="to"
          label="Recipient"
          placeholder="+8801700000000"
          required
          description="Numbers are not validated while the API is mocked."
        />
        <SelectInput
          name="templateCode"
          label="Template"
          placeholder="Send free-form text"
          options={(templates.data ?? []).map((template) => ({
            value: template.code,
            label: template.name,
          }))}
          description="Optional — reuse a saved template's wording."
        />
        <TextareaInput
          name="body"
          label="Message body"
          rows={5}
          required
          description={`${bodyValue.length} characters · ${smsSegments(bodyValue)} segment${smsSegments(bodyValue) === 1 ? '' : 's'} of 160`}
        />
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) {
            setPendingDelete(null)
          }
        }}
        title="Delete this message?"
        description={
          pendingDelete
            ? `${pendingDelete.to} — this removes the record from the mock queue.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        busy={remove.isPending}
        onConfirm={() => {
          if (pendingDelete) {
            remove.mutate(pendingDelete.id)
          }
        }}
      />
    </div>
  )
}
