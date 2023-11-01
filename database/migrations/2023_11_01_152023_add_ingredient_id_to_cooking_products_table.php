<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIngredientIdToCookingProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cooking_products', function (Blueprint $table) {
            $table->foreignId("ingredient_id");
            $table->foreignId("product_id")->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('cooking_products', function (Blueprint $table) {
            $table->dropColumn("ingredient_id");
            $table->foreignId("product_id")->nullable(false)->change();
        });
    }
}
