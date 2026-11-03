<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    public function index()
    {
        return Inertia::render('module/index');
    }

    public function create()
    {
        return Inertia::render('module/create');
    }

    public function store(Request $request)
    {
        // In real app, validate and store model:
        // $validated = $request->validate([...]);
        return redirect()->route('module.index');
    }

    public function edit($id)
    {
        // Example mock record for editing
        $module = [
            'id' => (int) $id,
            'name' => 'Sample Module '.$id,
            'description' => 'This is a sample module description ready for editing.',
            'type' => 'web-module',
            'roles' => ['admin', 'editor'],
            'release_date' => '2026-11-02',
        ];

        return Inertia::render('module/edit', [
            'module' => $module,
        ]);
    }

    public function update(Request $request, $id)
    {
        // In real app, validate and update model:
        // $validated = $request->validate([...]);
        return redirect()->route('module.index');
    }

    public function clone($id)
    {
        return back()->with('success', 'Module cloned successfully');
    }

    public function destroy($id)
    {
        return back()->with('success', 'Module deleted successfully');
    }
}
