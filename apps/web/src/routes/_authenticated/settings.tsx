import { createFileRoute } from '@tanstack/react-router'

import { SectionPlaceholder } from '@/components/section-placeholder'

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
})

function Settings() {
  return (
    <SectionPlaceholder
      title="Settings"
      description="Workspace, API keys and delivery preferences."
      emptyTitle="Nothing to configure yet"
      emptyDescription="API keys, sender IDs and webhooks will be managed from this page."
    />
  )
}
