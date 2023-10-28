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
    ];

    public function ingredient(){
        return $this->belongsTo(Ingredient::class);
    }
    public function stockItems(){
        return $this->hasMany(StockItem::class);
    }
}
