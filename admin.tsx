import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ProductWithCategory, Category, OrderWithItems, InsertProduct, InsertCategory } from '@shared/schema';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Settings,
  Menu,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  salePrice: z.string().optional(),
  categoryId: z.string().optional(),
  stock: z.string().min(0, 'Stock must be 0 or greater').default('0'),
  featured: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
  });

  // Forms
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      salePrice: '',
      categoryId: '',
      stock: '0',
      featured: false,
      imageUrl: '',
    },
  });

  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest('POST', '/api/products', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsProductDialogOpen(false);
      productForm.reset();
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: string; product: Partial<InsertProduct> }) => {
      const response = await apiRequest('PUT', `/api/products/${data.id}`, data.product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsProductDialogOpen(false);
      setSelectedProduct(null);
      productForm.reset();
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest('POST', '/api/categories', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/orders/${data.id}/status`, { status: data.status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleProductSubmit = (data: z.infer<typeof productFormSchema>) => {
    const productData: InsertProduct = {
      name: data.name,
      description: data.description || null,
      price: data.price,
      salePrice: data.salePrice || null,
      categoryId: data.categoryId || null,
      stock: parseInt(data.stock) || 0,
      featured: data.featured,
      imageUrl: data.imageUrl || null,
    };

    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, product: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleCategorySubmit = (data: z.infer<typeof categoryFormSchema>) => {
    const categoryData: InsertCategory = {
      name: data.name,
      description: data.description || null,
      icon: data.icon || null,
    };

    createCategoryMutation.mutate(categoryData);
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setSelectedProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      salePrice: product.salePrice || '',
      categoryId: product.categoryId || '',
      stock: product.stock?.toString() || '0',
      featured: product.featured || false,
      imageUrl: product.imageUrl || '',
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  // Calculate stats
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = new Set(orders.map(order => order.userId)).size;

  const recentOrders = orders.slice(0, 10);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-background min-h-screen" data-testid="admin-page">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`admin-sidebar fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 lg:relative lg:z-auto ${sidebarOpen ? 'open' : ''}`}>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="text-primary-foreground text-sm" />
              </div>
              <span className="font-bold" data-testid="text-admin-title">Admin Panel</span>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    data-testid={`button-sidebar-${item.id}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overlay */}
        <div 
          className={`overlay fixed inset-0 bg-black/50 z-40 lg:hidden ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold capitalize" data-testid={`text-page-title-${activeTab}`}>
                {activeTab}
              </h1>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  data-testid="button-mobile-sidebar"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full"></div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8" data-testid="dashboard-content">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Total Sales</p>
                          <p className="text-2xl font-bold" data-testid="text-total-sales">
                            ${totalSales.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <DollarSign className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Orders</p>
                          <p className="text-2xl font-bold" data-testid="text-total-orders">
                            {totalOrders}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Products</p>
                          <p className="text-2xl font-bold" data-testid="text-total-products">
                            {totalProducts}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Customers</p>
                          <p className="text-2xl font-bold" data-testid="text-total-customers">
                            {totalCustomers}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle data-testid="text-recent-orders-title">Recent Orders</CardTitle>
                      <Button variant="ghost" onClick={() => setActiveTab('orders')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 text-muted-foreground font-medium">Order ID</th>
                            <th className="text-left py-3 text-muted-foreground font-medium">Customer</th>
                            <th className="text-left py-3 text-muted-foreground font-medium">Amount</th>
                            <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                            <th className="text-left py-3 text-muted-foreground font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b border-border" data-testid={`order-row-${order.id}`}>
                              <td className="py-4 font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                              <td className="py-4">{order.userId || 'Guest'}</td>
                              <td className="py-4">${parseFloat(order.total).toFixed(2)}</td>
                              <td className="py-4">
                                <Badge
                                  className={
                                    order.status === 'delivered' ? 'bg-accent text-accent-foreground' :
                                    order.status === 'processing' ? 'bg-secondary text-secondary-foreground' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    'bg-muted text-muted-foreground'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="py-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div className="space-y-6" data-testid="products-content">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Manage Products</h2>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-product">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-product-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-product-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" data-testid="input-product-price" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={productForm.control}
                              name="salePrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sale Price</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" data-testid="input-product-sale-price" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-product-category">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={productForm.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" data-testid="input-product-stock" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={productForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-product-image-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-center justify-between pt-4">
                            <Button
                              type="submit"
                              disabled={createProductMutation.isPending || updateProductMutation.isPending}
                              data-testid="button-save-product"
                            >
                              {selectedProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsProductDialogOpen(false);
                                setSelectedProduct(null);
                                productForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Product</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Category</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Price</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Stock</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Status</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id} className="border-b border-border" data-testid={`product-row-${product.id}`}>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60'}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">{product.category?.name || 'Uncategorized'}</td>
                              <td className="py-4 px-6">
                                <div>
                                  <span className="font-medium">${parseFloat(product.price).toFixed(2)}</span>
                                  {product.salePrice && (
                                    <span className="text-sm text-muted-foreground ml-2 line-through">
                                      ${parseFloat(product.salePrice).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">{product.stock || 0}</td>
                              <td className="py-4 px-6">
                                <Badge variant={product.featured ? 'default' : 'secondary'}>
                                  {product.featured ? 'Featured' : 'Standard'}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProduct(product)}
                                    data-testid={`button-edit-product-${product.id}`}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-destructive hover:text-destructive"
                                    data-testid={`button-delete-product-${product.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6" data-testid="orders-content">
                <h2 className="text-xl font-semibold">Manage Orders</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Order ID</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Customer</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Items</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Total</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Status</th>
                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-border" data-testid={`order-management-row-${order.id}`}>
                              <td className="py-4 px-6 font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                              <td className="py-4 px-6">{order.userId || 'Guest'}</td>
                              <td className="py-4 px-6">{order.orderItems?.length || 0} items</td>
                              <td className="py-4 px-6">${parseFloat(order.total).toFixed(2)}</td>
                              <td className="py-4 px-6">
                                <Select
                                  value={order.status}
                                  onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="py-4 px-6">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
              <div className="space-y-6" data-testid="categories-content">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Manage Categories</h2>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-category">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                          <FormField
                            control={categoryForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-category-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-category-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={categoryForm.control}
                            name="icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Icon (Font Awesome class)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., fas fa-laptop" data-testid="input-category-icon" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-center justify-between pt-4">
                            <Button
                              type="submit"
                              disabled={createCategoryMutation.isPending}
                              data-testid="button-save-category"
                            >
                              Add Category
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsCategoryDialogOpen(false);
                                categoryForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <Card key={category.id} data-testid={`category-card-${category.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          {category.icon && (
                            <i className={`${category.icon} text-2xl text-primary`}></i>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder tabs */}
            {['customers', 'settings'].includes(activeTab) && (
              <div className="text-center py-12" data-testid={`${activeTab}-placeholder`}>
                <p className="text-muted-foreground">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
