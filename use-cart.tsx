import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductWithCategory } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product: ProductWithCategory;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  userId: string; // In a real app, this would come from auth
  addItem: (product: ProductWithCategory, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      userId: 'demo-user', // Hardcoded for demo - would come from auth

      addItem: async (product: ProductWithCategory, quantity = 1) => {
        const { toast } = useToast();
        try {
          await apiRequest('POST', '/api/cart', {
            userId: get().userId,
            productId: product.id,
            quantity
          });

          set((state) => {
            const existingItem = state.items.find(item => item.product.id === product.id);
            
            if (existingItem) {
              return {
                items: state.items.map(item =>
                  item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                )
              };
            } else {
              return {
                items: [...state.items, {
                  id: crypto.randomUUID(),
                  product,
                  quantity
                }]
              };
            }
          });

          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to add item to cart.",
            variant: "destructive",
          });
        }
      },

      removeItem: async (productId: string) => {
        try {
          await apiRequest('DELETE', `/api/cart/${get().userId}/${productId}`);
          
          set((state) => ({
            items: state.items.filter(item => item.product.id !== productId)
          }));
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        try {
          if (quantity <= 0) {
            await get().removeItem(productId);
            return;
          }

          await apiRequest('PUT', '/api/cart', {
            userId: get().userId,
            productId,
            quantity
          });

          set((state) => ({
            items: state.items.map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            )
          }));
        } catch (error) {
          console.error('Failed to update cart item quantity:', error);
        }
      },

      clearCart: async () => {
        try {
          // Clear cart on server would require an endpoint
          set({ items: [] });
        } catch (error) {
          console.error('Failed to clear cart:', error);
        }
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = parseFloat(item.product.salePrice || item.product.price);
          return total + (price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, userId: state.userId }),
    }
  )
);
