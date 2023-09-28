<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\RecipeController;
use App\Http\Middleware\MagicWord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::middleware(MagicWord::class)->group(function(){

Route::controller(ProductController::class)->group(function(){
    Route::prefix("category")->group(function(){
        Route::get("/{id?}", "getCategory")->name("get-category");
        Route::post("/", "postCategory")->name("post-category");
        Route::patch("/{id}", "patchCategory")->name("patch-category");
        Route::delete("/{id}", "deleteCategory")->name("delete-category");
    });

    Route::prefix("ingredient")->group(function(){
        Route::get("/{id?}", "getIngredient")->name("get-ingredient");
        Route::post("/", "postIngredient")->name("post-ingredient");
        Route::patch("/{id}", "patchIngredient")->name("patch-ingredient");
        Route::delete("/{id}", "deleteIngredient")->name("delete-ingredient");
    });

    Route::prefix("product")->group(function(){
        Route::get("/{id?}", "getProduct")->name("get-product");
        Route::get("/ean/{ean}", "getProductByEan")->name("get-product-by-ean");
        Route::get("/ingredient/{ing_id}", "getProductByIngredient")->name("get-product-by-ingredient");
        Route::post("/", "postProduct")->name("post-product");
        Route::patch("/{id}", "patchProduct")->name("patch-product");
        Route::delete("/{id}", "deleteProduct")->name("delete-product");
    });

    Route::prefix("stock")->group(function(){
        Route::get("/{id?}", "getStockItem")->name("get-stock");
        Route::post("/", "postStockItem")->name("post-stock");
        Route::patch("/{id}", "patchStockItem")->name("patch-stock");
        Route::delete("/{id}", "deleteStockItem")->name("delete-stock");
    });
});

Route::controller(RecipeController::class)->group(function(){
    Route::prefix("recipe")->group(function(){
        Route::get("/{id?}", "getRecipe")->name("get-recipe");
        Route::post("/", "postRecipe")->name("post-recipe");
        Route::patch("/{id}", "patchRecipe")->name("patch-recipe");
        Route::delete("/{id}", "deleteRecipe")->name("delete-recipe");
    });
});

});
