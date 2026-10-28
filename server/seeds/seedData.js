const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

dotenv.config({ path: __dirname + '/../.env' });

const users = [
  {
    name: 'Priya Sharma (Customer)',
    email: 'customer@freshcart.com',
    password: 'password123',
    role: 'customer',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
  },
  {
    name: 'FreshCart Vendor Admin',
    email: 'admin@freshcart.com',
    password: 'password123',
    role: 'admin',
    phone: '+91 98765 88888',
    address: 'Warehouse Hub #12, Electronic City, Bangalore',
  },
  {
    name: 'Rajesh Express (Delivery Partner)',
    email: 'delivery@freshcart.com',
    password: 'password123',
    role: 'delivery',
    phone: '+91 98765 12345',
    address: 'Fleet Station South, Bangalore',
  },
];

const products = [
  // Fruits & Veggies
  {
    name: 'Farm Fresh Royal Gala Apples',
    category: 'Fruits & Veggies',
    price: 180,
    discountPrice: 155,
    stock: 45,
    unit: '1 kg (approx. 5-6 pcs)',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp, sweet, and handpicked orchard-fresh Royal Gala apples packed with dietary fiber and antioxidants.',
    rating: 4.8,
    popularityScore: 98,
    isAvailable: true,
  },
  {
    name: 'Organic Robusta Bananas',
    category: 'Fruits & Veggies',
    price: 60,
    discountPrice: 48,
    stock: 60,
    unit: '1 Dozen',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    description: 'Naturally ripened nutrient-dense bananas. Great for instant energy, smoothies, and breakfast bowls.',
    rating: 4.6,
    popularityScore: 95,
    isAvailable: true,
  },
  {
    name: 'Hydroponic Tender Baby Spinach',
    category: 'Fruits & Veggies',
    price: 55,
    discountPrice: 45,
    stock: 30,
    unit: '250 g bunch',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    description: 'Pesticide-free hydroponically grown tender baby spinach, pre-washed and ready to cook or blend.',
    rating: 4.7,
    popularityScore: 82,
    isAvailable: true,
  },
  {
    name: 'Vine-Ripened Hybrid Tomatoes',
    category: 'Fruits & Veggies',
    price: 40,
    discountPrice: 32,
    stock: 75,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: 'Plump, firm, and tangy red tomatoes sourced directly from local farmers.',
    rating: 4.5,
    popularityScore: 89,
    isAvailable: true,
  },
  {
    name: 'Crunchy Orange Carrots',
    category: 'Fruits & Veggies',
    price: 50,
    discountPrice: 39,
    stock: 50,
    unit: '500 g',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    description: 'Freshly harvested sweet and juicy orange carrots rich in beta carotene.',
    rating: 4.6,
    popularityScore: 78,
    isAvailable: true,
  },
  {
    name: 'Fresh Hass Avocados',
    category: 'Fruits & Veggies',
    price: 220,
    discountPrice: 189,
    stock: 25,
    unit: 'Pack of 2',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
    description: 'Creamy Hass avocados perfect for guacamole, keto salads, and breakfast toast.',
    rating: 4.9,
    popularityScore: 91,
    isAvailable: true,
  },

  // Dairy
  {
    name: 'Farm Fresh Pasteurised Whole Milk',
    category: 'Dairy',
    price: 72,
    discountPrice: 68,
    stock: 80,
    unit: '1 Litre Pouch',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    description: 'Rich and creamy farm fresh cow milk with balanced fats and essential calcium.',
    rating: 4.9,
    popularityScore: 99,
    isAvailable: true,
  },
  {
    name: 'Pure Artisanal Salted Butter',
    category: 'Dairy',
    price: 260,
    discountPrice: 245,
    stock: 40,
    unit: '500 g pack',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
    description: 'Slow-churned creamy golden butter made from grass-fed cows. Melts smoothly on warm toast.',
    rating: 4.8,
    popularityScore: 88,
    isAvailable: true,
  },
  {
    name: 'Greek Style Plain Probiotic Yogurt',
    category: 'Dairy',
    price: 130,
    discountPrice: 115,
    stock: 35,
    unit: '400 g tub',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    description: 'Thick, velvety Greek-style strained yogurt packed with gut-healthy active cultures and high protein.',
    rating: 4.7,
    popularityScore: 84,
    isAvailable: true,
  },
  {
    name: 'Fresh Malai Paneer (Cottage Cheese)',
    category: 'Dairy',
    price: 110,
    discountPrice: 95,
    stock: 35,
    unit: '200 g pack',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    description: 'Soft, melt-in-the-mouth paneer made from pure cow milk. Ideal for curries, tikka, and grilling.',
    rating: 4.8,
    popularityScore: 93,
    isAvailable: true,
  },

  // Bakery
  {
    name: 'Artisan Crusty Sourdough Loaf',
    category: 'Bakery',
    price: 160,
    discountPrice: 140,
    stock: 20,
    unit: '400 g loaf',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
    description: 'Naturally fermented for 24 hours with authentic wild yeast. Crispy golden crust and airy open crumb.',
    rating: 4.9,
    popularityScore: 94,
    isAvailable: true,
  },
  {
    name: 'French Butter Croissants',
    category: 'Bakery',
    price: 190,
    discountPrice: 165,
    stock: 22,
    unit: 'Box of 4 pcs',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Flaky, golden-layered viennoiserie pastry with rich European butter aroma.',
    rating: 4.7,
    popularityScore: 87,
    isAvailable: true,
  },
  {
    name: '100% Whole Wheat Multigrain Bread',
    category: 'Bakery',
    price: 65,
    discountPrice: 55,
    stock: 45,
    unit: '400 g sliced',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Baked with whole wheat grains, flaxseeds, sunflower seeds, and rolled oats. Zero maida.',
    rating: 4.6,
    popularityScore: 86,
    isAvailable: true,
  },

  // Snacks
  {
    name: 'Premium California Roasted Almonds',
    category: 'Snacks',
    price: 340,
    discountPrice: 299,
    stock: 35,
    unit: '250 g zipper pouch',
    image: 'https://images.unsplash.com/photo-1508061252445-5350f3ab0a55?auto=format&fit=crop&w=600&q=80',
    description: 'Lightly sea-salted and dry-roasted jumbo California almonds. Crunchy, healthy superfood snack.',
    rating: 4.8,
    popularityScore: 92,
    isAvailable: true,
  },
  {
    name: 'Artisan Stoneground Tortilla Chips',
    category: 'Snacks',
    price: 110,
    discountPrice: 95,
    stock: 50,
    unit: '200 g pack',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    description: 'Gluten-free yellow corn tortilla chips seasoned with Himalayan pink salt. Best with salsa & dip.',
    rating: 4.5,
    popularityScore: 80,
    isAvailable: true,
  },
  {
    name: 'Belgian Dark Chocolate 72% Cocoa',
    category: 'Snacks',
    price: 195,
    discountPrice: 175,
    stock: 30,
    unit: '100 g bar',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    description: 'Single-origin cocoa beans crafted into velvety, bittersweet artisan dark chocolate.',
    rating: 4.9,
    popularityScore: 90,
    isAvailable: true,
  },
  {
    name: 'Spicy Peri Peri Roasted Fox Nuts (Makhana)',
    category: 'Snacks',
    price: 145,
    discountPrice: 125,
    stock: 40,
    unit: '150 g jar',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
    description: 'Low-calorie crunchy roasted lotus seeds coated in fiery peri-peri seasoning.',
    rating: 4.6,
    popularityScore: 83,
    isAvailable: true,
  },

  // Household
  {
    name: 'Natural Citrus Herbal Dishwash Gel',
    category: 'Household',
    price: 155,
    discountPrice: 135,
    stock: 40,
    unit: '750 ml bottle',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
    description: 'Tough on grease, gentle on hands. Formulated with organic lemon extracts and antibacterial neem.',
    rating: 4.7,
    popularityScore: 76,
    isAvailable: true,
  },
  {
    name: 'Antibacterial Pine Floor Cleaner',
    category: 'Household',
    price: 180,
    discountPrice: 159,
    stock: 35,
    unit: '1 Litre bottle',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80',
    description: 'Eliminates 99.9% germs, leaves long-lasting refreshing pine scent. Safe for tile, marble, and granite.',
    rating: 4.6,
    popularityScore: 74,
    isAvailable: true,
  },
  {
    name: 'Biodegradable Kitchen Garbage Bags',
    category: 'Household',
    price: 120,
    discountPrice: 99,
    stock: 55,
    unit: 'Roll of 30 bags (Medium)',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
    description: '100% compostable plant-based trash bags with leak-proof star bottom seal.',
    rating: 4.5,
    popularityScore: 79,
    isAvailable: true,
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery_delivery_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('Cleared existing Users, Products, and Orders.');

    // Seed users
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} initial users.`);

    // Seed products
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} initial products across 5 categories.`);

    // Seed an initial demo order so orders dashboard has live data
    const customerUser = createdUsers.find((u) => u.role === 'customer');
    const deliveryUser = createdUsers.find((u) => u.role === 'delivery');

    if (customerUser && createdProducts.length >= 2) {
      const sampleItem1 = createdProducts[0];
      const sampleItem2 = createdProducts[6]; // milk

      const itemsPrice = sampleItem1.discountPrice * 2 + sampleItem2.discountPrice * 1;
      const deliveryFee = 0;
      const taxPrice = Math.round(itemsPrice * 0.05);
      const totalAmount = itemsPrice + deliveryFee + taxPrice;

      await Order.create({
        user: customerUser._id,
        items: [
          {
            product: sampleItem1._id,
            name: sampleItem1.name,
            price: sampleItem1.discountPrice,
            quantity: 2,
            unit: sampleItem1.unit,
            image: sampleItem1.image,
          },
          {
            product: sampleItem2._id,
            name: sampleItem2.name,
            price: sampleItem2.discountPrice,
            quantity: 1,
            unit: sampleItem2.unit,
            image: sampleItem2.image,
          },
        ],
        shippingAddress: {
          fullName: 'Priya Sharma',
          phone: '+91 98765 43210',
          address: 'Flat 402, Green Valley Apts, Indiranagar',
          landmark: 'Opposite Metro Station',
          pincode: '560038',
        },
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        paymentDetails: {
          transactionId: 'TXN_UPI_9823412',
          upiId: 'priya@oksbi',
        },
        orderStatus: 'Packed',
        itemsPrice,
        deliveryFee,
        taxPrice,
        totalAmount,
        assignedDeliveryAgent: deliveryUser ? deliveryUser._id : undefined,
        statusHistory: [
          {
            status: 'Pending',
            updatedAt: new Date(Date.now() - 3600000 * 2),
            note: 'Order placed by customer via UPI',
          },
          {
            status: 'Packed',
            updatedAt: new Date(Date.now() - 3600000 * 1),
            note: 'Order verified and packed at warehouse hub',
          },
        ],
      });
      console.log('Sample order seeded successfully.');
    }

    console.log('=== Database Seeding Complete ===');
    if (process.argv[1].includes('seedData.js')) {
      process.exit();
    }
  } catch (err) {
    console.error('Seeding error:', err);
    if (process.argv[1].includes('seedData.js')) {
      process.exit(1);
    }
  }
};

module.exports = seedDB;

if (require.main === module) {
  seedDB();
}
