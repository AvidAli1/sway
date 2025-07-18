"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingBag, Clock, Star, RefreshCw, Plus, TrendingUp, Users, AlertTriangle } from "lucide-react"
import Image from 'next/image';

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock user data - in real app, this would come from authentication
  useEffect(() => {
    // Simulate getting user from auth context
    setUser({
      name: "Urban Style",
      type: "brand", // or "customer" or "admin"
      email: "contact@urbanstyle.com",
    })
  }, [])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (user.type === "brand") {
    return <BrandDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
  } else if (user.type === "customer") {
    return <CustomerDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
  } else {
    return <AdminDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
  }
}

function BrandDashboard({ user, activeTab, setActiveTab }) {
  const [stats] = useState({
    totalProducts: 45,
    newOrders: 12,
    pendingOrders: 8,
    deliveredOrders: 156,
    totalRevenue: 125000,
    avgRating: 4.6,
  })

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: AlertTriangle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="blue" />
                  <StatCard title="New Orders" value={stats.newOrders} icon={ShoppingBag} color="green" />
                  <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} color="yellow" />
                  <StatCard
                    title="Total Revenue"
                    value={`PKR ${stats.totalRevenue.toLocaleString()}`}
                    icon={TrendingUp}
                    color="purple"
                  />
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #SW{1000 + order}</p>
                          <p className="text-sm text-gray-600">Customer Name • 2 items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">PKR 3,500</p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Your Products</h3>
                  <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                    Add New Product
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((product) => (
                    <div key={product} className="border rounded-lg overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        alt="Product"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-medium">Product Name {product}</h4>
                        <p className="text-gray-600 text-sm">PKR 2,500</p>
                        <p className="text-sm text-gray-500">Stock: 25</p>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 bg-gray-100 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-200">
                            Edit
                          </button>
                          <button className="flex-1 bg-red-100 text-red-700 py-1 px-3 rounded text-sm hover:bg-red-200">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Management</h3>
                  <div className="space-y-4">
                    {[
                      { id: "SW1001", customer: "John Doe", items: 2, total: 3500, status: "pending" },
                      { id: "SW1002", customer: "Jane Smith", items: 1, total: 2500, status: "processing" },
                      { id: "SW1003", customer: "Mike Johnson", items: 3, total: 7500, status: "shipped" },
                      { id: "SW1004", customer: "Sarah Wilson", items: 1, total: 1800, status: "delivered" },
                    ].map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {order.customer} • {order.items} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">PKR {order.total.toLocaleString()}</p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "shipped"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomerDashboard({ user, activeTab, setActiveTab }) {
  const tabs = [
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Star },
    { id: "profile", label: "Profile", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Order History</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #SW{2000 + order}</p>
                        <p className="text-sm text-gray-600">Placed on Dec {order + 10}, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">PKR 3,500</p>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Delivered
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ user, activeTab, setActiveTab }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "brands", label: "Brands", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "support", label: "Support", icon: RefreshCw },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Platform Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Brands" value="156" icon={Package} color="blue" />
                  <StatCard title="Active Users" value="12,543" icon={Users} color="green" />
                  <StatCard title="Total Orders" value="8,921" icon={ShoppingBag} color="purple" />
                  <StatCard title="Platform Revenue" value="PKR 2.1M" icon={TrendingUp} color="yellow" />
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
            )}

            {activeTab === "brands" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Brand Management</h3>
                <div className="space-y-4">
                  {[
                    { name: "Urban Style", status: "active", products: 45, revenue: 125000 },
                    { name: "Street Wear", status: "active", products: 32, revenue: 89000 },
                    { name: "Fashion Forward", status: "pending", products: 0, revenue: 0 },
                  ].map((brand, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-gray-600">
                          {brand.products} products • PKR {brand.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            brand.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
