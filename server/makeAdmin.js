import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    console.log('Admin account ready:');
    console.log('Email:', user.email);
    console.log('Password: admin123');
    console.log('Role:', user.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

run();