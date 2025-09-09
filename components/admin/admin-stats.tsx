import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Calendar, CreditCard, TrendingUp, TrendingDown } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalCars: number
    totalUsers: number
    totalBookings: number
    activeBookings: number
    monthlyRevenue: number
    revenueChange: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCars}</div>
          <p className="text-xs text-muted-foreground">Fleet vehicles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Registered customers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeBookings}</div>
          <p className="text-xs text-muted-foreground">Currently rented</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">GH₵ {stats.monthlyRevenue.toLocaleString()}</div>
          <div className="flex items-center text-xs">
            {stats.revenueChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={stats.revenueChange >= 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(stats.revenueChange)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
