import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { ProductWithCategory } from '@shared/schema';
import { Heart, Star, Minus, Plus, Truck, Check } from 'lucide-react';
import { Link } from 'wouter';

export default function ProductDetailPage() {
  const [match, params] = useRoute('/products/:id');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('black');
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id,
  });

  if (!match || !params?.id) {
    return <div>Invalid product ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="product-detail-loading">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="w-full h-96 bg-muted rounded-xl mb-4"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-full h-20 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-6"></div>
              <div className="h-12 bg-muted rounded mb-6"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" data-testid="product-not-found">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercentage = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0;

  const handleAddToCart = async () => {
    await addItem(product, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="product-detail-page">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link href="/"><span className="hover:text-primary cursor-pointer">Home</span></Link></li>
          <li>/</li>
          <li><Link href="/products"><span className="hover:text-primary cursor-pointer">Products</span></Link></li>
          <li>/</li>
          {product.category && (
            <>
              <li><Link href={`/products?categoryId=${product.category.id}`}><span className="hover:text-primary cursor-pointer">{product.category.name}</span></Link></li>
              <li>/</li>
            </>
          )}
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-xl"
              data-testid="img-product-main"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <img
                key={i}
                src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200'}
                alt={`${product.name} view ${i + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
                data-testid={`img-product-thumbnail-${i}`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4" data-testid="text-product-name">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex text-secondary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground" data-testid="text-product-reviews">(128 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
              ${salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-muted-foreground line-through" data-testid="text-product-original-price">
                  ${price.toFixed(2)}
                </span>
                <Badge className="bg-secondary text-secondary-foreground" data-testid="text-discount-percentage">
                  {discountPercentage}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground" data-testid="text-product-description">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="text-muted-foreground space-y-1">
              <li className="flex items-center"><Check className="w-4 h-4 text-accent mr-2" />Premium Quality Materials</li>
              <li className="flex items-center"><Check className="w-4 h-4 text-accent mr-2" />Fast & Reliable Performance</li>
              <li className="flex items-center"><Check className="w-4 h-4 text-accent mr-2" />Modern Design</li>
              <li className="flex items-center"><Check className="w-4 h-4 text-accent mr-2" />Easy to Use</li>
            </ul>
          </div>

          {/* Color Options */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Color</h3>
            <div className="flex space-x-3">
              {['black', 'white', 'blue'].map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-primary' : 'border-border'
                  } ${
                    color === 'black' ? 'bg-gray-900' :
                    color === 'white' ? 'bg-white' : 'bg-blue-600'
                  }`}
                  data-testid={`button-color-${color}`}
                />
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10"
                data-testid="button-decrease-quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 border-x border-border" data-testid="text-quantity">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10"
                data-testid="button-increase-quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" data-testid="button-add-to-wishlist">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Shipping Info */}
          <Card className="p-4" data-testid="card-shipping-info">
            <div className="flex items-center space-x-3 mb-2">
              <Truck className="w-5 h-5 text-accent" />
              <span className="font-medium">Free Shipping</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get free standard shipping on orders over $50. Express shipping available.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
