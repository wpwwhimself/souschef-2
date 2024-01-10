<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignKeysToTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->foreign("category_id")->references("id")->on("categories");
        });
        Schema::table('products', function (Blueprint $table) {
            $table->foreign("ingredient_id")->references("id")->on("ingredients");
        });
        Schema::table('stock_items', function (Blueprint $table) {
            $table->foreign("product_id")->references("id")->on("products");
        });
        Schema::table('cooking_products', function (Blueprint $table) {
            $table->foreign("product_id")->references("id")->on("products");
            $table->foreign("ingredient_id")->references("id")->on("ingredients");
        });
        Schema::table('recipe_ingredients', function (Blueprint $table) {
            $table->foreign("recipe_id")->references("id")->on("recipes");
            $table->foreign("ingredient_id")->references("id")->on("ingredients");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropForeign(["category_id"]);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(["ingredient_id"]);
        });
        Schema::table('stock_items', function (Blueprint $table) {
            $table->dropForeign(["product_id"]);
        });
        Schema::table('cooking_products', function (Blueprint $table) {
            $table->dropForeign(["product_id"]);
            $table->dropForeign(["ingredient_id"]);
        });
        Schema::table('recipe_ingredients', function (Blueprint $table) {
            $table->dropForeign(["recipe_id"]);
            $table->dropForeign(["ingredient_id"]);
        });
    }
}
