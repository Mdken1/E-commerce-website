import { Link } from 'wouter';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-primary-foreground text-sm" />
              </div>
              <span className="text-xl font-bold">ShopCraft</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your trusted partner for quality products and exceptional shopping experience.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-social-facebook">
                <i className="fab fa-facebook text-muted-foreground hover:text-primary" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-twitter">
                <i className="fab fa-twitter text-muted-foreground hover:text-primary" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-instagram">
                <i className="fab fa-instagram text-muted-foreground hover:text-primary" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about" data-testid="link-about">
                  <span className="hover:text-primary transition-colors cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" data-testid="link-contact">
                  <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
                </Link>
              </li>
              <li>
                <Link href="/careers" data-testid="link-careers">
                  <span className="hover:text-primary transition-colors cursor-pointer">Careers</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/help" data-testid="link-help">
                  <span className="hover:text-primary transition-colors cursor-pointer">Help Center</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping" data-testid="link-shipping">
                  <span className="hover:text-primary transition-colors cursor-pointer">Shipping Info</span>
                </Link>
              </li>
              <li>
                <Link href="/returns" data-testid="link-returns">
                  <span className="hover:text-primary transition-colors cursor-pointer">Returns</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                data-testid="input-newsletter-email"
              />
              <Button className="w-full" data-testid="button-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 ShopCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
