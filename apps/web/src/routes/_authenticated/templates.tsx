import { useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/status-badge'
import type { BadgeTone } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  deleteTemplate,
  duplicateTemplate,
  formatDateTime,
  listTemplates,
} from '@/lib/data'
import type { Template, TemplateKind } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/templates')({
  component: Templates,
})

const KIND_TONE: Record<TemplateKind, BadgeTone> = {
  otp: 'info',
  alert: 'warning',
  campaign: 'brand',
}

function Templates() {
  const queryClient = useQueryClient()
  const templates = useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  })

  const [pendingDelete, setPendingDelete] = useState<Template | null>(null)

  const duplicate = useMutation({
    mutationFn: duplicateTemplate,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast.success('Template duplicated', { description: template.name })
    },
    onError: () => toast.error('Could not duplicate this template'),
  })

  const remove = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      setPendingDelete(null)
      toast.success('Template deleted')
    },
    onError: () => toast.error('Could not delete this template'),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Templates"
        description="Reusable message bodies with typed variables."
      >
        <Button asChild size="sm">
          <Link to="/templates/new">
            <Plus data-icon="inline-start" />
            New template
          </Link>
        </Button>
      </PageHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead className="whitespace-nowrap">Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.data?.length ? (
            templates.data.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <p className="font-medium">{template.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {template.code}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge tone={KIND_TONE[template.kind]} className="uppercase">
                    {template.kind}
                  </Badge>
                </TableCell>
                <TableCell>
                  {template.variables.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {template.variables.map((variable) => (
                        <Badge key={variable} className="font-mono">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">none</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDateTime(template.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {/* Longer forms open a route instead of an end drawer. */}
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        to="/templates/$id/edit"
                        params={{ id: template.id }}
                        aria-label={`Edit ${template.name}`}
                        title="Edit template"
                      >
                        <Pencil />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Duplicate template"
                      aria-label={`Duplicate ${template.name}`}
                      disabled={duplicate.isPending}
                      onClick={() => duplicate.mutate(template.id)}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Delete template"
                      aria-label={`Delete ${template.name}`}
                      onClick={() => setPendingDelete(template)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableEmpty colSpan={5}>
              {templates.isPending
                ? 'Loading templates…'
                : 'No templates yet — create the first one.'}
            </TableEmpty>
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) {
            setPendingDelete(null)
          }
        }}
        title="Delete this template?"
        description={
          pendingDelete
            ? `${pendingDelete.name} (${pendingDelete.code}) — messages already queued keep their body.`
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
