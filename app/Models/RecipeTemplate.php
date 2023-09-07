<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeTemplate extends Model
{
    use HasFactory;
    
    protected $fillable = [
        "recipe_id", "template_id",
        "amount",
        "optional",
    ];

    public function recipe(){
        return $this->belongsTo(Recipe::class);
    }
    public function template(){
        return $this->belongsTo(Template::class);
    }
}
