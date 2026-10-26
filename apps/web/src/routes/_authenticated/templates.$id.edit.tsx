import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { TemplateForm } from '@/components/template-form'
import { Button } from '@/components/ui/button'
import { getTemplate, updateTemplate } from '@/lib/data'
import type { TemplateDraft } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/templates/$id/edit')({
  component: EditTemplate,
})

function EditTemplate() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const template = useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id),
  })

  const update = useMutation({
    mutationFn: (draft: TemplateDraft) => updateTemplate(id, draft),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['template'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast.success('Template updated', { description: saved.code })
      navigate({ to: '/templates' })
    },
    onError: () => toast.error('Could not update this template'),
  })

  const backLink = (
    <Button asChild variant="ghost" size="sm">
      <Link to="/templates">
        <ArrowLeft data-icon="inline-start" />
        Templates
      </Link>
    </Button>
  )

  if (template.isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading template…
      </div>
    )
  }

  if (template.isError) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Edit template"
          description="This template is no longer in the mock store."
        >
          {backLink}
        </PageHeader>
        <p className="text-sm text-danger">{template.error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${template.data.name}`}
        description="Changes apply to future sends only."
      >
        {backLink}
      </PageHeader>

      <TemplateForm
        key={template.data.id}
        defaultTemplate={template.data}
        submitLabel="Save changes"
        busy={update.isPending}
        onSubmit={(draft) => update.mutate(draft)}
        onCancel={() => navigate({ to: '/templates' })}
      />
    </div>
  )
}
