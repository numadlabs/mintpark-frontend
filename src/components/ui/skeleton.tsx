import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-neutral400 dark:bg-slate-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
