import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Order from "@/app/models/orderModel";
import Product from "@/app/models/productModel";
import Brand from "@/app/models/brandModel";
import User from "@/app/models/userModel";
import { authMiddleware } from "@/utils/authMiddleware";

export async function GET(request) {
    try {
        await connectToDatabase();

        const auth = await authMiddleware(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        if (auth.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Aggregate Website Earnings & Orders Count
        // Consider orders that are not cancelled or refunded
        const orders = await Order.find({ status: { $nin: ['cancelled', 'refunded'] } });

        // Calculate total products sold and total website earnings from Orders
        let totalWebsiteEarnings = 0;
        let totalProductsSold = 0;

        orders.forEach(order => {
            totalWebsiteEarnings += order.total;
            order.items.forEach(item => {
                totalProductsSold += item.quantity;
            });
        });

        // Fetch brands and compute details
        const brands = await Brand.find({}).populate('owner', 'name email').lean();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const brandDetails = await Promise.all(brands.map(async (brand) => {
            // Number of products for this brand
            const productCount = await Product.countDocuments({ brand: brand._id });

            // Products sold for this brand
            let productsSold = 0;
            const brandOrders = await Order.find({ status: { $nin: ['cancelled', 'refunded'] } }).populate('items.product');
            brandOrders.forEach(order => {
                order.items.forEach(item => {
                    if (item.product && item.product.brand && item.product.brand.toString() === brand._id.toString()) {
                        productsSold += item.quantity;
                    }
                });
            });

            // Earnings for the Current Month for this brand
            // Calculate by matching items in recent orders.
            const monthlyOrders = await Order.find({
                status: { $nin: ['cancelled', 'refunded'] },
                createdAt: { $gte: startOfMonth }
            }).populate('items.product');

            let monthlyEarnings = 0;
            monthlyOrders.forEach(order => {
                order.items.forEach(item => {
                    // if product model was populated and its brand matches
                    if (item.product && item.product.brand && item.product.brand.toString() === brand._id.toString()) {
                        monthlyEarnings += (item.price * item.quantity) - (item.discount || 0);
                    }
                });
            });

            return {
                _id: brand._id,
                name: brand.name,
                businessEmail: brand.businessEmail,
                ownerName: brand.owner?.name,
                ownerEmail: brand.owner?.email,
                status: brand.status,
                verified: brand.verified,
                productCount,
                productsSold,
                monthlyEarnings
            };
        }));

        return NextResponse.json({
            success: true,
            totalWebsiteEarnings,
            totalProductsSold,
            brands: brandDetails
        });

    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard statistics" },
            { status: 500 }
        );
    }
}
