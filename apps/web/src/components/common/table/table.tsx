import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      role="region"
      aria-label="Scrollable table"
      tabIndex={0}
      className="overflow-x-auto rounded-card border border-border bg-surface"
    >
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}
export function TableHeader(props: ComponentProps<"thead">) {
  return <thead className="bg-surface-soft" {...props} />;
}
export function TableBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}
export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-border last:border-0 hover:bg-background",
        className,
      )}
      {...props}
    />
  );
}
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn("px-6 py-4 font-bold text-primary", className)}
      {...props}
    />
  );
}
export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-6 py-4 leading-6", className)} {...props} />;
}
export function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption
      className={cn(
        "caption-bottom px-6 py-4 text-left text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function TableEmpty({
  colSpan,
  children = "No results yet.",
}: {
  colSpan: number;
  children?: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-12 text-center text-muted-foreground"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}
