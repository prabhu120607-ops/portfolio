import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

// Interface structures
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  categoryId: string;
  brandId: string;
  ratingsAverage: number;
  status: 'active' | 'draft';
  tags: string[];
  images: string[];
  variants: ProductVariant[];
}

export interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  quantity: number;
  price: number;
  color: string;
  size: string;
}

export interface Order {
  id: string;
  userId: string | null;
  contactEmail: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  couponCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue: number;
  expiryDate: string;
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface Wishlist {
  userId: string;
  productIds: string[];
}

export interface Database {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  coupons: Coupon[];
  users: User[];
  orders: Order[];
  reviews: Review[];
  wishlists: Wishlist[];
}

// Read database
export function getDb(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Return empty skeleton if file doesn't exist
      return {
        categories: [],
        brands: [],
        products: [],
        coupons: [],
        users: [],
        orders: [],
        reviews: [],
        wishlists: []
      };
    }
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading JSON database:', error);
    return {
      categories: [],
      brands: [],
      products: [],
      coupons: [],
      users: [],
      orders: [],
      reviews: [],
      wishlists: []
    };
  }
}

// Write database
export function saveDb(data: Database): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to JSON database:', error);
  }
}

// Service methods helper
export const dbService = {
  // PRODUCTS
  getProducts: () => getDb().products,
  getProductById: (id: string) => getDb().products.find(p => p.id === id),
  getProductBySlug: (slug: string) => getDb().products.find(p => p.slug === slug),
  
  createProduct: (product: Omit<Product, 'id' | 'ratingsAverage'>) => {
    const db = getDb();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      ratingsAverage: 5.0
    };
    db.products.push(newProduct);
    saveDb(db);
    return newProduct;
  },
  
  updateProduct: (id: string, updatedFields: Partial<Product>) => {
    const db = getDb();
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...updatedFields };
      saveDb(db);
      return db.products[index];
    }
    return null;
  },
  
  deleteProduct: (id: string) => {
    const db = getDb();
    const filtered = db.products.filter(p => p.id !== id);
    if (filtered.length !== db.products.length) {
      db.products = filtered;
      saveDb(db);
      return true;
    }
    return false;
  },

  // USERS
  getUsers: () => getDb().users,
  getUserByEmail: (email: string) => getDb().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUserById: (id: string) => getDb().users.find(u => u.id === id),
  
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => {
    const db = getDb();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  // CATEGORIES
  getCategories: () => getDb().categories,
  
  // BRANDS
  getBrands: () => getDb().brands,

  // ORDERS
  getOrders: () => getDb().orders,
  getOrderById: (id: string) => getDb().orders.find(o => o.id === id),
  getOrdersByUser: (userId: string) => getDb().orders.filter(o => o.userId === userId),
  
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>) => {
    const db = getDb();
    
    // Create new order object
    const newOrder: Order = {
      ...order,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      orderStatus: 'Pending',
      paymentStatus: order.paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
      createdAt: new Date().toISOString()
    };

    // Subtract inventory
    order.items.forEach(item => {
      const product = db.products.find(p => p.id === item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
      }
    });

    db.orders.push(newOrder);
    saveDb(db);
    return newOrder;
  },
  
  updateOrderStatus: (id: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    const db = getDb();
    const index = db.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      db.orders[index].orderStatus = orderStatus;
      if (paymentStatus) {
        db.orders[index].paymentStatus = paymentStatus;
      }
      saveDb(db);
      return db.orders[index];
    }
    return null;
  },

  // REVIEWS
  getReviews: () => getDb().reviews,
  getReviewsByProduct: (productId: string) => getDb().reviews.filter(r => r.productId === productId && r.status === 'approved'),
  
  createReview: (review: Omit<Review, 'id' | 'status' | 'createdAt'>) => {
    const db = getDb();
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      status: 'approved', // Auto-approved for preview convenience
      createdAt: new Date().toISOString()
    };
    db.reviews.push(newReview);

    // Recompute product rating average
    const productReviews = db.reviews.filter(r => r.productId === review.productId && r.status === 'approved');
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    
    const productIndex = db.products.findIndex(p => p.id === review.productId);
    if (productIndex !== -1) {
      db.products[productIndex].ratingsAverage = parseFloat(avg.toFixed(1));
    }

    saveDb(db);
    return newReview;
  },
  
  updateReviewStatus: (id: string, status: Review['status']) => {
    const db = getDb();
    const index = db.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      db.reviews[index].status = status;
      saveDb(db);
      return db.reviews[index];
    }
    return null;
  },

  // COUPONS
  getCoupons: () => getDb().coupons,
  getCouponByCode: (code: string) => getDb().coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active),
  
  createCoupon: (coupon: Omit<Coupon, 'id'>) => {
    const db = getDb();
    const newCoupon: Coupon = {
      ...coupon,
      id: `c-${Date.now()}`
    };
    db.coupons.push(newCoupon);
    saveDb(db);
    return newCoupon;
  },
  
  deleteCoupon: (id: string) => {
    const db = getDb();
    db.coupons = db.coupons.filter(c => c.id !== id);
    saveDb(db);
    return true;
  },

  // WISHLIST
  getWishlist: (userId: string) => getDb().wishlists.find(w => w.userId === userId)?.productIds || [],
  
  toggleWishlistItem: (userId: string, productId: string) => {
    const db = getDb();
    let userWishlist = db.wishlists.find(w => w.userId === userId);
    
    if (!userWishlist) {
      userWishlist = { userId, productIds: [] };
      db.wishlists.push(userWishlist);
    }
    
    const exists = userWishlist.productIds.includes(productId);
    if (exists) {
      userWishlist.productIds = userWishlist.productIds.filter(id => id !== productId);
    } else {
      userWishlist.productIds.push(productId);
    }
    
    saveDb(db);
    return userWishlist.productIds;
  }
};
