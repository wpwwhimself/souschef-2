<?php

namespace App\Http\Controllers;

use App\Models\Category;
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

    /*****************************
     * PRODUCTS
     */

    /*****************************
     * STOCK
     */
}
