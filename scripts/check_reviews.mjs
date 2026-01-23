
import mongoose from 'mongoose';
import Review from '../src/app/models/reviewModel.js';

// Using the URI from .env
const MONGODB_URI = "mongodb+srv://hassanafnan09:admin@afnan.h0gs1ih.mongodb.net/SWAY";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Count all reviews
        const count = await Review.countDocuments({});
        console.log(`Total reviews in DB: ${count}`);

        // Find reviews for the specific product mentioned
        // Note: The user mentioned 697129bd92f10d11e02d0770
        // But I'll output ALL reviews to see what Product IDs are actually there.
        const reviews = await Review.find({}).limit(5);

        console.log("--- First 5 Reviews ---");
        reviews.forEach(r => {
            console.log(`Review ID: ${r._id}`);
            console.log(`  Product ID: ${r.product}`);
            console.log(`  User: ${r.userName}`);
            console.log(`  Rating: ${r.rating}`);
            console.log(`  Status: ${r.status}`);
            console.log(`  Detailed Product ID Type: ${typeof r.product}`);
        });
        console.log("-----------------------");

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
