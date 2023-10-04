<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\StockItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /*****************************
     * CATEGORIES
     */
    public function getCategory($id = null){
        $data = $id ? Category::findOrFail($id) : Category::orderBy("name")->get();
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
        $data = Category::findOrFail($id);
        foreach($rq->except("magic_word") as $key => $value){
            $data->{Str::snake($key)} = $value;
        }
        $data->save();
        return $data;
    }

    public function deleteCategory($id){
        Category::findOrFail($id)->delete();
        return response()->json("Category deleted");
    }

    /*****************************
     * INGREDIENTS
     */
    public function getIngredient($id = null){
        $data = $id ? Ingredient::findOrFail($id) : Ingredient::orderBy("name")->with("category")->get();
        return $data;
    }

    public function postIngredient(Request $rq){
        $data = Ingredient::create([
            "name" => $rq->name,
            "category_id" => $rq->categoryId,
            "freezable" => $rq->freezable,
            "minimal_amount" => $rq->minimalAmount,
            "unit" => $rq->unit,
            "dash" => $rq->dash,
        ]);
        return $data;
    }

    public function patchIngredient($id, Request $rq){
        $data = Ingredient::findOrFail($id);
        foreach($rq->except("magic_word") as $key => $value){
            $data->{Str::snake($key)} = $value;
        }
        $data->save();
        return $data;
    }

    public function deleteIngredient($id){
        Ingredient::findOrFail($id)->delete();
        return response()->json("Ingredient deleted");
    }

    /*****************************
     * PRODUCTS
     */
    public function getProduct($id = null){
        $data = $id ? Product::findOrFail($id) : Product::orderBy("name")->with("ingredient", "ingredient.category")->get();
        return $data;
    }

    public function getProductByEan($ean){
        $data = Product::where("ean", "like", "%$ean%")->with("ingredient", "ingredient.category")->get();
        return $data;
    }

    public function getProductByIngredient($ing_id){
        $data = Product::where("ingredient_id", $ing_id)->with("ingredient", "ingredient.category")->get();
        return $data;
    }

    public function postProduct(Request $rq){
        $data = Product::create([
            "ean" => $rq->ean,
            "name" => $rq->name,
            "ingredient_id" => $rq->ingredientId,
            "amount" => $rq->amount,
            "est_expiration_days" => $rq->estExpirationDays,
        ]);
        return $data;
    }

    public function patchProduct($id, Request $rq){
        $data = Product::findOrFail($id);
        foreach($rq->except("magic_word") as $key => $value){
            $data->{Str::snake($key)} = $value;
        }
        $data->save();
        return $data;
    }

    public function deleteProduct($id){
        Product::findOrFail($id)->delete();
        return response()->json("Product deleted");
    }

    /*****************************
     * STOCK
     */
    private const STK_CLEANED_UP = "Stock item discarded due to nonexistence";

    public function getStockItem($id = null){
        $data = $id ? StockItem::findOrFail($id) : StockItem::with("product", "product.ingredient", "product.ingredient.category")->get();
        return $data;
    }

    public function postStockItem(Request $rq){
        if($rq->amount <= 0){
            return response()->json($this::STK_CLEANED_UP);
        }

        // find stock items with the same expiration date and post to them
        $data = StockItem::where("product_id", $rq->productId)
            ->where("expiration_date", $rq->expirationDate)
            ->first();
        if($data){
            $data->amount += $rq->amount;
            $data->save();
        }else{
            $data = StockItem::create([
                "product_id" => $rq->productId,
                "amount" => $rq->amount,
                "expiration_date" => $rq->expirationDate,
            ]);
        }
        return $data;
    }

    public function patchStockItem($id, Request $rq){
        $data = StockItem::findOrFail($id);
        foreach($rq->except("magic_word") as $key => $value){
            $data->{Str::snake($key)} = $value;
        }
        $data->save();

        if($data->amount <= 0){
            $this->stockCleanup();
            return response()->json($this::STK_CLEANED_UP);
        }
        return $data;
    }

    public function deleteStockItem($id){
        StockItem::findOrFail($id)->delete();
        return response()->json("Stock item deleted");
    }

    private function stockCleanup(){
        StockItem::where("amount", "<=", 0)->delete();
    }
}
