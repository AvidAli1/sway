import React from "react"
import StatCard from "./StatCard"
import { Package, Users, ShoppingBag, TrendingUp } from "lucide-react"

export default function Overview() {
  const stats = {
    totalBrands: 156,
    activeUsers: "12,543",
    totalOrders: "8,921",
    revenue: "PKR 2.1M",
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Brands" value={stats.totalBrands} icon={Package} color="blue" />
        <StatCard title="Active Users" value={stats.activeUsers} icon={Users} color="green" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="purple" />
        <StatCard title="Platform Revenue" value={stats.revenue} icon={TrendingUp} color="yellow" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New brand registered", brand: "Fashion Forward", time: "2 hours ago" },
            { action: "Support ticket resolved", brand: "Urban Style", time: "4 hours ago" },
            { action: "Payment processed", brand: "Street Wear", time: "6 hours ago" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.brand}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
