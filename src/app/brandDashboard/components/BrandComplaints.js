"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

export default function BrandComplaints() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)

    // Using a custom event to allow the parent BrandDashboard to trigger a refresh
    useEffect(() => {
        fetchComplaints()

        const handleRefresh = () => {
            fetchComplaints()
        }
        window.addEventListener('refreshBrandComplaints', handleRefresh)
        return () => window.removeEventListener('refreshBrandComplaints', handleRefresh)
    }, [])

    const fetchComplaints = async () => {
        try {
            let url = "/api/complaints"
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setComplaints(data.complaints)
            }
        } catch (error) {
            console.error("Error fetching complaints:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "bg-blue-100 text-blue-800"
            case "In Progress": return "bg-yellow-100 text-yellow-800"
            case "Resolved": return "bg-green-100 text-green-800"
            case "Closed": return "bg-gray-100 text-gray-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Brand Complaints & Reports</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your reports to platform administrators.</p>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading complaints...</div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                    <p className="text-gray-500 mt-1">If you have any issues with the platform, click the floating "Report" button to raise a complaint.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                        <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                        <span className="text-sm text-gray-500">• {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">{complaint.type}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mt-2">{complaint.subject}</h3>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm">{complaint.description}</p>
                            {complaint.adminNotes && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-gray-800">
                                    <span className="font-semibold block text-xs uppercase text-yellow-600 mb-1">Admin Response:</span>
                                    {complaint.adminNotes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
