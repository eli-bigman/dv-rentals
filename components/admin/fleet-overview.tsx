import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Car, Wrench, CheckCircle, XCircle } from "lucide-react"

interface FleetOverviewProps {
  fleetData: Array<{
    status: string
  }>
}

export function FleetOverview({ fleetData }: FleetOverviewProps) {
  const statusCounts = fleetData.reduce(
    (acc, car) => {
      acc[car.status] = (acc[car.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const total = fleetData.length
  const available = statusCounts.available || 0
  const rented = statusCounts.rented || 0
  const maintenance = statusCounts.maintenance || 0
  const retired = statusCounts.retired || 0

  const availabilityRate = total > 0 ? (available / total) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 text-secondary p-2 rounded-full">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{available}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-full">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{rented}</p>
            <p className="text-sm text-muted-foreground">Rented</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 text-accent p-2 rounded-full">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{maintenance}</p>
            <p className="text-sm text-muted-foreground">Maintenance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 text-destructive p-2 rounded-full">
            <XCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{retired}</p>
            <p className="text-sm text-muted-foreground">Retired</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Fleet Availability</span>
          <span className="text-sm text-muted-foreground">{availabilityRate.toFixed(1)}%</span>
        </div>
        <Progress value={availabilityRate} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default">Available</Badge>
          </div>
          <span className="text-sm">{available} cars</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Rented</Badge>
          </div>
          <span className="text-sm">{rented} cars</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Maintenance</Badge>
          </div>
          <span className="text-sm">{maintenance} cars</span>
        </div>
      </div>
    </div>
  )
}
