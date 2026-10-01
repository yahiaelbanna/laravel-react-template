<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TasksController;

Route::prefix('tasks')->name('tasks.')->group(function () {
    Route::get('/', [TasksController::class, 'index'])->name('index');
});
