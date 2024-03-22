<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = [
      "object", "object_id",
      "cause", "cause_id",
      "difference",
    ];
    const CREATED_AT = null;

    public function product() {
      return $this->belongsTo(Product::class, "object_id");
    }
}
