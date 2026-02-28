"use client"

import { useState, useEffect, useRef } from "react"
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
  User,
  LayoutDashboard,
  ChevronDown,
  MessageSquare,
  AlertTriangle,
  Send,
  X,
  Wallet,
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
import BrandComplaints from "./components/BrandComplaints"
import BrandWallet from "./components/BrandWallet"

export default function BrandDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("products")
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    newOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalReviews: 0,
    pendingReturns: 0,
  })

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportFormData, setReportFormData] = useState({
    type: "Website",
    subject: "",
    description: "",
    order: ""
  })

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setReportSubmitting(true)

    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportFormData)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsReportModalOpen(false)
        setReportFormData({ type: "Website", subject: "", description: "", order: "" })
        // Trigger refresh in BrandComplaints component
        window.dispatchEvent(new Event('refreshBrandComplaints'))
      } else {
        alert(data.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("An error occurred while submitting the report.")
    } finally {
      setReportSubmitting(false)
    }
  }

  // Mock user data - in real app, this would come from authentication
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsed = JSON.parse(userData)
      // support both old shape (raw user) and new saved session shape ({ user, token, ... })
      const sessionUser = parsed?.user || parsed
      if (sessionUser?.role === "brand" || sessionUser?.role === "customer") {
        setUser(sessionUser)
      } else {
        // Redirect non-brand users
        router.push("/")
      }
    } else {
      // Redirect unauthenticated users
      router.push("/login")
    }
  }, [router])

  // Fetch orders and calculate stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
        if (!token) return

        // Fetch Orders
        const ordersPromise = fetch("/api/brand/orders", {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Fetch Product Stats
        const productsPromise = fetch("/api/brand/products/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const [ordersRes, productsRes] = await Promise.all([ordersPromise, productsPromise])

        // Process Orders
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          if (data.success && data.orders) {
            const orders = data.orders

            // Calculate stats from orders
            const newOrders = orders.filter((order) => order.status === "pending").length
            const pendingStatuses = ["confirmed", "processing", "shipped", "out_for_delivery"]
            const pendingOrders = orders.filter((order) => pendingStatuses.includes(order.status)).length
            const deliveredOrders = orders.filter((order) => order.status === "delivered").length

            // Calculate total revenue from delivered orders
            const totalRevenue = orders
              .filter((order) => order.status === "delivered")
              .reduce((sum, order) => sum + (order.brandSubtotal || order.total || 0), 0)

            setStats((prev) => ({
              ...prev,
              newOrders,
              pendingOrders,
              deliveredOrders,
              totalRevenue,
            }))
          }
        }

        // Process Product Stats
        if (productsRes.ok) {
          const data = await productsRes.json()
          if (data.success && data.stats) {
            setStats((prev) => ({
              ...prev,
              totalProducts: data.stats.totalProducts || 0,
              avgRating: data.stats.avgRating || 0,
              totalReviews: data.stats.totalReviews || 0
            }))
          }
        }

      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    router.push("/")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b h-16 w-full animate-pulse"></header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 h-24 border border-gray-100">
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64">
              <div className="bg-white rounded-lg p-4 space-y-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-10 w-full bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg p-6 min-h-[400px]">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 w-full bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const navigationItems = [
    { id: "products", label: "Products", icon: Package, count: stats.totalProducts },
    { id: "newOrders", label: "New Orders", icon: ShoppingBag, count: stats.newOrders, badge: true },
    { id: "pendingOrders", label: "Pending Orders", icon: Clock, count: stats.pendingOrders },
    { id: "deliveredOrders", label: "Delivered Orders", icon: CheckCircle, count: stats.deliveredOrders },
    { id: "wallet", label: "Wallet & Finances", icon: Wallet, count: 0 },
    { id: "reviews", label: "Reviews", icon: Star, count: stats.totalReviews },
    { id: "returns", label: "Returns & Refunds", icon: RefreshCw, count: stats.pendingReturns, badge: true },
    { id: "complaints", label: "Complaints", icon: MessageSquare, count: 0 },
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
      case "wallet":
        return <BrandWallet />
      case "reviews":
        return <Reviews />
      case "returns":
        return <ReturnsRefunds />
      case "complaints":
        return <BrandComplaints />
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
              <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors transform translate-y-0.5">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium mr-4">Back to Store</span>
                <span className="sm:hidden">Back</span>
              </button>
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
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 transition-colors bg-transparent"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-900">{user.brand_name || user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/brandDashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-yellow-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id ? "bg-yellow-400 text-black" : "text-gray-600 hover:bg-gray-100"
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

      {/* Floating Report Button */}
      <button
        onClick={() => setIsReportModalOpen(true)}
        className="fixed bottom-8 left-8 bg-yellow-400 text-black p-4 rounded-full shadow-lg hover:bg-yellow-500 hover:shadow-xl hover:-translate-y-1 transition-all z-50 flex items-center justify-center group"
      >
        <AlertTriangle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden ml-0 opacity-0 group-hover:max-w-[200px] group-hover:ml-3 group-hover:opacity-100 transition-all duration-300 ease-in-out font-bold whitespace-nowrap">
          Report Issue
        </span>
      </button>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500 w-6 h-6" />
                Report an Issue
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                If you have experienced an issue with the platform, a customer, or an order, please detail it below.
                Our support team will review it and get back to you.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                <select
                  value={reportFormData.type}
                  onChange={(e) => setReportFormData({ ...reportFormData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-white"
                >
                  <option value="Website">Platform / Dashboard Issue</option>
                  <option value="Order">Order Dispute</option>
                  <option value="Customer">Customer Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {reportFormData.type === "Order" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                  <input
                    type="text"
                    required
                    value={reportFormData.order}
                    onChange={(e) => setReportFormData({ ...reportFormData, order: e.target.value })}
                    placeholder="e.g. ORD-20240101-123456"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={reportFormData.subject}
                  onChange={(e) => setReportFormData({ ...reportFormData, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  placeholder="Brief summary..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description Details</label>
                <textarea
                  required
                  rows={5}
                  value={reportFormData.description}
                  onChange={(e) => setReportFormData({ ...reportFormData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  placeholder="Please provide all relevant details..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className={`px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors focus:outline-none flex items-center gap-2 ${reportSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Send className="w-4 h-4" />
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
