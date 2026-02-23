'use client'

import { useState, useEffect } from 'react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalProductsSold: 0,
        brands: []
    })
    const [loading, setLoading] = useState(true)
    const [selectedBrand, setSelectedBrand] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('authToken')
            const res = await fetch("/api/admin/dashboard", {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setStats({
                    totalEarnings: data.totalWebsiteEarnings || 0,
                    totalProductsSold: data.totalProductsSold || 0,
                    brands: data.brands || []
                })
            }
        } catch (error) {
            console.error("Failed to fetch admin stats:", error)
        } finally {
            setLoading(false)
        }
    }

    const openBrandModal = (brand) => {
        setSelectedBrand(brand)
        setIsModalOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Products Sold</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProductsSold}</p>
                    <p className="text-blue-600 text-sm mt-2 flex items-center">
                        <span className="bg-blue-100 px-2 py-0.5 rounded text-xs font-medium">Platform Wide</span>
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Earnings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">Rs. {stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                        <span className="bg-green-100 px-2 py-0.5 rounded text-xs font-medium">Platform Wide</span>
                    </p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Brands Directory</h3>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats.brands.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No brands registered yet.</td>
                            </tr>
                        ) : (
                            stats.brands.map((brand) => (
                                <tr key={brand._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openBrandModal(brand)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{brand.name}</div>
                                        <div className="text-xs text-gray-500">{brand.ownerName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {brand.businessEmail}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {brand.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-yellow-600 hover:text-yellow-900" onClick={(e) => { e.stopPropagation(); openBrandModal(brand); }}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Brand Details Modal */}
            {isModalOpen && selectedBrand && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900">{selectedBrand.name}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600 font-medium">Owner Email</span>
                                    <span className="text-gray-900">{selectedBrand.ownerEmail || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600 font-medium">Products Catalog</span>
                                    <span className="text-gray-900">{selectedBrand.productCount} Items</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600 font-medium">Total Products Sold</span>
                                    <span className="text-gray-900">{selectedBrand.productsSold} Units</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600 font-medium">Earnings This Month</span>
                                    <span className="text-green-600 font-bold">Rs. {selectedBrand.monthlyEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
