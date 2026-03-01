import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

async function verify() {
    try {
        const P = mongoose.connection.collection('products');
        const res = await P.findOne({ embedding: { $exists: true } });
        if (res && Array.isArray(res.embedding)) {
            console.log('YES! array of size', res.embedding.length);
            console.log('Type of first element:', typeof res.embedding[0]);
        } else if (res) {
            console.log('NO! embedding type is', typeof res.embedding);
        } else {
            console.log('No item with embedding found');
        }
    } catch (e) {
        console.log('Error:', e);
    }
    process.exit();
}
mongoose.connection.once('open', verify);
