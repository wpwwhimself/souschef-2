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

    public function ingredients(){
        return $this->hasMany(RecipeIngredient::class);
    }
}
