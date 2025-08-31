"use client"

import { useState, useEffect } from "react"
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Star,
  RefreshCw,
  Plus,
  TrendingUp,
  ArrowLeft,
  Bell,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Import dashboard components
import ProductsList from "./components/ProductsList"
import NewOrders from "./components/NewOrders"
import PendingOrders from "./components/PendingOrders"
import DeliveredOrders from "./components/DeliveredOrders"
import Reviews from "./components/Reviews"
import ReturnsRefunds from "./components/ReturnsRefunds"

export default function BrandDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("products")
  const [stats, setStats] = useState({
    totalProducts: 45,
    newOrders: 12,
    pendingOrders: 8,
    deliveredOrders: 156,
    totalRevenue: 125000,
    avgRating: 4.6,
    totalReviews: 89,
    pendingReturns: 3,
  })

  // Mock user data - in real app, this would come from authentication
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === "brand" || parsedUser.role === "customer") {
        setUser(parsedUser)
      } else {
        // Redirect non-brand users
        router.push("/")
      }
    } else {
      // Redirect unauthenticated users
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const navigationItems = [
    { id: "products", label: "Products", icon: Package, count: stats.totalProducts },
    { id: "newOrders", label: "New Orders", icon: ShoppingBag, count: stats.newOrders, badge: true },
    { id: "pendingOrders", label: "Pending Orders", icon: Clock, count: stats.pendingOrders },
    { id: "deliveredOrders", label: "Delivered Orders", icon: CheckCircle, count: stats.deliveredOrders },
    { id: "reviews", label: "Reviews", icon: Star, count: stats.totalReviews },
    { id: "returns", label: "Returns & Refunds", icon: RefreshCw, count: stats.pendingReturns, badge: true },
  ]

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsList />
      case "newOrders":
        return <NewOrders />
      case "pendingOrders":
        return <PendingOrders />
      case "deliveredOrders":
        return <DeliveredOrders />
      case "reviews":
        return <Reviews />
      case "returns":
        return <ReturnsRefunds />
      default:
        return <ProductsList />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium mr-4">Back to Store</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Add Product Button */}
              <Link
                href="/uploadProduct"
                className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-black transition-colors">
                <Bell className="w-6 h-6" />
                {stats.newOrders + stats.pendingReturns > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {stats.newOrders + stats.pendingReturns}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-black transition-colors">
                <Settings className="w-6 h-6" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-2">
                  <span className="text-sm font-semibold text-black">{(user.brand_name || user.name)?.[0] || "B"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">PKR {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${activeTab === item.id ? "text-black" : "text-gray-500"}`}>
                        {item.count}
                      </span>
                      {item.badge && item.count > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderActiveComponent()}</div>
        </div>
      </div>
    </div>
  )
}
