// Backend/src/utils/seedDataFixed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const categories = [
  {
    name: 'Điện thoại',
    description: 'Các sản phẩm điện thoại thông minh',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
  },
  {
    name: 'Laptop',
    description: 'Máy tính xách tay cho công việc và giải trí',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
  },
  {
    name: 'Tablet',
    description: 'Máy tính bảng tiện lợi',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300',
  },
  {
    name: 'Phụ kiện',
    description: 'Phụ kiện công nghệ đa dạng',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
  },
  {
    name: 'Đồng hồ thông minh',
    description: 'Smartwatch và thiết bị đeo thông minh',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
  },
];

const productsData = {
  'Điện thoại': [
    { name: 'iPhone 15 Pro Max', price: 29990000, desc: 'Chip A17 Pro, Camera 48MP, Titan Design' },
    { name: 'Samsung Galaxy S24 Ultra', price: 27990000, desc: 'Snapdragon 8 Gen 3, S Pen, AI Camera' },
    { name: 'Xiaomi 14', price: 19990000, desc: 'Camera Leica, sạc nhanh 120W, Snapdragon 8 Gen 3' },
    { name: 'Oppo Reno 11 Pro', price: 12990000, desc: 'Camera chân dung, sạc nhanh 67W' },
    { name: 'Vivo V30', price: 11990000, desc: 'Camera Zeiss, thiết kế mỏng nhẹ' },
  ],
  'Laptop': [
    { name: 'MacBook Pro M3', price: 45990000, desc: 'Chip M3, 16GB RAM, 512GB SSD' },
    { name: 'Dell XPS 15', price: 42990000, desc: 'Intel Core i7, RTX 4060, 4K OLED' },
    { name: 'ASUS ROG Zephyrus', price: 38990000, desc: 'Gaming laptop RTX 4070, 240Hz display' },
    { name: 'Lenovo ThinkPad X1', price: 35990000, desc: 'Doanh nhân cao cấp, bảo mật vân tay' },
    { name: 'HP Spectre x360', price: 39990000, desc: 'Laptop 2 trong 1, màn hình cảm ứng' },
  ],
  'Tablet': [
    { name: 'iPad Pro 12.9', price: 28990000, desc: 'Chip M2, màn hình Liquid Retina XDR' },
    { name: 'Samsung Galaxy Tab S9', price: 22990000, desc: 'Màn hình AMOLED 120Hz, S Pen' },
    { name: 'Xiaomi Pad 6', price: 8990000, desc: 'Snapdragon 870, 144Hz, 8GB RAM' },
    { name: 'Lenovo Tab P12', price: 12990000, desc: '12.7 inch, JBL speakers, pin khủng' },
    { name: 'iPad Air M2', price: 17990000, desc: 'Chip M2, thiết kế mỏng nhẹ' },
  ],
  'Phụ kiện': [
    { name: 'AirPods Pro 2', price: 5990000, desc: 'Chống ồn chủ động, chip H2' },
    { name: 'Bàn phím cơ Keychron K8', price: 2490000, desc: 'Hot-swap, RGB, wireless' },
    { name: 'Chuột Logitech MX Master 3S', price: 2290000, desc: 'Cảm biến 8K DPI, 70 ngày pin' },
    { name: 'Sạc dự phòng Anker 20000mAh', price: 890000, desc: 'Sạc nhanh 65W PD, 2 cổng' },
    { name: 'Case iPhone 15 Pro MagSafe', price: 490000, desc: 'Chống sốc, viền nâng camera' },
  ],
  'Đồng hồ thông minh': [
    { name: 'Apple Watch Series 9', price: 10990000, desc: 'Chip S9, Always-on display, ECG' },
    { name: 'Samsung Galaxy Watch 6', price: 7990000, desc: 'Wear OS, theo dõi sức khỏe toàn diện' },
    { name: 'Garmin Forerunner 965', price: 14990000, desc: 'GPS, bản đồ, pin 23 ngày' },
    { name: 'Amazfit GTR 4', price: 4990000, desc: 'AMOLED, pin 14 ngày, GPS' },
    { name: 'Huawei Watch GT 3', price: 6990000, desc: 'Thiết kế sang, pin 14 ngày' },
  ],
};

const generateProducts = (categoryId, categoryName) => {
  const products = [];
  const items = productsData[categoryName] || productsData['Phụ kiện'];
  
  items.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + '. Sản phẩm chính hãng, bảo hành 12 tháng. Giao hàng toàn quốc.',
      price: item.price,
      originalPrice: item.price + 3000000,
      discount: Math.floor(Math.random() * 15) + 5,
      category: categoryId,
      mainImage: `https://picsum.photos/400/400?random=${Date.now()}_${index}`,
      images: [
        `https://picsum.photos/400/400?random=${Date.now()}_${index}_1`,
        `https://picsum.photos/400/400?random=${Date.now()}_${index}_2`,
        `https://picsum.photos/400/400?random=${Date.now()}_${index}_3`,
      ],
      stock: Math.floor(Math.random() * 80) + 20,
      sold: Math.floor(Math.random() * 500) + 50,
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      numReviews: Math.floor(Math.random() * 300) + 50,
      featured: Math.random() > 0.6,
      isActive: true, // ✅ QUAN TRỌNG: Thêm field này
    });
  });

  return products;
};

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    console.log('\n🗑️  Deleting old data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Old data deleted');

    console.log('\n📦 Creating categories...');
    const createdCategories = [];
    for (const c of categories) {
      const category = await Category.create(c);
      createdCategories.push(category);
      console.log(`  ✓ ${category.name} (${category._id})`);
    }
    console.log(`✅ Created ${createdCategories.length} categories`);

    console.log('\n📱 Creating products...');
    let allProducts = [];
    for (const category of createdCategories) {
      const products = generateProducts(category._id, category.name);
      allProducts = allProducts.concat(products);
      console.log(`  ✓ ${category.name}: ${products.length} products`);
    }

    await Product.insertMany(allProducts);
    console.log(`✅ Created ${allProducts.length} products`);

    // Verify
    console.log('\n🔍 Verifying data...');
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ featured: true, isActive: true });
    
    console.log(`  Total products: ${totalProducts}`);
    console.log(`  Active products: ${activeProducts}`);
    console.log(`  Featured products: ${featuredProducts}`);

    // Sample product
    const sample = await Product.findOne().populate('category');
    console.log('\n📦 Sample product:');
    console.log(`  Name: ${sample.name}`);
    console.log(`  Category: ${sample.category.name}`);
    console.log(`  Price: ${sample.price.toLocaleString('vi-VN')} VND`);
    console.log(`  isActive: ${sample.isActive}`);
    console.log(`  featured: ${sample.featured}`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();