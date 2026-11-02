<?php

use App\Http\Controllers\ModuleController;
use Illuminate\Support\Facades\Route;

Route::prefix('module')->name('module.')->group(function () {
    Route::get('/', [ModuleController::class, 'index'])->name('index');
    Route::get('/create', [ModuleController::class, 'create'])->name('create');
    Route::post('/', [ModuleController::class, 'store'])->name('store');
    Route::get('/{id}/edit', [ModuleController::class, 'edit'])->name('edit');
    Route::put('/{id}', [ModuleController::class, 'update'])->name('update');
});
