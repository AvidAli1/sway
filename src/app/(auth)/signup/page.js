"use client"

import { useState } from "react"
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ToastNotification from "../../components/ToastNotification"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Users table fields
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    profile_image: null,
    role: "customer",
  })

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  const [loading, setLoading] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendFeedback, setResendFeedback] = useState(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("error")

  const showToast = (message, type = "error") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords don't match!", "error")
      return false
    }
    if (formData.password.length < 8) {
      showToast("Password must be at least 8 characters long!", "error")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 201 && data) {
        // For demo: save the registered email locally so user can resend/confirm if needed
        try {
          if (data?.email) localStorage.setItem("pending_verification_email", data.email)
          else if (data?.user?.email) localStorage.setItem("pending_verification_email", data.user.email)
        } catch (err) {
          console.warn("Could not save email to localStorage", err)
        }

        // Show notification instructing user to check email for verification.
        const msg = data?.message || "Registration successful. Please check your email to verify your account."
        setNotificationMessage(msg)
        setShowNotification(true)

        // Do not redirect — user must verify email first. Keep the form visible so they can close window.
        return
      }

      // Handle validation/server errors
      const errMsg = data?.error || data?.message || "Registration failed"
      showToast(errMsg, "error")
    } catch (error) {
      console.error("Signup error:", error)
      showToast("An error occurred. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />
      <div
        aria-live="polite"
        className="fixed left-1/2 top-4 z-50 w-full max-w-xl px-4"
        style={{ transform: showNotification ? "translateY(0) translateX(-50%)" : "translateY(-150%) translateX(-50%)", transition: "transform 300ms ease" }}
      >
        {showNotification && (
          <div className="bg-white border border-green-200 shadow-md rounded-lg p-4 flex items-start gap-4">
            <div className="flex-1">
              {resendFeedback && <div className="mt-3 text-sm text-gray-700">{resendFeedback}</div>}
              <div className="font-semibold text-green-800">Signup successful</div>
              <div className="text-sm text-green-700 mt-1">{notificationMessage}</div>
              <div className="mt-3 flex gap-2">
                {/* Top notification for success message (drops from above) */}
                <button
                  type="button"
                  onClick={async () => {
                    // call resend verification API using saved pending email or current form email
                    const emailToResend = (() => {
                      try {
                        return localStorage.getItem("pending_verification_email") || formData.email
                      } catch (e) {
                        return formData.email
                      }
                    })()
                    if (!emailToResend) {
                      setResendFeedback("No email found to resend verification to.")
                      return
                    }

                    try {
                      setResendLoading(true)
                      setResendFeedback(null)
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: emailToResend }),
                      })
                      const data = await res.json()
                      if (res.ok) {
                        setResendFeedback(data?.message || "Verification email resent. Please check your inbox.")
                        try { localStorage.setItem("pending_verification_email", emailToResend) } catch (e) { }
                      } else {
                        setResendFeedback(data?.error || data?.message || "Failed to resend verification email.")
                      }
                    } catch (err) {
                      console.error(err)
                      setResendFeedback("An error occurred. Please try again.")
                    } finally {
                      setResendLoading(false)
                    }
                  }}
                  disabled={resendLoading}
                  className={`px-3 py-1 rounded bg-yellow-50 hover:bg-yellow-100 text-sm text-yellow-700 ${resendLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotification(false)}
                  className="px-3 py-1 rounded bg-yellow-50 hover:bg-yellow-100 text-sm text-yellow-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Responsive spacing */}
      <div className="px-4 sm:px-6">
        <div className="w-full max-w-2xl mx-auto pt-16 sm:pt-32 pb-16 sm:pb-40">
          {/* Auth Header */}
          <div className="text-center mb-12 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Join SWAY</h2>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Email */}
              <div className="md:col-span-2">
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Basic User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder={"Your full name"}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  placeholder="Your complete address"
                  required
                />
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Brand fields removed for customer-only signup */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Creating..." : "Create Customer Account"}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-yellow-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-yellow-600 hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
