<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CookingProduct extends Model
{
    use HasFactory;

    protected $fillable = [
      "product_id", "ingredient_id",
      "amount",
    ];

    protected $appends = [
      "stock_amount",
    ];
    public function getStockAmountAttribute(){
      return $this->product?->stockItems->sum("amount") ?? 0;
    }

    public function product(){
      return $this->belongsTo(Product::class);
    }
    public function ingredient(){
      return $this->belongsTo(Ingredient::class);
    }
}
