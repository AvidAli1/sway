
import mongoose from 'mongoose';
import Product from '../src/app/models/productModel.js';
import fs from 'fs';

const MONGODB_URI = "mongodb+srv://hassanafnan09:admin@afnan.h0gs1ih.mongodb.net/SWAY";

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);

        const p1Id = '6970e900aa902a623285e7f4'; // From reviews
        const p2Id = '697129bd92f10d11e02d0770'; // From user URL

        const p1 = await Product.findById(p1Id);
        const p2 = await Product.findById(p2Id);

        let output = "";
        output += `Product 1 (from reviews) - ID: ${p1Id}\n`;
        if (p1) {
            output += `  Name: ${p1.name}\n`;
            output += `  Title: ${p1.title}\n`; // Check title if name not used
        } else {
            output += "  Not Found\n";
        }

        output += `\nProduct 2 (from URL) - ID: ${p2Id}\n`;
        if (p2) {
            output += `  Name: ${p2.name}\n`;
            output += `  Title: ${p2.title}\n`;
        } else {
            output += "  Not Found\n";
        }

        fs.writeFileSync('products_dump.txt', output);
        console.log('Dumped to products_dump.txt');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
