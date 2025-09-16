import { 
  users, categories, products, orders, orderItems, cartItems,
  type User, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type CartItem, type InsertCartItem,
  type ProductWithCategory, type OrderWithItems, type CartItemWithProduct
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(filters?: { categoryId?: string; search?: string; featured?: boolean }): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  getOrders(userId?: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Order Items
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  
  // Cart
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Products
  async getProducts(filters?: { categoryId?: string; search?: string; featured?: boolean }): Promise<ProductWithCategory[]> {
    let query = db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    // Build where conditions
    const conditions: any[] = [];
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.search) {
      conditions.push(ilike(products.name, `%${filters.search}%`));
    }
    if (filters?.featured) {
      conditions.push(eq(products.featured, true));
    }

    // Apply where conditions if any exist
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions)) as typeof query;
    }

    const result = await query;
    return result.map(row => ({
      ...row.products,
      category: row.categories || { id: '', name: '', description: null, icon: null }
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      ...result.products,
      category: result.categories || { id: '', name: '', description: null, icon: null }
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, insertProduct: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(userId?: string): Promise<OrderWithItems[]> {
    let query = db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .orderBy(desc(orders.createdAt));

    if (userId) {
      query = query.where(eq(orders.userId, userId)) as typeof query;
    }

    const results = await query;
    
    // Group by order
    const orderMap = new Map<string, OrderWithItems>();
    
    for (const row of results) {
      if (!orderMap.has(row.orders.id)) {
        orderMap.set(row.orders.id, {
          ...row.orders,
          orderItems: []
        });
      }
      
      if (row.order_items && row.products) {
        orderMap.get(row.orders.id)!.orderItems.push({
          ...row.order_items,
          product: row.products
        });
      }
    }
    
    return Array.from(orderMap.values());
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, id));

    if (results.length === 0) return undefined;

    const order: OrderWithItems = {
      ...results[0].orders,
      orderItems: []
    };

    for (const row of results) {
      if (row.order_items && row.products) {
        order.orderItems.push({
          ...row.order_items,
          product: row.products
        });
      }
    }

    return order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Order Items
  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(items).returning();
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const results = await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    return results.map(row => ({
      ...row.cart_items,
      product: row.products!
    }));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, insertCartItem.userId!),
          eq(cartItems.productId, insertCartItem.productId!)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + insertCartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [item] = await db.insert(cartItems).values(insertCartItem).returning();
      return item;
    }
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      )
      .returning();
    return item;
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
}

export const storage = new DatabaseStorage();
