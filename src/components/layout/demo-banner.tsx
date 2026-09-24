import { Info } from "lucide-react"

export function DemoBanner() {
  return (
    <div className="border-b border-primary/20 bg-primary/8 text-foreground">
      <div className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 text-sm sm:items-center sm:px-6 lg:px-8">
        <Info className="text-primary mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
        <p className="leading-snug">
          <span className="font-semibold">Portfolio demo</span>
          <span className="text-muted-foreground">
            {" "}
            — guest mode, no login. Products, Marketplace, and Video Generator
            hit the live API. Orders, Analytics, and Upload History show sample
            data.
          </span>
        </p>
      </div>
    </div>
  )
}
