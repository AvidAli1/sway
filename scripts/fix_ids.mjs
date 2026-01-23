
import mongoose from 'mongoose';
import Review from '../src/app/models/reviewModel.js';
import Order from '../src/app/models/orderModel.js';

const MONGODB_URI = "mongodb+srv://hassanafnan09:admin@afnan.h0gs1ih.mongodb.net/SWAY";
const oldId = '6970e900aa902a623285e7f4';
const newId = '697129bd92f10d11e02d0770';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Update Reviews
        const reviewResult = await Review.updateMany(
            { product: oldId },
            { $set: { product: newId } }
        );
        console.log(`Updated ${reviewResult.modifiedCount} reviews.`);

        // Update Orders
        // We need to find orders with items.product = oldId and update them.
        // MongoDB array update: 'items.$.product'
        const orderResult = await Order.updateMany(
            { "items.product": oldId },
            { $set: { "items.$.product": newId } }
        );
        console.log(`Updated ${orderResult.modifiedCount} orders.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
