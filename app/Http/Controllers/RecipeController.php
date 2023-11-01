<?php

namespace App\Http\Controllers;

use App\Models\CookingProduct;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Controllers\ProductController;

class RecipeController extends Controller
{
  /*****************************
  * COOKING STOCK ITEMS
  */
  public function getCookingProduct($id = null){
    $data = $id
    ? CookingProduct::with("product", "product.ingredient", "product.ingredient.category")->findOrFail($id)
    : CookingProduct::with("product", "product.ingredient", "product.ingredient.category")
    ->join("products", "products.id", "=", "product_id")
    ->select("cooking_products.*")
    ->orderBy("products.name")
    ->get()
    ;
    return $data;
  }

  public function postCookingProduct(Request $rq){
    $data = CookingProduct::create([
      "product_id" => $rq->productId,
      "amount" => $rq->amount,
    ]);
    return $data;
  }

  public function patchCookingProduct($id, Request $rq){
    $data = CookingProduct::findOrFail($id);
    foreach($rq->except("magic_word") as $key => $value){
      $data->{Str::snake($key)} = $value;
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
        "product_id" => $cp->product_id,
        "cleared_stock_items" => [],
      ];

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
    ? Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")->find($id)
    : Recipe::with("ingredients", "ingredients.ingredient", "ingredients.ingredient.category")->orderBy("name")->get();
    return $data;
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
