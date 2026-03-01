export const categories = [
  { id: 'all', name: 'All Products', icon: '🛒' },
  { id: 'fruits', name: 'Fruits & Vegetables', icon: '🥦' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍪' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
  { id: 'pantry', name: 'Pantry', icon: '🫙' },
];

export const products = [
  { id: 1, name: 'Organic Strawberries', price: 4.99, category: 'fruits', emoji: '🍓', rating: 4.8, reviews: 124, badge: 'Organic', description: 'Sweet, ripe organic strawberries picked at peak freshness.', weight: '500g', inStock: true },
  { id: 2, name: 'Fresh Avocados', price: 2.49, category: 'fruits', emoji: '🥑', rating: 4.7, reviews: 89, badge: 'Popular', description: 'Creamy Hass avocados, perfect for guacamole or toast.', weight: '3 pack', inStock: true },
  { id: 3, name: 'Baby Spinach', price: 3.29, category: 'fruits', emoji: '🥬', rating: 4.6, reviews: 67, badge: null, description: 'Tender baby spinach leaves, washed and ready to eat.', weight: '200g', inStock: true },
  { id: 4, name: 'Whole Milk', price: 2.99, category: 'dairy', emoji: '🥛', rating: 4.9, reviews: 203, badge: 'Best Seller', description: 'Farm-fresh whole milk, rich and creamy.', weight: '1L', inStock: true },
  { id: 5, name: 'Free Range Eggs', price: 5.49, category: 'dairy', emoji: '🥚', rating: 4.8, reviews: 156, badge: 'Free Range', description: 'Eggs from hens raised on open pastures.', weight: '12 pack', inStock: true },
  { id: 6, name: 'Greek Yogurt', price: 3.79, category: 'dairy', emoji: '🍶', rating: 4.7, reviews: 98, badge: 'Probiotic', description: 'Thick, creamy Greek yogurt packed with protein.', weight: '500g', inStock: true },
  { id: 7, name: 'Chicken Breast', price: 8.99, category: 'meat', emoji: '🍗', rating: 4.6, reviews: 145, badge: 'Fresh', description: 'Boneless, skinless chicken breast. Antibiotic-free.', weight: '500g', inStock: true },
  { id: 8, name: 'Atlantic Salmon', price: 12.99, category: 'meat', emoji: '🐟', rating: 4.9, reviews: 87, badge: 'Wild Caught', description: 'Wild-caught Atlantic salmon fillet, rich in Omega-3.', weight: '400g', inStock: true },
  { id: 9, name: 'Sourdough Bread', price: 4.49, category: 'bakery', emoji: '🍞', rating: 4.8, reviews: 234, badge: 'Artisan', description: 'Traditional sourdough with a crispy crust and chewy inside.', weight: '700g', inStock: true },
  { id: 10, name: 'Croissants', price: 3.99, category: 'bakery', emoji: '🥐', rating: 4.7, reviews: 178, badge: 'Fresh Baked', description: 'Flaky, buttery croissants baked fresh daily.', weight: '4 pack', inStock: true },
  { id: 11, name: 'Orange Juice', price: 4.99, category: 'beverages', emoji: '🍊', rating: 4.8, reviews: 312, badge: '100% Juice', description: 'Freshly squeezed orange juice, no added sugar.', weight: '1L', inStock: true },
  { id: 12, name: 'Sparkling Water', price: 1.99, category: 'beverages', emoji: '💧', rating: 4.5, reviews: 89, badge: null, description: 'Naturally sparkling mineral water.', weight: '750ml', inStock: true },
  { id: 13, name: 'Dark Chocolate', price: 3.49, category: 'snacks', emoji: '🍫', rating: 4.9, reviews: 267, badge: '70% Cacao', description: 'Premium dark chocolate with intense cocoa flavor.', weight: '100g', inStock: true },
  { id: 14, name: 'Mixed Nuts', price: 6.99, category: 'snacks', emoji: '🥜', rating: 4.7, reviews: 134, badge: 'Unsalted', description: 'Premium mix of almonds, cashews, walnuts and pecans.', weight: '250g', inStock: true },
  { id: 15, name: 'Frozen Pizza', price: 7.99, category: 'frozen', emoji: '🍕', rating: 4.5, reviews: 198, badge: 'Ready in 12min', description: 'Classic margherita frozen pizza with mozzarella.', weight: '400g', inStock: true },
  { id: 16, name: 'Ice Cream', price: 5.49, category: 'frozen', emoji: '🍦', rating: 4.8, reviews: 321, badge: 'Popular', description: 'Creamy vanilla bean ice cream made with real vanilla.', weight: '500ml', inStock: true },
  { id: 17, name: 'Olive Oil', price: 8.99, category: 'pantry', emoji: '🫙', rating: 4.9, reviews: 145, badge: 'Extra Virgin', description: 'Cold-pressed extra virgin olive oil from Spain.', weight: '500ml', inStock: true },
  { id: 18, name: 'Pasta', price: 1.99, category: 'pantry', emoji: '🍝', rating: 4.6, reviews: 89, badge: null, description: 'Traditional Italian durum wheat spaghetti.', weight: '500g', inStock: true },
  { id: 19, name: 'Bananas', price: 1.49, category: 'fruits', emoji: '🍌', rating: 4.5, reviews: 203, badge: 'Fair Trade', description: 'Sweet, ripe bananas from fair trade farms.', weight: '6 pack', inStock: true },
  { id: 20, name: 'Cherry Tomatoes', price: 2.99, category: 'fruits', emoji: '🍅', rating: 4.7, reviews: 112, badge: 'Vine Ripened', description: 'Sweet vine-ripened cherry tomatoes on the vine.', weight: '250g', inStock: true },
  { id: 21, name: 'Cheddar Cheese', price: 4.29, category: 'dairy', emoji: '🧀', rating: 4.8, reviews: 167, badge: 'Aged 12mo', description: 'Sharp aged cheddar cheese, perfect for snacking.', weight: '200g', inStock: true },
  { id: 22, name: 'Ground Beef', price: 7.49, category: 'meat', emoji: '🥩', rating: 4.6, reviews: 134, badge: 'Grass Fed', description: 'Lean grass-fed ground beef, 85% lean.', weight: '500g', inStock: true },
  { id: 23, name: 'Bagels', price: 3.29, category: 'bakery', emoji: '🥯', rating: 4.6, reviews: 98, badge: 'Fresh', description: 'New York style bagels, baked fresh every morning.', weight: '6 pack', inStock: true },
  { id: 24, name: 'Green Tea', price: 5.99, category: 'beverages', emoji: '🍵', rating: 4.7, reviews: 156, badge: 'Antioxidant', description: 'Premium Japanese green tea bags, 40 count.', weight: '40 bags', inStock: true },
];

export const getFeaturedProducts = () => products.filter(p => p.badge === 'Best Seller' || p.badge === 'Popular' || p.badge === 'Organic').slice(0, 6);
export const getProductsByCategory = (cat) => cat === 'all' ? products : products.filter(p => p.category === cat);
export const searchProducts = (query) => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
