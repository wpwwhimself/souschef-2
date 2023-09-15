<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeTemplate;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    /*****************************
     * RECIPES
     */
    public function getRecipe($id = null){
        $data = $id ? Recipe::find($id) : Recipe::orderBy("name")->get();
        return $data;
    }

    public function postRecipe(Request $rq){
        $data = Recipe::create([
            "name" => $rq->name,
            "subtitle" => $rq->subtitle,
            "instructions" => $rq->instructions,
            "for_dinner" => $rq->for_dinner,
            "for_supper" => $rq->for_supper,
        ]);
        return $data;
    }

    public function patchRecipe($id, Request $rq){
        $data = Recipe::find($id);
        foreach($rq->except("magic_word") as $key => $value){
            $data->{$key} = $value;
        }
        $data->save();
        return $data;
    }

    public function deleteRecipe($id){
        RecipeTemplate::where("recipe_id", $id)->delete();
        Recipe::find($id)->delete();
        return response("Recipe deleted");
    }

    /*****************************
     * RECIPES' TEMPLATES
     */
    // public function getRecipeTemplate($id = null){
    //     $data = $id ? RecipeTemplate::find($id) : RecipeTemplate::all();
    //     return $data;
    // }

    // public function postRecipeTemplate(Request $rq){
    //     $data = RecipeTemplate::create([
    //         "ean" => $rq->ean,
    //         "name" => $rq->name,
    //         "ingredient_id" => $rq->ingredientId,
    //         "amount" => $rq->amount,
    //         "unit" => $rq->unit,
    //         "dash" => $rq->dash,
    //         "est_expiration_days" => $rq->estExpirationDays,
    //     ]);
    //     return $data;
    // }

    // public function patchRecipeTemplate($id, Request $rq){
    //     $data = RecipeTemplate::find($id);
    //     foreach($rq->except("magic_word") as $key => $value){
    //         $data->{$key} = $value;
    //     }
    //     $data->save();
    //     return $data;
    // }

    // public function deleteRecipeTemplate($id){
    //     RecipeTemplate::find($id)->delete();
    //     return response("Recipe Template deleted");
    // }
}
