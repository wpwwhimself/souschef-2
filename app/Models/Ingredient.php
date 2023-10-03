<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        "name", "category_id", "freezable",
        "minimal_amount", "unit", "dash",
    ];

    public function category(){
        return $this->belongsTo(Category::class);
    }
    public function products(){
        return $this->hasMany(Product::class);
    }
    public function stockItems(){
        return $this->hasManyThrough(StockItem::class, Product::class);
    }
}
