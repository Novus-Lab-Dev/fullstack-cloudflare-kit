import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SectionPlaceholderProps {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
}

/** Shared scaffold for route sections that have no feature UI yet. */
export function SectionPlaceholder({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: SectionPlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
