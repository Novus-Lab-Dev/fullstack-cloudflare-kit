import type { ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { Form } from '@/components/common/forms'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface FormDrawerProps<TValues extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  /** Owned by the caller: create it with `useForm`, `reset()` it when opening. */
  form: UseFormReturn<TValues>
  onSubmit: (values: TValues) => void
  submitLabel?: string
  busy?: boolean
  children: ReactNode
}

/**
 * FormDrawer.
 *
 * End drawer for short create/edit forms — up to roughly five fields. Anything
 * longer (multi-step, nested collections, side-by-side preview) belongs on its
 * own route instead.
 */
export function FormDrawer<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  submitLabel = 'Save',
  busy = false,
  children,
}: FormDrawerProps<TValues>) {
  return (
    <Sheet open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <SheetContent side="right" className="gap-0 p-0">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              {children}
            </div>

            <SheetFooter className="border-t border-border">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : submitLabel}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
