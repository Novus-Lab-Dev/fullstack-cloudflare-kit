import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/table'
import { PageHeader } from '@/components/page-header'
import { Badge, StatusBadge } from '@/components/status-badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime, getOverview, listContacts } from '@/lib/data'
import type { Contact } from '@/lib/data'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const overview = useQuery({ queryKey: ['overview'], queryFn: getOverview })
  const stats = overview.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Mock workspace snapshot — every number below comes from lib/data.ts."
        breadcrumbs={<DashboardBreadcrumbs />}
      >
        <ButtonLink to="/messages">Send a message</ButtonLink>
        <ButtonLink to="/templates/new" variant="outline">
          New template
        </ButtonLink>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Messages"
          value={stats?.messagesSent}
          hint="All statuses"
        />
        <StatCard
          label="Delivery rate"
          value={stats?.deliveryRate}
          suffix="%"
          hint="Delivered of terminal sends"
        />
        <StatCard
          label="Templates"
          value={stats?.templateCount}
          hint="Available for reuse"
        />
        <StatCard
          label="Contacts"
          value={stats?.contactCount}
          hint="Reachable numbers"
        />
      </div>

      <Tabs defaultValue="activity" className="gap-4">
        <TabsList variant="line">
          <TabsTrigger value="activity">Recent messages</TabsTrigger>
          <TabsTrigger value="templates">Top templates</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <SectionHeading to="/messages" label="View all">
            Recent messages
          </SectionHeading>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recentMessages.length ? (
                stats.recentMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {message.to}
                    </TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">
                      {message.body}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={message.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(message.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty colSpan={4}>
                  {overview.isPending
                    ? 'Loading activity…'
                    : 'No messages yet.'}
                </TableEmpty>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="templates">
          <SectionHeading to="/templates" label="Manage templates">
            Top templates
          </SectionHeading>

          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
              {stats?.topTemplates.length ? (
                stats.topTemplates.map((template) => (
                  <div key={template.code} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {template.name}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {template.code}
                      </p>
                    </div>
                    <Badge tone="brand">{template.sends} sends</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {overview.isPending
                    ? 'Loading templates…'
                    : 'No template activity yet.'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <SectionHeading to="/contacts" label="Manage contacts">
            Contacts
          </SectionHeading>

          <ContactsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Home / Dashboard trail shown above the page title. */
function DashboardBreadcrumbs() {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function SectionHeading({
  to,
  label,
  children,
}: {
  to: '/messages' | '/templates' | '/contacts'
  label: string
  children: string
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">{children}</h3>
      <Link
        to={to}
        className="text-sm font-medium text-primary hover:underline"
      >
        {label}
      </Link>
    </div>
  )
}

function ContactsTab() {
  const contacts = useQuery({ queryKey: ['contacts'], queryFn: listContacts })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.data?.length ? (
          contacts.data.map((contact: Contact) => (
            <TableRow key={contact.id}>
              <TableCell className="whitespace-nowrap font-medium">
                {contact.name}
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {contact.phone}
              </TableCell>
              <TableCell>{contact.group}</TableCell>
              <TableCell>
                {contact.optedOut ? (
                  <Badge tone="danger">Opted out</Badge>
                ) : (
                  <Badge tone="success">Reachable</Badge>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableEmpty colSpan={4}>
            {contacts.isPending ? 'Loading contacts…' : 'No contacts yet.'}
          </TableEmpty>
        )}
      </TableBody>
    </Table>
  )
}

function StatCard({
  label,
  value,
  suffix,
  hint,
}: {
  label: string
  value: number | undefined
  suffix?: string
  hint: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">
          {value === undefined ? '—' : `${value}${suffix ?? ''}`}
        </CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function ButtonLink({
  to,
  variant = 'default',
  children,
}: {
  to: '/messages' | '/templates/new'
  variant?: 'default' | 'outline'
  children: string
}) {
  return (
    <Button asChild variant={variant} size="sm">
      <Link to={to}>{children}</Link>
    </Button>
  )
}
