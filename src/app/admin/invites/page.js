'use client'

import { useState } from 'react'

export default function AdminInvites() {
    const [email, setEmail] = useState('')
    const [brandName, setBrandName] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const token = localStorage.getItem('authToken')
            const res = await fetch("/api/admin/brand/add-brand", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ email, brandName })
            })

            const data = await res.json()
            if (res.ok && data.success) {
                setMessage(data.message || 'Invitation sent successfully!')
                setIsError(false)
                setEmail('')
                setBrandName('')
            } else {
                setMessage(data.error || 'Failed to send invitation.')
                setIsError(true)
            }
        } catch (error) {
            console.error(error)
            setMessage('An error occurred. Please try again later.')
            setIsError(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Brand Invite</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl">
                <p className="text-gray-600 mb-6">
                    Enter the email and brand name for the merchant you want to invite to the platform.
                    They will receive an email with a secure registration link.
                </p>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg ${isError ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
                            Brand Name
                        </label>
                        <input
                            type="text"
                            id="brandName"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                            placeholder="Enter the brand's name"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Owner / Contact Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                            placeholder="brand@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending Invite...' : 'Send Invitation'}
                    </button>
                </form>
            </div>
        </div>
    )
}
