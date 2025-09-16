import { useState, useEffect } from 'react';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { stripePromise } from '@/lib/stripe';
import { apiRequest } from '@/lib/queryClient';
import { Truck, Lock } from 'lucide-react';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const orderData = {
        userId: 'demo-user',
        total: finalTotal.toString(),
        status: 'pending',
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}`,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price
        }))
      };

      const orderResponse = await apiRequest('POST', '/api/orders', orderData);
      const order = await orderResponse.json();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        await clearCart();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-shipping-title">Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={shippingInfo.firstName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
              required
              data-testid="input-first-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={shippingInfo.lastName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
              required
              data-testid="input-last-name"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
              required
              data-testid="input-email"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              required
              data-testid="input-address"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              required
              data-testid="input-city"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={shippingInfo.zipCode}
              onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
              required
              data-testid="input-zip-code"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-payment-title">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-order"
      >
        {isProcessing ? 'Processing...' : `Complete Order - $${finalTotal.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + tax;

  useEffect(() => {
    if (items.length === 0) return;

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: finalTotal,
      currency: "usd"
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
      });
  }, [finalTotal, items.length]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" data-testid="empty-cart-checkout">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-4">Add some items to your cart before checking out.</p>
        <Button asChild>
          <a href="/products">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="checkout-loading">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" data-testid="stripe-not-configured">
        <h1 className="text-2xl font-bold mb-4">Payment Processing Not Available</h1>
        <p className="text-muted-foreground mb-4">
          Payment processing is not currently configured. The site administrator needs to add Stripe API keys to enable checkout functionality.
        </p>
        <Button asChild>
          <a href="/products">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="checkout-page">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-checkout-title">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Checkout Form */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle data-testid="text-order-summary">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-4" data-testid="order-items">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3" data-testid={`order-item-${item.product.id}`}>
                    <img
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      data-testid={`img-order-item-${item.product.id}`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid={`text-order-item-name-${item.product.id}`}>
                        {item.product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm" data-testid={`text-order-item-quantity-${item.product.id}`}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold" data-testid={`text-order-item-total-${item.product.id}`}>
                      ${(parseFloat(item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span data-testid="text-subtotal">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span data-testid="text-tax">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span data-testid="text-final-total">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 mt-6 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
