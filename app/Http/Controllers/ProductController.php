<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /*****************************
     * CATEGORIES
     */
    public function getCategory($id = null){
        $data = $id ? Category::find($id) : Category::all();
        return $data;
    }

    public function postCategory(Request $rq){
        $data = Category::create([
            "name" => $rq->name,
            "symbol" => $rq->symbol,
        ]);
        return $data;
    }

    public function patchCategory($id, Request $rq){
        $data = Category::find($id)->update([
            "name" => $rq->name,
            "symbol" => $rq->symbol,
        ]);
        return $data;
    }

    public function deleteCategory($id){
        Category::find($id)->delete();
        return response("Category deleted");
    }

    /*****************************
     * INGREDIENTS
     */
    public function getIngredient($id = null){
        $data = $id ? Ingredient::find($id) : Ingredient::all();
        return $data;
    }

    public function postIngredient(Request $rq){
        $data = Ingredient::create([
            "name" => $rq->name,
            "category_id" => $rq->categoryId,
            "freezable" => $rq->freezable,
        ]);
        return $data;
    }

    public function patchIngredient($id, Request $rq){
        $data = Ingredient::find($id)->update([
            "name" => $rq->name,
            "category_id" => $rq->categoryId,
            "freezable" => $rq->freezable,
        ]);
        return $data;
    }

    public function deleteIngredient($id){
        Category::find($id)->delete();
        return response("Ingredient deleted");
    }

    /*****************************
     * PRODUCTS
     */
    public function getProduct($id = null){
        $data = $id ? Product::find($id) : Product::all();
        return $data;
    }

    public function postProduct(Request $rq){
        $data = Product::create([
            "ean" => $rq->ean,
            "name" => $rq->name,
            "ingredient_id" => $rq->ingredientId,
            "amount" => $rq->amount,
            "unit" => $rq->unit,
            "dash" => $rq->dash,
            "est_expiration_days" => $rq->estExpirationDays,
        ]);
        return $data;
    }

    public function patchProduct($id, Request $rq){
        $data = Product::find($id)->update([
            "ean" => $rq->ean,
            "name" => $rq->name,
            "ingredient_id" => $rq->ingredientId,
            "amount" => $rq->amount,
            "unit" => $rq->unit,
            "dash" => $rq->dash,
            "est_expiration_days" => $rq->estExpirationDays,
        ]);
        return $data;
    }

    public function deleteProduct($id){
        Category::find($id)->delete();
        return response("Product deleted");
    }

    /*****************************
     * STOCK
     */
}
