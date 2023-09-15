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
            $code = 401;
            $message = "Nie wiesz, w co się pakujesz";

            // clear the old headers
            header_remove();
            // set the actual code
            http_response_code($code);
            // set the header to make sure cache is forced
            header("Cache-Control: no-transform,public,max-age=300,s-maxage=900");
            // treat this as json
            header('Content-Type: application/json');
            $status = array(
                200 => '200 OK',
                400 => '400 Bad Request',
                422 => 'Unprocessable Entity',
                500 => '500 Internal Server Error'
                );
            // ok, validation error, or failure
            header('Status: '.$status[$code]);
            // return the encoded json
            return json_encode(array(
                'status' => $code < 300, // success or not?
                'message' => $message
                ));
        }
        return $next($request);
    }
}
