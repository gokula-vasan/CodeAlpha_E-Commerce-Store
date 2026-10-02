const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const Product = require('../models/Product');
const products = require('../data/products');

let mongod = null;

// Auto-seed products silently if the database is empty
const autoSeedIfEmpty = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany(products);
        }
    } catch (err) {
        // Silently handle seed errors
    }
};

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    // Option 1: Remote MongoDB URI (Atlas or custom)
    if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            console.log('MongoDB Connected!');
            await autoSeedIfEmpty();
            return;
        } catch {
            // Fallback to local
        }
    }

    // Option 2: Try local MongoDB on port 27017
    try {
        const localUri = 'mongodb://127.0.0.1:27017/ecommerce';
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        console.log('MongoDB Connected!');
        await autoSeedIfEmpty();
        return;
    } catch {
        // Fallback to embedded
    }

    // Option 3: Embedded MongoDB on fixed port 27017
    try {
        const dbPath = path.join(__dirname, '..', 'data', 'db');

        mongod = await MongoMemoryServer.create({
            instance: {
                port: 27017,
                dbPath: dbPath,
                storageEngine: 'wiredTiger',
            },
        });

        const embeddedUri = mongod.getUri('ecommerce');
        await mongoose.connect(embeddedUri);
        console.log('MongoDB Connected!');
        await autoSeedIfEmpty();
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;