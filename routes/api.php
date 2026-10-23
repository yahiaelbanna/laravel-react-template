<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/data', function () {
    return [
        'data' => [
            [
                'id' => 1,
                'name' => 'Super Admin',
                'description' => 'Super Admin Description',
            ],
            [
                'id' => 2,
                'name' => 'Admin',
                'description' => 'Admin Description',
            ],
            [
                'id' => 3,
                'name' => 'Editor',
                'description' => 'Editor Description',
            ],
            [
                'id' => 4,
                'name' => 'Viewer',
                'description' => 'Viewer Description',
            ],
        ],
    ];
});
