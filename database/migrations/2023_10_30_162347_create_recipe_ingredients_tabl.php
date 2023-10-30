<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipeIngredientsTabl extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists("recipe_templates");
        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId("recipe_id");
            $table->foreignId("ingredient_id");
            $table->float("amount");
            $table->boolean("optional")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('recipe_ingredients');
    }
}
