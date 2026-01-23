
import mongoose from 'mongoose';
import Review from '../src/app/models/reviewModel.js';

const MONGODB_URI = "mongodb+srv://hassanafnan09:admin@afnan.h0gs1ih.mongodb.net/SWAY";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const reviews = await Review.find({});
        console.log(`Found ${reviews.length} reviews.`);
        reviews.forEach(r => {
            console.log('Review:', JSON.stringify({
                id: r._id,
                user: r.user,
                product: r.product,
                status: r.status,
                rating: r.rating,
                comment: r.comment
            }, null, 2));
        });

        if (reviews.length > 0) {
            console.log('Product ID type:', typeof reviews[0].product);
            console.log('Product ID value:', reviews[0].product.toString());
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
