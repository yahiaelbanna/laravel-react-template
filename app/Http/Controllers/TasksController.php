<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TasksController extends Controller
{
    public function index()
    {
        return Inertia::render('tasks/index');
    }
}
