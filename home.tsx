import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { ProductWithCategory, Category } from '@shared/schema';
import { Laptop, Shirt, Home, Gamepad2, Book, Heart } from 'lucide-react';
import { Link } from 'wouter';

const categoryIcons = {
  'Electronics': Laptop,
  'Clothing': Shirt,
  'Home & Garden': Home,
  'Sports': Gamepad2,
  'Books': Book,
  'Health': Heart,
};

export default function HomePage() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', { featured: true }],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary py-20" data-testid="hero-section">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6" data-testid="text-hero-title">
                Discover Amazing Products
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8" data-testid="text-hero-description">
                Find everything you need with our curated collection of premium products. Quality guaranteed, fast shipping, and excellent customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button className="bg-card text-primary hover:bg-muted px-8 py-3" data-testid="button-shop-now">
                    Shop Now
                  </Button>
                </Link>
                <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3" data-testid="button-learn-more">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Modern shopping products display"
                  className="w-full h-auto rounded-xl"
                  data-testid="img-hero-showcase"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background" data-testid="categories-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-categories-title">Shop by Category</h2>
            <p className="text-muted-foreground" data-testid="text-categories-subtitle">Browse our wide selection of product categories</p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 text-center animate-pulse" data-testid={`skeleton-category-${i}`}>
                  <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded mx-auto"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => {
                const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Laptop;
                return (
                  <Link key={category.id} href={`/products?categoryId=${category.id}`} data-testid={`link-category-${category.id}`}>
                    <Card className="group cursor-pointer p-6 text-center hover:shadow-lg transition-shadow border border-border" data-testid={`card-category-${category.id}`}>
                      <IconComponent className="w-8 h-8 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold" data-testid={`text-category-name-${category.id}`}>{category.name}</h3>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30" data-testid="featured-products-section">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="text-featured-title">Featured Products</h2>
              <p className="text-muted-foreground" data-testid="text-featured-subtitle">Discover our most popular items</p>
            </div>
            <Link href="/products">
              <Button variant="outline" data-testid="button-view-all-products">
                View All →
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse" data-testid={`skeleton-product-${i}`}>
                  <div className="w-full h-64 bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-3"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary" data-testid="newsletter-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4" data-testid="text-newsletter-title">Stay Updated</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto" data-testid="text-newsletter-subtitle">
            Subscribe to our newsletter and be the first to know about new products, special offers, and exclusive deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder-primary-foreground/70"
              data-testid="input-newsletter-email"
            />
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-newsletter-subscribe">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
