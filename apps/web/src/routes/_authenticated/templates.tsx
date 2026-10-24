import { createFileRoute } from '@tanstack/react-router'

import { SectionPlaceholder } from '@/components/section-placeholder'

export const Route = createFileRoute('/_authenticated/templates')({
  component: Templates,
})

function Templates() {
  return (
    <SectionPlaceholder
      title="Templates"
      description="Reusable message bodies with typed variables."
      emptyTitle="No templates yet"
      emptyDescription="Create a template once, then pass variables on every send."
    />
  )
}
