import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe only if secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating category: " + error.message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, featured } = req.query;
      const filters = {
        categoryId: categoryId as string,
        search: search as string,
        featured: featured === 'true'
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating product: " + error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating product: " + error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  // Cart (requires user session - simplified for now)
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.userId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
      const cartItem = await storage.addToCart({ userId, productId, quantity });
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: "Error adding to cart: " + error.message });
    }
  });

  app.put("/api/cart", async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
      if (quantity <= 0) {
        await storage.removeFromCart(userId, productId);
        res.json({ message: "Item removed from cart" });
      } else {
        const cartItem = await storage.updateCartItemQuantity(userId, productId, quantity);
        res.json(cartItem);
      }
    } catch (error: any) {
      res.status(400).json({ message: "Error updating cart: " + error.message });
    }
  });

  app.delete("/api/cart/:userId/:productId", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.userId, req.params.productId);
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const { userId } = req.query;
      const orders = await storage.getOrders(userId as string);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const { items } = req.body;
      if (items && items.length > 0) {
        const orderItems = items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }));
        await storage.createOrderItems(orderItems);
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating order status: " + error.message });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Payment processing is not configured. Please add Stripe API keys." });
      }
      
      const { amount, currency = "usd", orderId } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: orderId ? { orderId } : undefined,
      });
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook for payment confirmation (simplified)
  app.post("/api/webhook/stripe", async (req, res) => {
    try {
      const { paymentIntentId, orderId } = req.body;
      
      if (orderId && paymentIntentId) {
        await storage.updateOrderStatus(orderId, "processing");
        
        // Update order with payment intent ID
        // This would be more robust in a real app
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: "Webhook error: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
