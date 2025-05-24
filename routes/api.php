<?php

use App\Http\Controllers\LogController;
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

Route::middleware(MagicWord::class)->group(function(){

  Route::controller(ProductController::class)->group(function(){
    Route::prefix("categories")->group(function(){
      Route::get("/{id?}", "getCategory")->name("get-category");
      Route::post("/", "postCategory")->name("post-category");
      Route::patch("/{id}", "patchCategory")->name("patch-category");
      Route::delete("/{id}", "deleteCategory")->name("delete-category");
    });

    Route::prefix("ingredients")->group(function(){
      Route::get("/category/{cat_id}", "getIngredientByCategory");
      Route::get("/in-stock-only", "getIngredientsInStock");
      Route::get("/{id?}", "getIngredient")->name("get-ingredient");
      Route::patch("/{id}", "patchIngredient")->name("patch-ingredient");
      Route::delete("/{id}", "deleteIngredient")->name("delete-ingredient");
      Route::post("/", "postIngredient")->name("post-ingredient");
    });

    Route::prefix("products")->group(function(){
      Route::get("/{id?}", "getProduct")->name("get-product");
      Route::get("/ean/{ean}/{inStock?}", "getProductByEan")->name("get-product-by-ean");
      Route::get("/ingredient/{ing_id}/{inStock?}", "getProductByIngredient")->name("get-product-by-ingredient");
      Route::post("/", "postProduct")->name("post-product");
      Route::patch("/{id}", "patchProduct")->name("patch-product");
      Route::delete("/{id}", "deleteProduct")->name("delete-product");
    });

    Route::prefix("stock")->group(function(){
      Route::get("/{id?}", "getStockItem")->name("get-stock");
      Route::get("/ingredient/{ing_id}", "getStockItemByIngredient")->name("get-stock-by-ingredient");
      Route::get("/status/lowStock", "getLowStock")->name("get-low-stock");
      Route::get("/status/spoiled", "getSpoiled")->name("get-spoiled");
      Route::post("/", "postStockItem")->name("post-stock");
      Route::patch("/{id}", "patchStockItem")->name("patch-stock");
      Route::delete("/{id}", "deleteStockItem")->name("delete-stock");
    });
  });

  Route::controller(RecipeController::class)->group(function(){
    Route::prefix("cooking-products")->group(function(){
      Route::get("/{id?}", "getCookingProduct");
      Route::post("/", "postCookingProduct");
      Route::patch("/{id}/{check_product_sufficient?}", "patchCookingProduct");
      Route::delete("/{id?}", "deleteCookingProduct");
      Route::post("/actions/clear", "clearCookingProducts");
      Route::post("/actions/add-from-recipe/{recipe_id}", "addCookingProductsFromRecipe");
    });

    Route::prefix("recipes")->group(function(){
      Route::get("/{id?}", "getRecipe")->name("get-recipe");
      Route::get("/ingredient/{ing_id}", "getRecipeByIngredient");
      Route::post("/", "postRecipe")->name("post-recipe");
      Route::patch("/{id}", "patchRecipe")->name("patch-recipe");
      Route::delete("/{id}", "deleteRecipe")->name("delete-recipe");
      Route::get("/actions/suggestions/{stocked_only?}", "suggestRecipes");
    });

    Route::prefix("recipe-ingredients")->group(function(){
      Route::post("/", "postRecipeIngredient");
      Route::patch("/{id}", "patchRecipeIngredient");
      Route::delete("/{id}", "deleteRecipeIngredient");
    });
  });

  Route::controller(LogController::class)->prefix("logs")->group(function() {
    Route::get("/", "getLogs");
  });

});
