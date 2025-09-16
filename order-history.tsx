import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderWithItems } from '@shared/schema';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: Clock,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders', { userId: 'demo-user' }],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="order-history-loading">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-16 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="order-history-page">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">Order History</h1>

      {orders.length === 0 ? (
        <Card className="text-center p-12" data-testid="no-orders">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-4">
            When you place orders, they'll appear here.
          </p>
          <Button asChild>
            <a href="/products">Start Shopping</a>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
            const statusColor = statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
            const orderDate = new Date(order.createdAt || '').toLocaleDateString();

            return (
              <Card key={order.id} className="p-6" data-testid={`order-${order.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`text-order-id-${order.id}`}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                      Placed on {orderDate}
                    </p>
                  </div>
                  <Badge className={statusColor} data-testid={`badge-order-status-${order.id}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items</h4>
                    <div className="space-y-3">
                      {order.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3"
                          data-testid={`order-item-${item.id}`}
                        >
                          <img
                            src={item.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            data-testid={`img-order-item-${item.id}`}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium" data-testid={`text-order-item-name-${item.id}`}>
                              {item.product.name}
                            </h5>
                            <p className="text-sm text-muted-foreground" data-testid={`text-order-item-details-${item.id}`}>
                              Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span data-testid={`text-order-subtotal-${order.id}`}>
                          ${parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-border">
                        <span>Total:</span>
                        <span data-testid={`text-order-total-${order.id}`}>
                          ${parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <Button variant="outline" size="sm" data-testid={`button-track-${order.id}`}>
                        Track Package
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-receipt-${order.id}`}>
                        View Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
