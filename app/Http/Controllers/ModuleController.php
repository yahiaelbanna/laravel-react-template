<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ModuleController extends Controller
{
    public function index()
    {
        return Inertia::render('module/index');
    }

    public function create()
    {
        return Inertia::render('module/index');
    }
}
