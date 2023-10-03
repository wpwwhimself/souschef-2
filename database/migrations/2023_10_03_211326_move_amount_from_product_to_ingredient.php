<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MoveAmountFromProductToIngredient extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn("unit");
            $table->dropColumn("dash");
        });
        Schema::table('ingredients', function (Blueprint $table) {
            $table->string("unit");
            $table->boolean("dash")->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string("unit");
            $table->boolean("dash")->default(false);
        });
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn("unit");
            $table->dropColumn("dash");
        });
    }
}
