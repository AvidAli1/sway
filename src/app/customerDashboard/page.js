"use client"

import { useState, useEffect } from "react"
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  ArrowLeft,
  Bell,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Import customer dashboard components
import ProfileSettings from "./components/ProfileSettings"
import OrderHistory from "./components/OrderHistory"
import Wishlist from "./components/WishList"
import AddressBook from "./components/AddressBook"
import PaymentMethods from "./components/PaymentMethods"
import MyReviews from "./components/MyReviews"
import Support from "./components/Support"

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [stats, setStats] = useState({
    totalOrders: 24,
    pendingOrders: 2,
    deliveredOrders: 20,
    wishlistItems: 8,
    reviewsWritten: 12,
    loyaltyPoints: 450,
  })

  // Mock user data - in real app, this would come from authentication
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === "customer") {
        setUser(parsedUser)
      } else {
        // Redirect non-customer users
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
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag, count: stats.totalOrders },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: stats.wishlistItems },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "reviews", label: "My Reviews", icon: Star, count: stats.reviewsWritten },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ]

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings user={user} />
      case "orders":
        return <OrderHistory />
      case "wishlist":
        return <Wishlist />
      case "addresses":
        return <AddressBook />
      case "payments":
        return <PaymentMethods />
      case "reviews":
        return <MyReviews />
      case "support":
        return <Support />
      default:
        return <ProfileSettings user={user} />
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
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Continue Shopping Button */}
              <Link
                href="/"
                className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Shop</span>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-black transition-colors">
                <Bell className="w-6 h-6" />
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => setActiveTab("profile")}
                className="p-2 text-gray-600 hover:text-black transition-colors"
              >
                <Settings className="w-6 h-6" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-2">
                  <span className="text-sm font-semibold text-black">{user.name?.[0] || "U"}</span>
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
        {/* Welcome Section & Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
                <p className="text-gray-600">Manage your orders, wishlist, and account settings</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.loyaltyPoints}</div>
                  <div className="text-sm text-gray-600">Loyalty Points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Package className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Wishlist</p>
                  <p className="text-xl font-bold text-gray-900">{stats.wishlistItems}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <Heart className="w-5 h-5" />
                </div>
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
                    {item.count && (
                      <span className={`text-sm ${activeTab === item.id ? "text-black" : "text-gray-500"}`}>
                        {item.count}
                      </span>
                    )}
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
