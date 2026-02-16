"use client"

import { useState, useEffect } from "react"
import { Gift, Calendar, Share2, Copy, Check, Clock } from "lucide-react"

export default function LoyaltyRewards({ user }) {
    const [points, setPoints] = useState(0)
    const [loading, setLoading] = useState(true)
    const [referralCode, setReferralCode] = useState("")
    const [lastCheckIn, setLastCheckIn] = useState(null)
    const [lastWeekly, setLastWeekly] = useState(null)
    const [copied, setCopied] = useState(false)
    const [claimingDaily, setClaimingDaily] = useState(false)
    const [claimingWeekly, setClaimingWeekly] = useState(false)

    // Fetch initial data
    useEffect(() => {
        if (user) {
            // We need to fetch customer specific data including points
            // Assuming user object passed prop already has updated points or we fetch fresh
            fetchCustomerData(user.id || user._id);
        }
    }, [user]);

    const fetchCustomerData = async (userId) => {
        try {
            // This endpoint should return customer details including loyalty
            const res = await fetch(`/api/customer/dashboard?userId=${userId}`);
            const data = await res.json();
            if (data.success && data.customer) { // Ensure backend returns full customer object or modify route
                // data.stats usually returned by dashboard
                // Let's assume dashboard API returns necessary info or we create a specific one
                // For now, let's rely on what dashboard returns or make a new call?
                // The implementation plan didn't specify a GET /api/loyalty endpoint, 
                // so let's check what dashboard endpoint returns.
                // It returns { stats: ... }. We might need to update that endpoint or use stats.
                // Let's check stats.loyaltyPoints from parent? 
                // Wait, the parent component passes `user`... but `user` is from localstorage usually.
                // We need fresh data.

                // Let's fetch the customer profile directly if possible or update dashboard API.
                // Or simpler: GET /api/customer/profile (if it exists)
                // ACTUALLY, I'll rely on the dashboard API I modified in previous steps to fetch stats.
                // AND I'll modify the Dashboard API to include these specific dates if not already.

                // Temporary: Since I didn't modify dashboard API yet, I will use checkin/weekly endpoints 
                // dry-run or just try to enable buttons based on local state? No, bad UX.

                // Let's assume the Dashboard update included loyaltyPoints in stats.
                setPoints(data.stats?.loyaltyPoints || 0);

                // We need specific dates for buttons.
                // Let's create a small helper endpoint or just fetch customer directly?
                // Actually we can add this to the dashboard stats API response?
                // I will add a method to get status.
            }

            // Separate fetch for loyalty status if dashboard doesn't have it
            // Or just update the Customer Dashboard API to return this info.
            // Since I can't easily modify the existing GET /api/customer/dashboard? right now without reading it,
            // I'll make a dedicated GET request to a new endpoint or piggyback.

            // Let's just create a `GET /api/loyalty/status`
            const statusRes = await fetch('/api/loyalty/status', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setPoints(statusData.loyaltyPoints);
                setLastCheckIn(statusData.lastDailyCheckIn);
                setLastWeekly(statusData.lastWeeklyClaim);
                setReferralCode(statusData.referralCode);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const claimDaily = async () => {
        setClaimingDaily(true);
        try {
            const res = await fetch('/api/loyalty/checkin', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPoints(data.newBalance);
                setLastCheckIn(new Date().toISOString());
                alert(`Success! +${data.pointsAdded} LP`);
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setClaimingDaily(false);
        }
    };

    const claimWeekly = async () => {
        setClaimingWeekly(true);
        try {
            const res = await fetch('/api/loyalty/weekly', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPoints(data.newBalance);
                setLastWeekly(new Date().toISOString());
                alert(`Success! +${data.pointsAdded} LP`);
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setClaimingWeekly(false);
        }
    };

    const copyReferral = () => {
        const url = `${window.location.origin}/api/u/${referralCode}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to check if can claim daily
    const canClaimDaily = () => {
        if (!lastCheckIn) return true;
        const last = new Date(lastCheckIn);
        const now = new Date();
        return last.getDate() !== now.getDate() ||
            last.getMonth() !== now.getMonth() ||
            last.getFullYear() !== now.getFullYear();
    };

    // Helper to check if can claim weekly
    const canClaimWeekly = () => {
        if (!lastWeekly) return true;
        const last = new Date(lastWeekly);
        const now = new Date();
        const diffTime = Math.abs(now - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // check if > 7 days passed roughly
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        return (now - last) >= sevenDaysMs;
    };

    if (loading) return <div className="p-8 text-center">Loading Rewards...</div>;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-black shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">{points} LP</h2>
                        <p className="text-yellow-900 font-medium opacity-90">Current Balance</p>
                    </div>
                    <Gift className="w-12 h-12 opacity-80" />
                </div>
                <p className="mt-4 text-sm opacity-75">Use points to unlock virtual try-on features!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Check-in */}
                <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Daily Check-in</h3>
                                <p className="text-sm text-gray-500">Get 20 LP every day</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={claimDaily}
                        disabled={!canClaimDaily() || claimingDaily}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${canClaimDaily()
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {claimingDaily ? "Claiming..." : canClaimDaily() ? "Claim Reward" : "Claimed Today"}
                    </button>
                </div>

                {/* Weekly Bonus */}
                <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Weekly Bonus</h3>
                                <p className="text-sm text-gray-500">Get 100 LP every week</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={claimWeekly}
                        disabled={!canClaimWeekly() || claimingWeekly}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${canClaimWeekly()
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {claimingWeekly ? "Claiming..." : canClaimWeekly() ? "Claim Bonus" : "Claimed This Week"}
                    </button>
                </div>
            </div>

            {/* Referral Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Invite Friends</h3>
                        <p className="text-sm text-gray-500">Earn 25 LP for every friend who signs up using your link.</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                    <div className="flex-1 font-mono text-sm text-gray-600 break-all">
                        {referralCode ? `${window.location.origin}/api/u/${referralCode}` : 'Generating link...'}
                    </div>
                    <button
                        onClick={copyReferral}
                        disabled={!referralCode}
                        className="flex items-center gap-2 text-gray-900 hover:text-black font-medium"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
