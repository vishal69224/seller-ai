import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const bars = [
  { label: "Jan", height: 42 },
  { label: "Feb", height: 58 },
  { label: "Mar", height: 45 },
  { label: "Apr", height: 72 },
  { label: "May", height: 65 },
  { label: "Jun", height: 88 },
  { label: "Jul", height: 78 },
  { label: "Aug", height: 92 },
  { label: "Sep", height: 70 },
  { label: "Oct", height: 85 },
  { label: "Nov", height: 95 },
  { label: "Dec", height: 82 },
]

export function SalesChart() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly revenue across all marketplaces</CardDescription>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Revenue
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex h-64 items-end gap-2 sm:gap-3">
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-between"
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-border/60 border-t border-dashed" />
            ))}
          </div>

          {bars.map((bar) => (
            <div
              key={bar.label}
              className="group relative z-10 flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all duration-300 group-hover:to-primary/80 group-hover:shadow-[0_0_20px_-4px] group-hover:shadow-primary/40"
                  style={{ height: `${bar.height}%` }}
                  title={`${bar.label}: $${(bar.height * 120).toLocaleString()}`}
                />
              </div>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                {bar.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
          <div>
            <p className="text-muted-foreground text-xs">This month</p>
            <p className="font-display mt-0.5 text-lg font-semibold">$48.2k</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Avg. order</p>
            <p className="font-display mt-0.5 text-lg font-semibold">$86.40</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Conversion</p>
            <p className="font-display mt-0.5 text-lg font-semibold">3.8%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
