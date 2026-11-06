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
        // Example mock record for editing with repeater data
        $module = [
            'id' => (int) $id,
            'name' => 'Sample Module '.$id,
            'description' => 'This is a sample module description ready for editing.',
            'type' => 'web-module',
            'roles' => ['admin', 'editor'],
            'release_date' => '2026-11-02',
            'features' => [
                ['feature_name' => 'Dark Mode Support', 'status' => 'active', 'release_date' => '2026-05-10'],
                ['feature_name' => 'Kanban Drag & Drop', 'status' => 'beta', 'release_date' => '2026-06-15'],
            ],
            'team_members' => [
                ['name' => 'Ahmed Ali', 'email' => 'ahmed@example.com', 'role' => 'developer'],
                ['name' => 'Sara Omar', 'email' => 'sara@example.com', 'role' => 'designer'],
            ],
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

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            // 'ids.*' => 'required|exists:modules,id',
        ]);

        // foreach ($request->ids as $id) {
        //     // Module::destroy($id);

        // }

        return back()->with('success', 'Modules deleted successfully');
    }
}
