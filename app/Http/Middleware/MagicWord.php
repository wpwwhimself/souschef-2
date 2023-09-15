<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MagicWord
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if($request->input("magic_word") !== env("MAGIC_WORD")){
            return json_encode([
                "status" => 401,
                "message" => "Nie wiesz, w co się pakujesz",
            ]);
        }
        return $next($request);
    }
}
