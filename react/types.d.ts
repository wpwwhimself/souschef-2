export interface SelectItem{
  label: string,
  value: any,
}

export interface Category{
  id: number,
  name: string,
  symbol: string,
  created_at: Date,
  updated_at: Date,
}

export interface Ingredient{
  id: number,
  name: string,
  category_id: number,
  freezable: boolean,
  minimal_amount?: number,
  unit: string,
  dash: boolean,
  created_at: Date,
  updated_at: Date,
  category: Category,
}

export interface Product{
  id: number,
  ean: string,
  name: string,
  ingredient_id: number,
  amount: number,
  est_expiration_days: number,
  ingredient: Ingredient,
  stock_items_sum_amount?: number,
}

export interface Recipe{
  id: number,
  name: string,
  subtitle?: string,
  instructions?: string,
  for_dinner: boolean,
  for_supper: boolean,
}

export interface StockItem{
  id: number,
  product_id: number,
  amount: number,
  expiration_date?: string,
  product: Product,
}
