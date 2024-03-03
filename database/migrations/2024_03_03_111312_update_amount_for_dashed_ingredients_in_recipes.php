<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateAmountForDashedIngredientsInRecipes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      DB::table("recipe_ingredients")
        ->join("ingredients", "ingredients.id", "=", "ingredient_id")
        ->where("ingredients.dash", true)
        ->update(["amount" => 0.25])
      ;
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
      DB::table("recipe_ingredients")
        ->join("ingredients", "ingredients.id", "=", "ingredient_id")
        ->where("ingredients.dash", true)
        ->update(["amount" => 0])
      ;
    }
}
