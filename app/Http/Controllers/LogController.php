<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
  public static function addLog($object, $object_id, $difference, $cause, $cause_id = null) {
    Log::create(compact(
      "object", "object_id",
      "cause", "cause_id",
      "difference",
    ));
  }

  public function getLogs(Request $rq) {
    $data = Log::with("product.ingredient.category")
      ->orderByDesc("updated_at")
      ->limit($rq->limit ?? 20)
      ->get();

    return response()->json($data);
  }
}
