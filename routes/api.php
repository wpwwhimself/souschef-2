<?php

use App\Http\Controllers\ProductController;
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
        Route::post("/", "postProduct")->name("post-product");
        Route::patch("/{id}", "patchProduct")->name("patch-product");
        Route::delete("/{id}", "deleteProduct")->name("delete-product");
    });

    Route::prefix("stock")->group(function(){
        
    });
});
