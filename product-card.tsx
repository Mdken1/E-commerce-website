import { Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { ProductWithCategory } from '@shared/schema';
import { Link } from 'wouter';

interface ProductCardProps {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const price = parseFloat(product.price);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
  const hasDiscount = salePrice && salePrice < price;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product);
  };

  return (
    <Link href={`/products/${product.id}`} data-testid={`link-product-${product.id}`}>
      <Card className="product-card overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group cursor-pointer" data-testid={`card-product-${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
            alt={product.name}
            className="product-image w-full h-64 object-cover"
            data-testid={`img-product-${product.id}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-card/90 hover:bg-card text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-testid={`button-favorite-${product.id}`}
          >
            <Heart className="w-4 h-4" />
          </Button>
          {hasDiscount && (
            <Badge className="absolute bottom-3 left-3 bg-secondary text-secondary-foreground">
              Sale
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute bottom-3 left-3 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                ${salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through" data-testid={`text-product-original-price-${product.id}`}>
                  ${price.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              Add to Cart
            </Button>
          </div>
          
          {/* Rating (placeholder) */}
          <div className="flex items-center space-x-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(24)</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
