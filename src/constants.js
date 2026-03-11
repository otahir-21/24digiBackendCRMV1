export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};

export const DEFAULT_COLLECTIONS = [
  'users',
  'contacts',
  'leads',
  'customers',
  'orders',
  'products',
];

// 24diet module collections (from MongoDB migration)
export const DIET_COLLECTIONS = [
  '24diet_products',
  '24diet_productaddons',
  '24diet_productcategories',
];

export const DIET_TABS = [
  { id: 'products', label: 'Product Catalog', collection: '24diet_products' },
];

export const ALL_PRODUCTS_VIEW = '__24diet_all__';
