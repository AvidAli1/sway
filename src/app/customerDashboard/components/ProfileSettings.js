"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X } from "lucide-react"

export default function ProfileSettings({ user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    // city removed - will use address.city instead
    // city: user?.city || "",
    // harmonized with backend: use stylePreferences (array of strings)
    stylePreferences: user?.stylePreferences || [],
    newsletterOptIn: user?.newsletterOptIn || false,
    
    size: user?.size || [],
    addresses: user?.addresses || [],
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  // Initialize formData from provided `user` prop or from localStorage (login response)
  useEffect(() => {
    try {
      // Try session from localStorage (login saved full response) first, fall back to prop `user`
      let session = null
      try {
        session = JSON.parse(localStorage.getItem("user") || "null")
      } catch (e) {
        session = null
      }

      // session may be { user, customer, token } or just a plain user object
      const sessionUser = session?.user || session || user || null
      // customer details may be under session.customer or sessionUser.customer (if backend nested), or null
      const backendCustomer = session?.customer || sessionUser?.customer || null
      const backendUser = sessionUser

      const dobRaw = backendCustomer?.DOB || backendUser?.dateOfBirth || backendUser?.DOB || null
      const dob = dobRaw ? new Date(dobRaw).toISOString().slice(0, 10) : ""

      setFormData((prev) => ({
        ...prev,
        name: backendUser?.name || prev.name,
        email: backendUser?.email || prev.email,
        phone: backendUser?.phone || prev.phone,
        dateOfBirth: dob,
        gender: backendCustomer?.gender || prev.gender,
        stylePreferences: Array.isArray(backendCustomer?.stylePreferences) ? backendCustomer.stylePreferences : prev.stylePreferences,
        newsletterOptIn: typeof backendCustomer?.newsletterOptIn === "boolean" ? backendCustomer.newsletterOptIn : prev.newsletterOptIn,
        size: Array.isArray(backendCustomer?.size) ? backendCustomer.size : prev.size,
        addresses: Array.isArray(backendCustomer?.addresses) ? backendCustomer.addresses : prev.addresses,
      }))
    } catch (e) {
      console.warn("ProfileSettings init error:", e)
    }
  }, [user])

  const handleSave = () => {
    ;(async () => {
      setSaveLoading(true)
      setSaveFeedback(null)
      try {
        const payload = {
          name: formData.name,
          phone: formData.phone,
          DOB: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined,
          newsletterOptIn: !!formData.newsletterOptIn,
          stylePreferences: formData.stylePreferences || [],
          size: formData.size || [],
          addresses: formData.addresses || [],
        }

        // Build headers and attach token if present
        const headers = { "Content-Type": "application/json" }
        let token = null
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "null")
          token = stored?.token || stored?.accessToken || stored?.jwt || localStorage.getItem("authToken")
        } catch (e) {
          console.warn("Failed to read token from localStorage", e)
        }

        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        } else {
          // If your backend uses cookie sessions, credentials: "include" below may be sufficient.
          console.warn("No auth token found in localStorage. Request will be sent without Authorization header.")
        }

        // Send PUT (backend expects PUT)
        const res = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers,
          credentials: "include", // keep for cookie-based auth
          body: JSON.stringify(payload),
        })

        // debug info (helps backend dev / local testing)
        console.debug("update-profile result:", { status: res.status, ok: res.ok, url: res.url })

        // Safely parse JSON only when present
        let data = null
        try {
          const ct = res.headers.get("content-type") || ""
          if (res.status !== 204 && ct.includes("application/json")) {
            data = await res.json()
          } else {
            const txt = await res.text()
            data = txt ? { message: txt } : null
          }
        } catch (parseErr) {
          console.warn("Failed to parse JSON response", parseErr)
          data = null
        }

        if (res.status === 401) {
          setSaveFeedback("Unauthorized. Please sign in and try again.")
          return
        } else if (res.ok) {
          const successMsg = data?.message || "Profile updated successfully"
          setSaveFeedback(successMsg)
          setNotificationMessage(successMsg)
          setShowNotification(true)
          // auto-hide after 4s
          setTimeout(() => setShowNotification(false), 4000)
          // update localStorage user with returned user if present
          if (data?.user) {
            try {
              const current = JSON.parse(localStorage.getItem("user") || "null") || {}
              localStorage.setItem("user", JSON.stringify({ ...current, ...data.user }))
            } catch (e) {}
              }
              // exit edit mode so Save/Cancel disappear and Edit Profile reappears
              setIsEditing(false)
        } else {
          setSaveFeedback(data?.error || data?.message || "Failed to update profile")
        }
      } catch (err) {
        console.error("Update profile error", err)
        setSaveFeedback("An error occurred while saving. Please try again.")
      } finally {
        setSaveLoading(false)
      }
    })()
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      // city removed
      // removed frontend-only fields; keep stylePreferences which backend persists
      stylePreferences: user?.stylePreferences || [],
      newsletterOptIn: user?.newsletterOptIn || false,
      
      size: user?.size || [],
      addresses: user?.addresses || [],
    })
    try {
      // Reinitialize from saved session (localStorage) or prop `user` — same logic as mount
      let session = null
      try {
        session = JSON.parse(localStorage.getItem("user") || "null")
      } catch (e) {
        session = null
      }
      const sessionUser = session?.user || session || user || null
      const backendCustomer = session?.customer || sessionUser?.customer || null

      const dobRaw = backendCustomer?.DOB || sessionUser?.dateOfBirth || sessionUser?.DOB || null
      const dob = dobRaw ? new Date(dobRaw).toISOString().slice(0, 10) : ""

      setFormData((prev) => ({
        ...prev,
        name: sessionUser?.name || prev.name,
        email: sessionUser?.email || prev.email,
        phone: sessionUser?.phone || prev.phone,
        dateOfBirth: dob,
        gender: backendCustomer?.gender || prev.gender,
        stylePreferences: Array.isArray(backendCustomer?.stylePreferences) ? backendCustomer.stylePreferences : prev.stylePreferences,
        newsletterOptIn: typeof backendCustomer?.newsletterOptIn === 'boolean' ? backendCustomer.newsletterOptIn : prev.newsletterOptIn,
        size: Array.isArray(backendCustomer?.size) ? backendCustomer.size : prev.size,
        addresses: Array.isArray(backendCustomer?.addresses) ? backendCustomer.addresses : prev.addresses,
      }))
    } catch (err) {
      console.warn("ProfileSettings cancel reset failed", err)
      // fallback to prop
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        dateOfBirth: user?.dateOfBirth || "",
        gender: user?.gender || "",
        stylePreferences: user?.stylePreferences || [],
        newsletterOptIn: user?.newsletterOptIn || false,
        size: user?.size || [],
        addresses: user?.addresses || [],
      })
    }
    setIsEditing(false)
  }

  const fashionStyles = ["Casual", "Formal", "Desi", "Old Money", "Streetwear", "Minimalist", "Bohemian"]
  const aesthetics = ["Modern", "Vintage", "Classic", "Trendy", "Elegant", "Edgy", "Romantic"]
  
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          label: "",
          fullName: prev.name || "",
          phone: prev.phone || "",
          street: "",
          apartment: "",
          // default city pulls from first existing address if available
          city: prev.addresses?.[0]?.city || "",
          state: "",
          postalCode: "",
          country: "",
          isDefault: prev.addresses.length === 0,
        },
      ],
    }))
  }

  const updateAddress = (idx, field, value) => {
    setFormData((prev) => {
      const addrs = [...(prev.addresses || [])]
      addrs[idx] = { ...(addrs[idx] || {}), [field]: value }
      return { ...prev, addresses: addrs }
    })
  }

  const removeAddress = (idx) => {
    setFormData((prev) => {
      const addrs = [...(prev.addresses || [])]
      addrs.splice(idx, 1)
      if (addrs.length > 0 && !addrs.some(a => a.isDefault)) addrs[0].isDefault = true
      return { ...prev, addresses: addrs }
    })
  }

  return (
    <>
      {/* Top notification (success) */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
            <div className="text-sm">{notificationMessage}</div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white opacity-90 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className={`bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${saveLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
              >
                <Save className="w-4 h-4" />
                {saveLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  {formData.name || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {formData.email || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {formData.phone || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formData.dateOfBirth || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  {formData.gender || "Not provided"}
                </div>
              )}
            </div>
          </div>

          {/* Fashion Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fashion Preferences</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style Preferences</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...fashionStyles, ...aesthetics].map((opt) => {
                    const key = opt.toLowerCase()
                    return (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(formData.stylePreferences || []).includes(key)}
                          onChange={(e) => {
                            const cur = new Set(formData.stylePreferences || [])
                            if (e.target.checked) cur.add(key)
                            else cur.delete(key)
                            setFormData({ ...formData, stylePreferences: Array.from(cur) })
                          }}
                        />
                        <span className="text-sm capitalize">{opt}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(formData.stylePreferences || []).length > 0 ? (
                    formData.stylePreferences.map((sp) => (
                      <span key={sp} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">{sp}</span>
                    ))
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter</label>
              {isEditing ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.newsletterOptIn}
                    onChange={(e) => setFormData({ ...formData, newsletterOptIn: e.target.checked })}
                  />
                  <span className="text-sm">Receive promotional emails and updates</span>
                </label>
              ) : (
                <div className="text-gray-900">{formData.newsletterOptIn ? "Subscribed" : "Not subscribed"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Sizes</label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <label key={s} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData.size || []).includes(s)}
                        onChange={(e) => {
                          const cur = new Set(formData.size || [])
                          if (e.target.checked) cur.add(s)
                          else cur.delete(s)
                          setFormData({ ...formData, size: Array.from(cur) })
                        }}
                      />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-gray-900">{(formData.size || []).join(", ") || "Not provided"}</div>
              )}
            </div>
          </div>
        </div>
        {/* Addresses */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h3>
          {isEditing ? (
            <div className="space-y-4">
              {(formData.addresses || []).map((addr, idx) => (
                <div key={idx} className="bg-white border p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input placeholder="Label (Home, Work)" value={addr.label} onChange={(e) => updateAddress(idx, 'label', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="Full name" value={addr.fullName} onChange={(e) => updateAddress(idx, 'fullName', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="Phone" value={addr.phone} onChange={(e) => updateAddress(idx, 'phone', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="Street" value={addr.street} onChange={(e) => updateAddress(idx, 'street', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="Apartment" value={addr.apartment} onChange={(e) => updateAddress(idx, 'apartment', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="City" value={addr.city} onChange={(e) => updateAddress(idx, 'city', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="State" value={addr.state} onChange={(e) => updateAddress(idx, 'state', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="Postal Code" value={addr.postalCode} onChange={(e) => updateAddress(idx, 'postalCode', e.target.value)} className="border px-2 py-1 rounded" />
                    <input placeholder="Country" value={addr.country} onChange={(e) => updateAddress(idx, 'country', e.target.value)} className="border px-2 py-1 rounded" />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!addr.isDefault} onChange={(e) => {
                        // set this address as default
                        setFormData(prev => ({
                          ...prev,
                          addresses: prev.addresses.map((a, i) => ({ ...a, isDefault: i === idx }))
                        }))
                      }} />
                      <span className="text-sm">Set as default</span>
                    </label>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => removeAddress(idx)} className="text-sm text-red-600">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addAddress} className="mt-2 px-3 py-1 bg-gray-100 rounded">Add address</button>
            </div>
          ) : (
            <div>
              {(formData.addresses || []).length > 0 ? (
                (formData.addresses || []).map((addr, idx) => (
                  <div key={idx} className="p-3 border rounded mb-2">
                    <div className="font-medium">{addr.label || "Address"}</div>
                    <div className="text-sm text-gray-600">{addr.fullName} • {addr.phone}</div>
                    <div className="text-sm text-gray-600">{addr.street} {addr.apartment}</div>
                    <div className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div className="text-sm text-gray-600">{addr.country}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No addresses saved</div>
              )}
            </div>
          )}
        </div>

        {saveFeedback && <div className="mt-4 text-sm text-gray-700">{saveFeedback}</div>}
      </div>
    </div>
    </>
  )
}
