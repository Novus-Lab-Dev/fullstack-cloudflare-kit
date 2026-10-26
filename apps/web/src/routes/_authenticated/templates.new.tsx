import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { TemplateForm } from '@/components/template-form'
import { Button } from '@/components/ui/button'
import { createTemplate } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/templates/new')({
  component: NewTemplate,
})

function NewTemplate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const create = useMutation({
    mutationFn: createTemplate,
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast.success('Template created', { description: template.code })
      navigate({ to: '/templates' })
    },
    onError: () => toast.error('Could not create this template'),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New template"
        description="Complex forms get a full page — short ones stay in the end drawer."
      >
        <Button asChild variant="ghost" size="sm">
          <Link to="/templates">
            <ArrowLeft data-icon="inline-start" />
            Templates
          </Link>
        </Button>
      </PageHeader>

      <TemplateForm
        submitLabel="Create template"
        busy={create.isPending}
        onSubmit={(draft) => create.mutate(draft)}
        onCancel={() => navigate({ to: '/templates' })}
      />
    </div>
  )
}
