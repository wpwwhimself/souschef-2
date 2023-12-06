<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        "name", "subtitle", "instructions",
        "for_dinner", "for_supper",
    ];
    protected $appends = [
        "stock_insufficient_count",
        "stock_insufficient_percentage",
    ];

    public function getStockInsufficientCountAttribute(){
        $count = 0;
        foreach($this->ingredients as $ingredient){
            if($ingredient->stock_amount < $ingredient->amount && !$ingredient->optional){
                $count++;
            }
        }
        return $count;
    }
    public function getStockInsufficientPercentageAttribute(){
        return $this->ingredients->count()
            ? $this->stock_insufficient_count / $this->ingredients->count()
            : 1
        ;
    }

    public function ingredients(){
        return $this->hasMany(RecipeIngredient::class)
          ->orderByDesc("amount")
          ->orderByDesc("optional")
          ->join("ingredients", "ingredients.id", "=", "ingredient_id")
          ->orderBy("ingredients.name")
          ->select("recipe_ingredients.*")
        ;
    }
}
