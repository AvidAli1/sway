import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    const mongodb = await import('mongodb');
    const client = new mongodb.MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const coll = client.db('SWAY').collection('products');

    const docs = await coll.find({ embedding: { $type: 'object' } }).toArray();
    console.log('Found', docs.length, 'bad objects');

    let fixed = 0;
    for (const doc of docs) {
        if (doc.embedding) {
            const arr = Object.values(doc.embedding);
            if (arr.length > 0 && typeof arr[0] === 'number') {
                await coll.updateOne(
                    { _id: doc._id },
                    { $set: { embedding: arr } }
                );
                fixed++;
            }
        }
    }
    console.log('Fixed', fixed, 'documents to true BSON arrays.');
    process.exit();
}
fix();
