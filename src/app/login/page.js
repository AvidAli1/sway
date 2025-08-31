"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // In a real app, you would make API calls here
      console.log("Login Data:", formData)

      // Mock successful login
      const user = {
        id: Date.now(),
        email: formData.email,
        role: "customer", // or "customer"
      }

      // Store user data (in real app, this would come from API response)
      localStorage.setItem("user", JSON.stringify(user))

      // Redirect to brand dashboard
      router.push("/brandDashboard")
      
    } catch (error) {
      console.error("Login error:", error)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-black absolute left-[48%] sm:left-[50%] transform -translate-x-1/2">
            S<span className="text-yellow-400">W</span>AY
          </h1>

          {/* Login/Signup Toggle - Responsive */}
          <div className="flex justify-center">
            <div className="flex flex-col sm:flex-row bg-gray-100 rounded-lg p-1 w-20 sm:w-60">
              <Link
                href="/login"
                className="flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap bg-white text-gray-900 shadow-sm text-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap text-gray-600 hover:text-gray-900 text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive spacing */}
      <div className="px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto pt-12 sm:pt-40 pb-8 sm:pb-8">
          {/* Auth Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-6">
            <button className="text-sm text-gray-600 hover:text-yellow-600 transition-colors">
              Forgot your password?
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}