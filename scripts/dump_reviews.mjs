
import mongoose from 'mongoose';
import Review from '../src/app/models/reviewModel.js';
import fs from 'fs';

const MONGODB_URI = "mongodb+srv://hassanafnan09:admin@afnan.h0gs1ih.mongodb.net/SWAY";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);

        const reviews = await Review.find({});

        let output = `Total reviews: ${reviews.length}\n`;
        reviews.forEach(r => {
            output += `Review ID: ${r._id}\n`;
            output += `Product ID: ${r.product}\n`;
            output += `User: ${r.userName}\n`;
            output += `Rating: ${r.rating}\n`;
            output += `Status: ${r.status}\n`;
            output += `----------------\n`;
        });

        fs.writeFileSync('reviews_dump.txt', output);
        console.log('Dumped to reviews_dump.txt');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
