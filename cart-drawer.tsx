import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { Link } from 'wouter';

export default function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Overlay */}
      <div
        className={`overlay fixed inset-0 bg-black/50 z-40 ${isOpen ? 'open' : ''}`}
        onClick={toggleCart}
        data-testid="cart-overlay"
      />

      {/* Cart Drawer */}
      <div className={`cart-drawer fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col ${isOpen ? 'open' : ''}`} data-testid="cart-drawer">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" data-testid="text-cart-title">Shopping Cart</h2>
            <Button variant="ghost" size="icon" onClick={toggleCart} data-testid="button-close-cart">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-6" data-testid="cart-items-container">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12" data-testid="text-empty-cart">
              <p>Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={toggleCart}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = parseFloat(item.product.salePrice || item.product.price);
                
                return (
                  <Card key={item.id} className="p-4" data-testid={`cart-item-${item.product.id}`}>
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        data-testid={`img-cart-item-${item.product.id}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium" data-testid={`text-cart-item-name-${item.product.id}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm" data-testid={`text-cart-item-price-${item.product.id}`}>
                          ${price.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            data-testid={`button-decrease-quantity-${item.product.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-sm" data-testid={`text-quantity-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            data-testid={`button-increase-quantity-${item.product.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                        className="text-muted-foreground hover:text-destructive"
                        data-testid={`button-remove-item-${item.product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold" data-testid="text-subtotal">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-semibold">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span data-testid="text-total">${totalPrice.toFixed(2)}</span>
              </div>
              <Link href="/checkout">
                <Button 
                  className="w-full" 
                  onClick={toggleCart}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
