export interface SelectItem{
  label: string,
  value: any,
}

export interface Category{
  id: number,
  name: string,
  symbol: string,
  ordering?: number,
  created_at: Date,
  updated_at: Date,
  ingredients_count?: number,
}

export interface CookingProduct{
  id: number,
  ingredient_id: number,
  ingredient: Ingredient,
  product_id?: number,
  product: Product,
  stock_amount: number,
  amount: number,
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

export interface Log {
  id: number,
  object: string,
  object_id: number,
  cause: string,
  cause_id?: number,
  difference: number,
  updated_at: Date,
  product?: Product,
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
  ingredients?: RecipeIngredient[],
  required_ingredients?: RecipeIngredient[],
  stock_insufficient_count: number,
}

export interface RecipeIngredient{
  id: number,
  recipe_id: number,
  ingredient_id: number,
  ingredient: Ingredient,
  amount: number,
  optional: boolean,
  stock_amount: number,
}

export interface StockItem{
  id: number,
  product_id: number,
  amount: number,
  expiration_date?: string,
  product: Product,
}
