import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

function makeSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

const categoriesData = [
  { name: 'Accessories', slug: 'accessories', description: 'Wearables, bags, and daily carry accessories' },
  { name: 'Beauty', slug: 'beauty', description: 'Skincare, haircare, and personal beauty items' },
  { name: 'Electronics', slug: 'electronics', description: 'Smartphones, audio, and personal gadgets' },
  { name: 'Fashion', slug: 'fashion', description: 'Apparel, knitwear, and streetwear' },
  { name: 'Home & Living', slug: 'home-living', description: 'Home decor, kitchen, and living essentials' },
  { name: 'Sports', slug: 'sports', description: 'Workout gear, training accessories, and fitness equipment' }
];

const productsData = {
  Accessories: [
    {
      name: "Aero Minimalist Smartwatch",
      description: "Ultra-thin health tracking smartwatch with heart rate & sleep monitoring.",
      price: 149,
      brand: "AeroTech",
      stock: 40,
      rating: 4.8,
      reviewCount: 32,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop"]
    },
    {
      name: "Classic Italian Leather Belt",
      description: "Full-grain handcrafted leather belt with brushed stainless steel buckle.",
      price: 45,
      brand: "ArtisanCraft",
      stock: 60,
      rating: 4.7,
      reviewCount: 18,
      images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop"]
    },
    {
      name: "Polarized Aviator Sunglasses",
      description: "Lightweight titanium frame with UV400 anti-glare polarized lenses.",
      price: 79,
      brand: "RayVista",
      stock: 50,
      rating: 4.6,
      reviewCount: 24,
      images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop"]
    },
    {
      name: "Vintage Canvas & Leather Backpack",
      description: "Water-resistant canvas backpack with padded 15.6-inch laptop compartment.",
      price: 89,
      brand: "NomadGear",
      stock: 35,
      rating: 4.9,
      reviewCount: 45,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop"]
    },
    {
      name: "RFID-Blocking Slim Bifold Wallet",
      description: "Genuine top-grain leather compact bifold wallet with RFID protection.",
      price: 35,
      brand: "Secura",
      stock: 75,
      rating: 4.5,
      reviewCount: 29,
      images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop"]
    },
    {
      name: "Sterling Silver Minimalist Cuff Bracelet",
      description: "Sleek 925 sterling silver adjustable cuff bracelet for everyday elegance.",
      price: 65,
      brand: "Silviana",
      stock: 25,
      rating: 4.7,
      reviewCount: 14,
      images: ["https://images.unsplash.com/photo-1611591475819-79b8b73ff784?w=600&auto=format&fit=crop"]
    },
    {
      name: "Pure Silk Patterned Pocket Square",
      description: "100% hand-rolled mulberry silk pocket square with delicate paisley print.",
      price: 24,
      brand: "SavileCraft",
      stock: 90,
      rating: 4.4,
      reviewCount: 12,
      images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop"]
    },
    {
      name: "Waterproof Travel Toiletry Bag",
      description: "Compact hanging wash organizer with dual waterproof zipper compartments.",
      price: 28,
      brand: "WanderPack",
      stock: 65,
      rating: 4.6,
      reviewCount: 21,
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop"]
    },
    {
      name: "Merino Wool Ribbed Beanie",
      description: "Thermal insulated knit beanie designed for warmth and all-day comfort.",
      price: 32,
      brand: "NordicWarmth",
      stock: 80,
      rating: 4.8,
      reviewCount: 38,
      images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop"]
    },
    {
      name: "Handmade Braided Leather Keychain",
      description: "Durable full-grain leather braided loop with solid brass key ring.",
      price: 18,
      brand: "ArtisanCraft",
      stock: 100,
      rating: 4.3,
      reviewCount: 15,
      images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop"]
    }
  ],
  Beauty: [
    {
      name: "Botanical Hydrating Facial Serum",
      description: "Hyaluronic acid serum with vitamin C and green tea antioxidant complex.",
      price: 34,
      brand: "PureGlow",
      stock: 50,
      rating: 4.8,
      reviewCount: 42,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop"]
    },
    {
      name: "Organic Rosehip Nourishing Oil",
      description: "Cold-pressed pure organic rosehip seed oil for deep cellular skin renewal.",
      price: 26,
      brand: "NaturaVeda",
      stock: 60,
      rating: 4.7,
      reviewCount: 30,
      images: ["https://images.unsplash.com/photo-1608248597359-54859a857f6b?w=600&auto=format&fit=crop"]
    },
    {
      name: "Deep Cleansing Mineral Clay Mask",
      description: "Dead Sea mud and French kaolin clay mask for purifying pores.",
      price: 22,
      brand: "DermaEarth",
      stock: 45,
      rating: 4.6,
      reviewCount: 25,
      images: ["https://images.unsplash.com/photo-1567928815112-70b5d92e5971?w=600&auto=format&fit=crop"]
    },
    {
      name: "Velvet Matte Liquid Lipstick Trio",
      description: "Long-lasting, smudge-resistant matte liquid lipstick set in nude shades.",
      price: 29,
      brand: "LuxeTint",
      stock: 70,
      rating: 4.5,
      reviewCount: 53,
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop"]
    },
    {
      name: "Restorative Peptide Eye Cream",
      description: "Firming caffeine and peptide eye cream targeting dark circles and puffiness.",
      price: 38,
      brand: "DermaEarth",
      stock: 35,
      rating: 4.7,
      reviewCount: 19,
      images: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop"]
    },
    {
      name: "Hydrating Coconut & Shea Butter Body Lotion",
      description: "Fast-absorbing everyday body moisturizer with virgin organic coconut oil.",
      price: 19,
      brand: "TropiCare",
      stock: 80,
      rating: 4.4,
      reviewCount: 37,
      images: ["https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop"]
    },
    {
      name: "Gentle Foaming Green Tea Cleanser",
      description: "Sulfate-free pH-balanced gentle daily facial foaming cleanser.",
      price: 18,
      brand: "PureGlow",
      stock: 65,
      rating: 4.8,
      reviewCount: 61,
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop"]
    },
    {
      name: "Argan Oil Hair Repair Treatment",
      description: "Deep conditioning argan oil hair masque for brittle and damaged hair.",
      price: 25,
      brand: "SilkStrands",
      stock: 40,
      rating: 4.9,
      reviewCount: 48,
      images: ["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop"]
    },
    {
      name: "Exfoliating Sea Salt Body Scrub",
      description: "Dead Sea mineral scrub enriched with sweet almond and jojoba oils.",
      price: 21,
      brand: "NaturaVeda",
      stock: 55,
      rating: 4.5,
      reviewCount: 22,
      images: ["https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&auto=format&fit=crop"]
    },
    {
      name: "SPF 50+ Invisible Sunscreen Gel",
      description: "Non-greasy, broad-spectrum UVA/UVB matte sunscreen leaving zero white cast.",
      price: 27,
      brand: "PureGlow",
      stock: 90,
      rating: 4.9,
      reviewCount: 76,
      images: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop"]
    }
  ],
  Electronics: [
    {
      name: "Nova X1 Smartphone",
      description: "Flagship 5G smartphone with stunning OLED display and pro camera system.",
      price: 699,
      brand: "Nova",
      stock: 25,
      rating: 4.7,
      reviewCount: 35,
      images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop"]
    },
    {
      name: "Pulse Noise-Cancelling Headphones",
      description: "Wireless over-ear headphones with 40-hour battery life and spatial audio.",
      price: 199,
      brand: "PulseAudio",
      stock: 30,
      rating: 4.8,
      reviewCount: 54,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop"]
    },
    {
      name: "Apex 4K HDR Action Camera",
      description: "Waterproof up to 30 meters with dual screens and 6-axis gyro stabilization.",
      price: 249,
      brand: "ApexCam",
      stock: 18,
      rating: 4.6,
      reviewCount: 29,
      images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop"]
    },
    {
      name: "Zenith Mechanical Gaming Keyboard",
      description: "Customizable hot-swappable RGB mechanical keyboard with brown switches.",
      price: 119,
      brand: "ZenithTech",
      stock: 45,
      rating: 4.9,
      reviewCount: 67,
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop"]
    },
    {
      name: "Omni Wireless Ergonomic Mouse",
      description: "Rechargeable multi-device Bluetooth mouse with hyper-fast scroll wheel.",
      price: 69,
      brand: "ZenithTech",
      stock: 50,
      rating: 4.5,
      reviewCount: 38,
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop"]
    },
    {
      name: "Aura 360 Portable Bluetooth Speaker",
      description: "Rugged waterproof outdoor speaker with deep bass and 18-hour playtime.",
      price: 89,
      brand: "PulseAudio",
      stock: 35,
      rating: 4.7,
      reviewCount: 41,
      images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop"]
    },
    {
      name: "UltraTab 11 Pro Tablet",
      description: "120Hz 2.5K high-res display with stylus support and all-day battery life.",
      price: 499,
      brand: "Nova",
      stock: 15,
      rating: 4.6,
      reviewCount: 22,
      images: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop"]
    },
    {
      name: "HyperCharge 65W GaN Charger",
      description: "Ultra-compact fast charger with 2 USB-C and 1 USB-A ports for laptop & phone.",
      price: 39,
      brand: "VoltSync",
      stock: 80,
      rating: 4.8,
      reviewCount: 50,
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop"]
    },
    {
      name: "TrueWireless Earbuds ANC",
      description: "Active noise cancellation earbuds with wireless charging case and IPX5 rating.",
      price: 89,
      brand: "PulseAudio",
      stock: 60,
      rating: 4.4,
      reviewCount: 33,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop"]
    },
    {
      name: "Smart 4K Security Camera",
      description: "AI human detection, full color night vision, and cloud storage enabled.",
      price: 79,
      brand: "ApexCam",
      stock: 25,
      rating: 4.5,
      reviewCount: 17,
      images: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop"]
    }
  ],
  Fashion: [
    {
      name: "Vintage Denim Jacket",
      description: "Classic washed blue unisex denim jacket made with 100% organic cotton.",
      price: 89,
      brand: "UrbanDenim",
      stock: 35,
      rating: 4.7,
      reviewCount: 26,
      images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop"]
    },
    {
      name: "Merino Wool Knit Sweater",
      description: "Ultra-soft and breathable warm crewneck sweater for winter comfort.",
      price: 110,
      brand: "NordicKnit",
      stock: 20,
      rating: 4.9,
      reviewCount: 19,
      images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop"]
    },
    {
      name: "Relaxed Fit Linen Button-Down Shirt",
      description: "Breathable 100% pure European linen casual everyday summer shirt.",
      price: 64,
      brand: "AtelierBreeze",
      stock: 45,
      rating: 4.6,
      reviewCount: 31,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop"]
    },
    {
      name: "Tailored Slim-Fit Chino Trousers",
      description: "Stretch twill cotton chinos combining formal elegance with daily comfort.",
      price: 59,
      brand: "AtelierBreeze",
      stock: 50,
      rating: 4.5,
      reviewCount: 28,
      images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop"]
    },
    {
      name: "Heavyweight Cotton Graphic Hoodie",
      description: "450 GSM fleece-lined oversized pullover hoodie with ribbed trims.",
      price: 75,
      brand: "UrbanDenim",
      stock: 40,
      rating: 4.8,
      reviewCount: 44,
      images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop"]
    },
    {
      name: "Classic Trench Coat with Belt",
      description: "Double-breasted water-repellent trench coat with storm flap detailing.",
      price: 165,
      brand: "SavileCraft",
      stock: 15,
      rating: 4.9,
      reviewCount: 16,
      images: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop"]
    },
    {
      name: "Striped Breton Long Sleeve Top",
      description: "Classic French-style nautical striped crewneck tee in organic combed cotton.",
      price: 38,
      brand: "AtelierBreeze",
      stock: 60,
      rating: 4.4,
      reviewCount: 22,
      images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop"]
    },
    {
      name: "Pleated Midi Skirt",
      description: "High-waist flowy A-line pleated skirt crafted from lightweight shimmer fabric.",
      price: 52,
      brand: "Silviana",
      stock: 30,
      rating: 4.6,
      reviewCount: 19,
      images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop"]
    },
    {
      name: "Minimalist Leather Low-Top Sneakers",
      description: "Handcrafted white calfskin leather sneakers with vulcanized rubber sole.",
      price: 125,
      brand: "NomadGear",
      stock: 25,
      rating: 4.8,
      reviewCount: 39,
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop"]
    },
    {
      name: "Everyday Organic Crewneck T-Shirt Pack (3)",
      description: "Triple-pack of staple pre-shrunk combed organic cotton t-shirts.",
      price: 45,
      brand: "UrbanDenim",
      stock: 70,
      rating: 4.7,
      reviewCount: 50,
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop"]
    }
  ],
  'Home & Living': [
    {
      name: "Aroma Ceramic Ultrasonic Diffuser",
      description: "Quiet essential oil diffuser with ambient warm light and timer modes.",
      price: 52,
      brand: "LuminaHome",
      stock: 25,
      rating: 4.5,
      reviewCount: 23,
      images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop"]
    },
    {
      name: "Handcrafted Ceramic Mug Set",
      description: "Set of 4 matte ceramic coffee mugs, microwave and dishwasher safe.",
      price: 38,
      brand: "Clay&Co",
      stock: 45,
      rating: 4.9,
      reviewCount: 19,
      images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop"]
    },
    {
      name: "Woven Macrame Cotton Wall Hanging",
      description: "Bohemian geometric macrame tapestry made with natural unbleached cotton cord.",
      price: 32,
      brand: "Clay&Co",
      stock: 35,
      rating: 4.7,
      reviewCount: 15,
      images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop"]
    },
    {
      name: "Scented Soy Wax Candle in Amber Jar",
      description: "Hand-poured cedarwood, vanilla, and amber scent with lead-free cotton wick.",
      price: 22,
      brand: "LuminaHome",
      stock: 80,
      rating: 4.8,
      reviewCount: 46,
      images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop"]
    },
    {
      name: "Brushed Brass Minimalist Desk Lamp",
      description: "Modern adjustable gooseneck LED task light with touch dimmer control.",
      price: 85,
      brand: "LuminaHome",
      stock: 20,
      rating: 4.6,
      reviewCount: 18,
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop"]
    },
    {
      name: "Organic Bamboo Cutting Board Set",
      description: "Set of 3 extra-thick bamboo kitchen boards with juice grooves and handles.",
      price: 42,
      brand: "EcoKitchen",
      stock: 50,
      rating: 4.7,
      reviewCount: 32,
      images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop"]
    },
    {
      name: "Linen Fringe Accent Throw Blanket",
      description: "Breathable waffle-weave throw blanket made with 100% pre-washed French flax.",
      price: 68,
      brand: "NordicHome",
      stock: 30,
      rating: 4.8,
      reviewCount: 27,
      images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop"]
    },
    {
      name: "Stainless Steel French Press Coffee Maker",
      description: "Double-wall insulated 34oz cafetiere keeping brewed coffee piping hot.",
      price: 36,
      brand: "EcoKitchen",
      stock: 40,
      rating: 4.9,
      reviewCount: 63,
      images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop"]
    },
    {
      name: "Indoor Ceramic Planter with Wooden Stand",
      description: "Mid-century modern glazed cylindrical flower pot on walnut finished stand.",
      price: 48,
      brand: "Clay&Co",
      stock: 25,
      rating: 4.6,
      reviewCount: 21,
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop"]
    },
    {
      name: "Handmade Seagrass Storage Baskets (Pair)",
      description: "Foldable natural belly baskets with handles for toys, plants, or laundry.",
      price: 34,
      brand: "Clay&Co",
      stock: 60,
      rating: 4.5,
      reviewCount: 17,
      images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop"]
    }
  ],
  Sports: [
    {
      name: "Pro Grip Non-Slip Yoga Mat",
      description: "Eco-friendly natural rubber cushioned mat with laser-etched alignment marks.",
      price: 58,
      brand: "FitZen",
      stock: 40,
      rating: 4.8,
      reviewCount: 39,
      images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop"]
    },
    {
      name: "Insulated Stainless Steel Sport Bottle (32oz)",
      description: "Vacuum double-wall insulated water bottle with leakproof chug lid.",
      price: 28,
      brand: "HydroPeak",
      stock: 80,
      rating: 4.9,
      reviewCount: 72,
      images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop"]
    },
    {
      name: "Adjustable Quick-Select Dumbbell (Single)",
      description: "Space-saving dumbbell adjustable from 5 to 52.5 lbs with intuitive dial system.",
      price: 149,
      brand: "IronCore",
      stock: 15,
      rating: 4.7,
      reviewCount: 43,
      images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop"]
    },
    {
      name: "High-Density Foam Roller for Recovery",
      description: "Deep tissue trigger point muscle massager roller for pre and post-workout relief.",
      price: 24,
      brand: "FitZen",
      stock: 60,
      rating: 4.6,
      reviewCount: 31,
      images: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop"]
    },
    {
      name: "Heavy-Duty Resistance Loop Bands Set",
      description: "Set of 5 natural latex exercise loop bands ranging from X-Light to X-Heavy.",
      price: 19,
      brand: "IronCore",
      stock: 95,
      rating: 4.5,
      reviewCount: 58,
      images: ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&auto=format&fit=crop"]
    },
    {
      name: "High-Speed Ball Bearing Jump Rope",
      description: "Adjustable tangle-free steel wire speed rope with non-slip aluminum handles.",
      price: 18,
      brand: "SpeedFit",
      stock: 85,
      rating: 4.8,
      reviewCount: 47,
      images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop"]
    },
    {
      name: "Ventilated Gym Duffel with Shoe Compartment",
      description: "Durable water-resistant gym bag featuring dedicated shoe tunnel and wet pocket.",
      price: 49,
      brand: "NomadGear",
      stock: 35,
      rating: 4.7,
      reviewCount: 29,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop"]
    },
    {
      name: "Breathable Weightlifting Gloves with Wrist Wraps",
      description: "Silicone-padded palm workout gloves with integrated elastic wrist support.",
      price: 22,
      brand: "IronCore",
      stock: 70,
      rating: 4.4,
      reviewCount: 20,
      images: ["https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop"]
    },
    {
      name: "Pro Touch FIFA-Grade Soccer Ball",
      description: "Thermally bonded seamless synthetic leather match ball for all weather conditions.",
      price: 39,
      brand: "StrikerPro",
      stock: 40,
      rating: 4.7,
      reviewCount: 25,
      images: ["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop"]
    },
    {
      name: "Deep Tissue Percussion Massage Gun",
      description: "Quiet brushless motor percussion massager with 6 interchangeable heads and case.",
      price: 89,
      brand: "FitZen",
      stock: 25,
      rating: 4.8,
      reviewCount: 53,
      images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop"]
    }
  ]
};

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is missing from server/.env");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing collections
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing categories and products.");

    // Insert categories and build lookup map
    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    for (const cat of createdCategories) {
      categoryMap[cat.name] = cat._id;
    }

    // Attach valid category ObjectId and unique slug to each product
    const fullProductList = [];
    for (const [catName, items] of Object.entries(productsData)) {
      const categoryId = categoryMap[catName];
      for (const item of items) {
        fullProductList.push({
          ...item,
          slug: makeSlug(item.name),
          category: categoryId
        });
      }
    }

    // Insert all 60 products
    await Product.insertMany(fullProductList);
    console.log(`Successfully seeded ${fullProductList.length} products (10 per category across all 6 categories)!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();