<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeIngredient extends Model
{
    use HasFactory;
    
    protected $fillable = [
        "recipe_id", "ingredient_id",
        "amount",
        "optional",
    ];
    protected $appends = [
        "stock_amount",
    ];

    public function getStockAmountAttribute(){
        return $this->ingredient->stockItems->sum("amount");
    }

    public function recipe(){
        return $this->belongsTo(Recipe::class);
    }
    public function ingredient(){
        return $this->belongsTo(Ingredient::class);
    }
}
