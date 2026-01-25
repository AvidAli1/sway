const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const OrderSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId }, // Using ObjectId directly for flexibility in script
        quantity: Number
    }],
    status: String
}, { strict: false }); // Strict false to avoid issues with other fields

const ProductSchema = new mongoose.Schema({
    salesCount: { type: Number, default: 0 }
}, { strict: false });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    console.log('Connecting to DB...');
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found in env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    // Find all valid orders
    const orders = await Order.find({
        status: { $ne: 'cancelled' } // Counting active/completed orders
    });

    console.log(`Found ${orders.length} orders.`);

    // Calculate sales per product
    const salesMap = {};

    for (const order of orders) {
        if (!order.items) continue;
        for (const item of order.items) {
            if (item.product && item.quantity) {
                const pid = item.product.toString();
                salesMap[pid] = (salesMap[pid] || 0) + item.quantity;
            }
        }
    }

    console.log('Calculated Sales Counts:', salesMap);

    // Initial pass: Reset all products to 0 first to be accurate?
    // Or just update those in the map? 
    // It's safer to reset if we want to be exact, but user only complained about one product being 0 instead of 1.
    // I will just update based on orders. If a product has no orders, it stays as is (default 0 or whatever).
    // Actually, I should probably set default 0 if undefined.

    // Let's just update based on found orders.
    for (const [pid, count] of Object.entries(salesMap)) {
        try {
            await Product.findByIdAndUpdate(pid, { $set: { salesCount: count } });
            console.log(`Updated Product ${pid}: salesCount = ${count}`);
        } catch (err) {
            console.error(`Failed to update product ${pid}:`, err.message);
        }
    }

    console.log('Migration completed.');
    process.exit(0);
}

run().catch(e => { console.error('Script Error:', e); process.exit(1); });
