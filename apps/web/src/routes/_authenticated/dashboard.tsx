import { createFileRoute } from '@tanstack/react-router'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

const STATS = [
  { label: 'Messages sent', hint: 'Last 30 days' },
  { label: 'Delivery rate', hint: 'Accepted by carriers' },
  { label: 'Active templates', hint: 'Ready to send' },
  { label: 'Contacts', hint: 'Reachable numbers' },
] as const

function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivery overview for your SMS workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">—</CardTitle>
              <CardDescription>{stat.hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
