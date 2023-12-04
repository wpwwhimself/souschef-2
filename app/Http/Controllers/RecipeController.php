<?php

namespace App\Http\Controllers;

use App\Models\CookingProduct;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Controllers\ProductController;
use App\Models\Product;
use Exception;

class RecipeController extends Controller
{
  /*****************************
  * COOKING STOCK ITEMS
  */
  public function getCookingProduct($id = null){
    $data = $id
    ? CookingProduct::with("product", "ingredient", "ingredient.category")->findOrFail($id)
    : CookingProduct::with("product", "ingredient", "ingredient.category")
    ->leftJoin("ingredients", "ingredients.id", "=", "ingredient_id")
    ->select("cooking_products.*")
    ->orderByRaw("case when product_id is null then 0 else 1 end")
    ->orderByRaw("case when dash then 1 else 0 end")
    ->orderBy("ingredients.name")
    ->orderByDesc("cooking_products.amount")
    ->get()
    ;
    return $data;
  }

  public function postCookingProduct(Request $rq){
    $data = CookingProduct::create([
      "product_id" => $rq->productId,
      "ingredient_id" => Product::findOrFail($rq->productId)->ingredient->id,
      "amount" => $rq->amount,
    ]);
    return $data;
  }

  public function addCookingProductsFromRecipe($recipe_id){
    $report = [];
    foreach(Recipe::findOrFail($recipe_id)->ingredients as $ingredient){
      $report[] = CookingProduct::create([
        "ingredient_id" => $ingredient->ingredient_id,
        "amount" => $ingredient->amount,
      ]);
    }
    return response()->json($report);
  }

  public function patchCookingProduct($id, Request $rq, $check_product_sufficient = false){
    $data = CookingProduct::findOrFail($id);
    foreach($rq->except("magic_word") as $key => $value){
      $data->{Str::snake($key)} = $value;
    }

    if(
      $check_product_sufficient
      && $data->amount > $data->product->stockItems->sum("amount")
    ){
      $missing_amount = $data->amount - $data->product->stockItems->sum("amount");
      $data->amount = $data->product->stockItems->sum("amount");
      CookingProduct::create([
        "ingredient_id" => $data->ingredient_id,
        "amount" => $missing_amount,
      ]);
    }

    $data->save();
    return $data;
  }

  public function deleteCookingProduct($id = null){
    if($id){
      CookingProduct::findOrFail($id)->delete();
    }else{
      CookingProduct::truncate();
    }
    return response()->json("Cooking Product deleted");
  }

  public function clearCookingProducts(){
    $report = [];
    foreach(CookingProduct::all() as $cp){
      $report[$cp->id] = [
        "ingredient_id" => $cp->ingredient_id,
        "product_id" => $cp->product_id,
        "cleared_stock_items" => [],
      ];

      if(!$cp->product_id) continue;

      $amountToClear = $cp->amount;
      foreach($cp->product->stockItems as $stockItem){
        $amountToClearNow = min($stockItem->amount, $amountToClear);
        $amountToClear -= $amountToClearNow;

        $report[$cp->id]["cleared_stock_items"][] = [
          "id" => $stockItem->id,
          "amount_before" => $stockItem->amount,
          "amount_cleared" => $amountToClearNow,
          "amount_remaining" => $amountToClear,
        ];

        $stockItem->amount -= $amountToClearNow;
        $stockItem->save();

        if($amountToClear <= 0) break;
      }
    }
    CookingProduct::truncate();
    (new ProductController)->stockCleanup();
    return response()->json($report);
  }

  /*****************************
  * RECIPES
  */
  public function getRecipe($id = null){
    $data = $id
    ? Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")
      ->find($id)
    : Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")
      ->orderBy("name")
      ->get()
      ->sortBy("stock_insufficient_percentage")
      ->values()
    ;
    return $data;
  }

  public function getRecipeByIngredient($ing_id){
    $data = Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")
      ->whereHas("ingredients", fn($q) => $q->where("ingredient_id", $ing_id))
      ->orderBy("name")
      ->get()
      ->sortBy("stock_insufficient_percentage")->values()
    ;
    return $data;
  }

  public function suggestRecipes(){
    try{
      $for_dinner = Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")
        ->where("for_dinner", true)
        ->get()
        ->random()
      ;
    }catch(Exception $e){
      $for_dinner = null;
    }
    try{
      $for_supper = Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")
        ->where("for_supper", true)
        ->get()
        ->filter(fn($el) => $el->id !== $for_dinner->id)
        ->random()
      ;
    }catch(Exception $e){
      $for_supper = null;
    }
    return compact("for_dinner", "for_supper");
  }

  public function postRecipe(Request $rq){
    $data = Recipe::create([
      "name" => $rq->name,
      "subtitle" => $rq->subtitle,
      "instructions" => $rq->instructions,
      "for_dinner" => $rq->forDinner,
      "for_supper" => $rq->forSupper,
    ]);
    return $data;
  }

  public function patchRecipe($id, Request $rq){
    $data = Recipe::find($id);
    foreach($rq->except("magic_word") as $key => $value){
      $data->{Str::snake($key)} = $value;
    }
    $data->save();
    return $data;
  }

  public function deleteRecipe($id){
    RecipeIngredient::where("recipe_id", $id)->delete();
    Recipe::find($id)->delete();
    return response()->json("Recipe deleted");
  }

  /*****************************
  * RECIPE INGREDIENTS
  */
  public function postRecipeIngredient(Request $rq){
    $data = RecipeIngredient::create([
      "recipe_id" => $rq->recipeId,
      "ingredient_id" => $rq->ingredientId,
      "amount" => $rq->amount,
      "optional" => $rq->optional,
    ]);
    return $data;
  }

  public function patchRecipeIngredient($id, Request $rq){
    $data = RecipeIngredient::find($id);
    foreach($rq->except("magic_word") as $key => $value){
      $data->{Str::snake($key)} = $value;
    }
    $data->save();
    return $data;
  }

  public function deleteRecipeIngredient($id){
    RecipeIngredient::find($id)->delete();
    return response()->json("Recipe Ingredient deleted");
  }
}
