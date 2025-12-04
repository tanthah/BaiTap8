// Backend/src/utils/checkAndSeed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Kiểm tra categories
    const categoryCount = await Category.countDocuments();
    console.log(`\n📊 Categories: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const categories = await Category.find();
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat._id})`);
      });
    }

    // Kiểm tra products
    const productCount = await Product.countDocuments();
    console.log(`\n📦 Products: ${productCount}`);
    
    if (productCount > 0) {
      const products = await Product.find().populate('category');
      console.log('\nFirst 5 products:');
      products.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name}`);
        console.log(`    Category: ${p.category?.name || 'NO CATEGORY'} (${p.category?._id})`);
        console.log(`    isActive: ${p.isActive}`);
      });
    }

    // Kiểm tra products không có category hoặc isActive = false
    const invalidProducts = await Product.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { isActive: false }
      ]
    });
    
    if (invalidProducts > 0) {
      console.log(`\n⚠️  Warning: ${invalidProducts} products have invalid data`);
    }

    console.log('\n' + '='.repeat(50));
    
    if (categoryCount === 0 || productCount === 0) {
      console.log('❌ Database is empty or incomplete!');
      console.log('💡 Run seed script:');
      console.log('   cd Backend');
      console.log('   node src/utils/seedData.js');
    } else {
      console.log('✅ Database has data');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDatabase();