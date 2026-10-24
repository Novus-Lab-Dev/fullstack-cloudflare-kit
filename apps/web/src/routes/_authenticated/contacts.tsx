import { createFileRoute } from '@tanstack/react-router'

import { SectionPlaceholder } from '@/components/section-placeholder'

export const Route = createFileRoute('/_authenticated/contacts')({
  component: Contacts,
})

function Contacts() {
  return (
    <SectionPlaceholder
      title="Contacts"
      description="Recipients and their reachable numbers."
      emptyTitle="No contacts yet"
      emptyDescription="Imported or created contacts will appear here."
    />
  )
}
