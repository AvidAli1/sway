"use client"

import { useState, useEffect } from "react"
import { DollarSign, Download, Calendar, ArrowDownRight, ArrowUpRight, Clock, CheckCircle } from "lucide-react"

export default function BrandWallet() {
    const [walletData, setWalletData] = useState({
        totalGMV: 0,
        commissionPaid: 0,
        netEarnings: 0,
        pendingPayouts: 0,
        paidOutAmount: 0,
        commissionRate: 0.02
    });
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("all");

    useEffect(() => {
        fetchWalletData();
    }, [dateFilter]);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const res = await fetch(`/api/brand/wallet?dateFilter=${dateFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setWalletData(data.wallet);
                setLedger(data.ledger);
            }
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        const headers = ["Order ID", "Product", "Selling Price", "Commission", "Net", "Status", "Date"];
        const csvRows = [
            headers.join(","),
            ...ledger.map(row => [
                row.orderId,
                `"${row.product}"`,
                row.sellingPrice,
                row.commission,
                row.net,
                row.status,
                new Date(row.date).toLocaleDateString()
            ].join(","))
        ];

        const csvBlob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(csvBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `brand_wallet_ledger_${dateFilter}.csv`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'returned':
            case 'refunded':
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (val) => "PKR " + (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (loading && ledger.length === 0) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded mt-8"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Brand Wallet & Finances</h2>

                <div className="flex items-center gap-3">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>

                    <button
                        onClick={downloadCSV}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Sales (GMV)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(walletData.totalGMV)}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Total value of items sold</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Commission Paid</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(walletData.commissionPaid)}</h3>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">{(walletData.commissionRate * 100).toFixed(1)}% of GMV to Sway</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Net Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(walletData.netEarnings)}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">GMV - Commission - Refunds</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1 border-t-4 border-t-yellow-400">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Payouts</p>
                            <h3 className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(walletData.pendingPayouts)}</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Net Earnings minus Paid Out</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 border-t-4 border-t-green-400">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Paid Out Amount</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(walletData.paidOutAmount)}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Amount transferred by Sway to you</p>
                </div>
            </div>

            {/* Ledger */}
            <div className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-900 text-lg">
                    Transaction Ledger
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3 whitespace-nowrap">Selling Price</th>
                                <th className="px-6 py-3">Commission</th>
                                <th className="px-6 py-3">Net</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No transactions found for the selected period.
                                    </td>
                                </tr>
                            ) : (
                                ledger.map((item, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.orderId}</td>
                                        <td className="px-6 py-4 truncate max-w-[200px]" title={item.product}>{item.product}</td>
                                        <td className="px-6 py-4">{formatCurrency(item.sellingPrice)}</td>
                                        <td className="px-6 py-4 text-red-600">-{formatCurrency(item.commission)}</td>
                                        <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(item.net)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
