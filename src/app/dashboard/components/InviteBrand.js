"use client"

import { useState } from "react"

export default function InviteBrand() {
  const [email, setEmail] = useState("")
  const [brandName, setBrandName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !brandName) {
      setError("Please provide both email and brand name.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/admin/brand/add-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, brandName }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data?.message || "Invite sent successfully")
        setEmail("")
        setBrandName("")
      } else {
        setError(data?.error || data?.message || "Failed to send invite")
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Invite a Brand</h3>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow-sm">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Brand Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="brand@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Brand Name"
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {message && <div className="text-sm text-green-700">{message}</div>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </form>
    </div>
  )
}
