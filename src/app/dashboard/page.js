"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingBag, Users, RefreshCw, TrendingUp } from "lucide-react"
import Overview from "./components/Overview"
import BrandsPanel from "./components/BrandsPanel"
import UsersPanel from "./components/UsersPanel"
import SupportPanel from "./components/SupportPanel"
import StatCard from "./components/StatCard"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock admin user for this page — admin-only dashboard
  useEffect(() => {
    setUser({ name: "Platform Admin", type: "admin", email: "admin@example.com" })
  }, [])

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return <AdminDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
}

// Customer and Brand dashboards removed — this page is admin-only now.

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
            {activeTab === "overview" && <Overview />}
            {activeTab === "brands" && <BrandsPanel />}
            {activeTab === "users" && <UsersPanel />}
            {activeTab === "support" && <SupportPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}