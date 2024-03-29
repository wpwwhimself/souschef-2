<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
  use HasFactory;

  protected $table = "categories";
  protected $fillable = [
    "name", "symbol", "ordering"
  ];

  public function ingredients(){
    return $this->hasMany(Ingredient::class);
  }
}
