import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, Search, User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'Orders' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40" data-testid="header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-primary-foreground text-sm" />
              </div>
              <span className="text-xl font-bold">ShopCraft</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} data-testid={`link-${item.label.toLowerCase()}`}>
                <span
                  className={`transition-colors cursor-pointer ${
                    location === item.href
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              data-testid="button-mobile-search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="icon" data-testid="button-user">
              <User className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  data-testid="text-cart-count"
                >
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} data-testid={`mobile-link-${item.label.toLowerCase()}`}>
                      <span
                        className={`block py-2 transition-colors ${
                          location === item.href
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
