import { createFileRoute } from '@tanstack/react-router'

import { SectionPlaceholder } from '@/components/section-placeholder'

export const Route = createFileRoute('/_authenticated/messages')({
  component: Messages,
})

function Messages() {
  return (
    <SectionPlaceholder
      title="Messages"
      description="Every send, tracked from queued to delivered."
      emptyTitle="No messages yet"
      emptyDescription="Outbound messages and their delivery states will be listed here."
    />
  )
}
