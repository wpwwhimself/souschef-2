<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
  use HasFactory;

  protected $fillable = [
    "ean", "name", "ingredient_id",
    "amount", "est_expiration_days",
    "last_used_at",
  ];

  protected $appends = ["stock_items_sum_amount"];

  public function getStockItemsSumAmountAttribute() {
    return $this->stockItems?->sum("amount") ?? 0;
  }

  public function ingredient(){
    return $this->belongsTo(Ingredient::class);
  }
  public function stockItems(){
    return $this->hasMany(StockItem::class)->orderBy("expiration_date")->orderBy("amount");
  }
  public function cookingProducts(){
    return $this->hasMany(CookingProduct::class);
  }
}
