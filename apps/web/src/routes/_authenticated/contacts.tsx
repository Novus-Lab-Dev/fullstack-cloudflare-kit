import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  InputCheckbox,
  SelectInput,
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
import { Badge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CONTACT_GROUPS,
  createContact,
  deleteContact,
  listContacts,
} from '@/lib/data'
import type { Contact } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/contacts')({
  component: Contacts,
})

const CONTACT_SCHEMA = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(6, 'Enter the full number'),
  group: z.string().min(1, 'Pick a group'),
  optedOut: z.boolean(),
})

type ContactValues = z.infer<typeof CONTACT_SCHEMA>

const EMPTY_CONTACT: ContactValues = {
  name: '',
  phone: '',
  group: 'Students',
  optedOut: false,
}

function Contacts() {
  const queryClient = useQueryClient()
  const contacts = useQuery({ queryKey: ['contacts'], queryFn: listContacts })

  const [term, setTerm] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null)

  const form = useForm<ContactValues>({
    resolver: zodResolver(CONTACT_SCHEMA),
    defaultValues: EMPTY_CONTACT,
  })

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase()
    if (!needle) {
      return contacts.data ?? []
    }
    return (contacts.data ?? []).filter(
      (contact) =>
        contact.name.toLowerCase().includes(needle) ||
        contact.phone.toLowerCase().includes(needle),
    )
  }, [contacts.data, term])

  const create = useMutation({
    mutationFn: (values: ContactValues) => createContact(values),
    onSuccess: (contact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      closeDrawer()
      toast.success('Contact added', { description: contact.phone })
    },
    onError: () => toast.error('Could not add this contact'),
  })

  const remove = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      setPendingDelete(null)
      toast.success('Contact removed')
    },
    onError: () => toast.error('Could not remove this contact'),
  })

  function openCreate() {
    form.reset(EMPTY_CONTACT)
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    form.reset(EMPTY_CONTACT)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contacts"
        description="Recipients and their reachable numbers."
      >
        <Button size="sm" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Add contact
        </Button>
      </PageHeader>

      <div className="relative min-w-56 flex-1 sm:max-w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search name or number"
          aria-label="Search contacts"
          className="pl-8"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Consent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {contact.phone}
                </TableCell>
                <TableCell>
                  <Badge tone="neutral">{contact.group}</Badge>
                </TableCell>
                <TableCell>
                  {contact.optedOut ? (
                    <Badge tone="danger">Opted out</Badge>
                  ) : (
                    <Badge tone="success">Opted in</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Remove contact"
                      aria-label={`Remove ${contact.name}`}
                      onClick={() => setPendingDelete(contact)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableEmpty colSpan={5}>
              {contacts.isPending
                ? 'Loading contacts…'
                : 'No contacts match this search.'}
            </TableEmpty>
          )}
        </TableBody>
      </Table>

      <FormDrawer
        open={isDrawerOpen}
        onOpenChange={(next) => (next ? setIsDrawerOpen(true) : closeDrawer())}
        title="Add contact"
        description="A short form: four fields fit in the end drawer instead of a page."
        form={form}
        busy={create.isPending}
        submitLabel="Add contact"
        onSubmit={(values) => create.mutate(values)}
      >
        <TextInput
          name="name"
          label="Name"
          required
          placeholder="Ayesha Rahman"
        />
        <TextInput
          name="phone"
          label="Phone"
          required
          placeholder="+8801700000000"
          description="Numbers are not validated while the API is mocked."
        />
        <SelectInput
          name="group"
          label="Group"
          required
          options={CONTACT_GROUPS.map((group) => ({
            value: group,
            label: group,
          }))}
        />
        <InputCheckbox
          name="optedOut"
          label="Contact has opted out of marketing sends"
        />
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) {
            setPendingDelete(null)
          }
        }}
        title="Remove this contact?"
        description={
          pendingDelete
            ? `${pendingDelete.name} — ${pendingDelete.phone}`
            : undefined
        }
        confirmLabel="Remove"
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
