import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/product-card';
import { ProductWithCategory, Category } from '@shared/schema';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function ProductsPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const categoryFromUrl = urlParams.get('categoryId') || '';

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', {
      categoryId: selectedCategory || categoryFromUrl,
      search: searchQuery,
    }],
  });

  const filteredAndSortedProducts = products
    .filter(product => {
      if (priceRange) {
        const price = parseFloat(product.salePrice || product.price);
        switch (priceRange) {
          case 'under-50':
            return price < 50;
          case '50-100':
            return price >= 50 && price < 100;
          case '100-200':
            return price >= 100 && price < 200;
          case 'over-200':
            return price >= 200;
          default:
            return true;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const aPrice = parseFloat(a.salePrice || a.price);
      const bPrice = parseFloat(b.salePrice || b.price);
      
      switch (sortBy) {
        case 'price-low':
          return aPrice - bPrice;
        case 'price-high':
          return bPrice - aPrice;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3" data-testid="text-filter-categories">Categories</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={selectedCategory === ''}
              onCheckedChange={() => setSelectedCategory('')}
              data-testid="checkbox-category-all"
            />
            <span>All Categories</span>
          </label>
          {categories.map(category => (
            <label key={category.id} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedCategory === category.id}
                onCheckedChange={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                data-testid={`checkbox-category-${category.id}`}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3" data-testid="text-filter-price">Price Range</h3>
        <div className="space-y-2">
          {[
            { value: '', label: 'All Prices' },
            { value: 'under-50', label: 'Under $50' },
            { value: '50-100', label: '$50 - $100' },
            { value: '100-200', label: '$100 - $200' },
            { value: 'over-200', label: 'Over $200' },
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-2">
              <Checkbox
                checked={priceRange === option.value}
                onCheckedChange={() => setPriceRange(priceRange === option.value ? '' : option.value)}
                data-testid={`checkbox-price-${option.value || 'all'}`}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8" data-testid="products-page">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><a href="/" className="hover:text-primary">Home</a></li>
          <li>/</li>
          <li className="text-foreground">Products</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="lg:col-span-1 hidden lg:block">
          <Card className="p-6">
            <h2 className="font-semibold mb-4" data-testid="text-filters-title">Filters</h2>
            <FilterContent />
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-product-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden" data-testid="button-mobile-filters">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground" data-testid="text-results-count">
              Showing {filteredAndSortedProducts.length} results
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12" data-testid="text-no-products">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setPriceRange('');
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
