# Config-Driven Architecture Starter Kit (Laravel 12 + React 19 + TypeScript)

A modern, high-productivity starter kit designed for rapid dashboard and web application development. 

Instead of writing repetitive boilerplate code for every CRUD module (views, tables, kanban boards, selection handlers, action menus, and toolbars), this architecture is **Config-Driven (CDD)**: you define a lightweight configuration schema, and the engine automatically builds the responsive, interactive UI.

---

## Table of Contents
1. [Core Philosophy](#core-philosophy)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [How It Works (Workflow Overview)](#how-it-works-workflow-overview)
5. [Resource Page Architecture](#resource-page-architecture)
6. [Master Resource Configuration (`Config`)](#master-resource-configuration-config)
7. [Table Component & Column Schema](#table-component--column-schema)
   - [Column Config Schema](#column-config-schema)
   - [Column Types Reference Guide](#column-types-reference-guide)
8. [Kanban Component & Schema](#kanban-component--schema)
   - [Kanban Config Schema](#kanban-config-schema)
9. [Built-in State & Custom Hooks](#built-in-state--custom-hooks)
10. [Step-by-Step: Creating a New Module](#step-by-step-creating-a-new-module)
11. [AI Agent Prompt Guide](#ai-agent-prompt-guide)
12. [Feature Progress & Roadmap](#feature-progress--roadmap)

---

## Core Philosophy

Traditional dashboard development suffers from massive boilerplate duplication:
- Every entity (Users, Orders, Tasks, Products) needs its own table view, column definitions, dropdown actions, and filter panels.
- Switching between view modes (e.g. Table and Kanban) usually requires writing completely separate pages and state logic.

**With this starter kit:**
- **Zero UI Boilerplate**: Core components are dynamic and consume strongly-typed configuration objects.
- **Consistent UX**: All modules share the exact same keyboard accessibility, toolbars, selection behavior, and responsive layout.
- **AI-Friendly**: Developers or AI assistants (Cursor, Antigravity, Claude, Copilot) can create an entire working resource module simply by declaring the schema in seconds.

---

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19, TypeScript
- **Routing & Bridge**: Inertia.js v2
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Drag & Drop**: `@hello-pangea/dnd`
- **Icons**: `lucide-react`

---

## Project Structure

```text
├── app/
│   └── Http/Controllers/
│       └── ModuleController.php           # Resource controllers returning Inertia responses
├── resources/js/
│   ├── components/
│   │   ├── resource-page/                 # Core Config-Driven Engine
│   │   │   ├── resource-page.tsx          # Main layout container (Breadcrumbs, Toolbar, Views)
│   │   │   ├── tool-bar.tsx               # Top action toolbar (View switcher, Add button, Filter toggle)
│   │   │   ├── data-table/                # Dynamic Table Engine
│   │   │   │   ├── data-table.tsx         # Table wrapper
│   │   │   │   ├── header.tsx             # Dynamic headers + bulk select checkbox
│   │   │   │   ├── row.tsx                # Row rendering + action dropdown menu
│   │   │   │   ├── cell.tsx               # Cell renderer switch based on column type
│   │   │   │   └── no-data-found.tsx      # Empty state display
│   │   │   └── kanban/                    # Dynamic Kanban Board Engine
│   │   │       ├── kanban.tsx             # DragDropContext container + column grouping
│   │   │       ├── column.tsx             # Droppable column container
│   │   │       └── card.tsx               # Draggable resource card
│   │   └── ui/                            # shadcn/ui base primitives (table, button, badge, etc.)
│   ├── hooks/resource-page/
│   │   ├── use-view-type.tsx              # Persistent view toggle (table vs kanban)
│   │   ├── use-filter-panel.tsx           # Persistent slide-out filter panel state
│   │   └── use-selection.tsx              # Multi-row selection store (useSyncExternalStore)
│   ├── types/
│   │   └── config-type.ts                 # TypeScript interfaces for Config, Column, Kanban
│   └── pages/
│       └── [module]/                      # Module implementation directory (e.g. module/, tasks/)
│           ├── config.tsx                 # Master resource config
│           ├── table-schema.tsx           # Columns definition
│           ├── kanban-schema.tsx          # Kanban grouping and card mapping
│           └── index.tsx                  # Inertia page entrypoint
```

---

## How It Works (Workflow Overview)

```
+-----------------------------------------------------------+
| 1. Laravel Controller (e.g., ModuleController.php)        |
|    Fetches models from DB and passes data to Inertia.     |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
| 2. Inertia Page (e.g., resources/js/pages/module/index.tsx)|
|    Supplies `config` schema and `data` array.             |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
| 3. <ResourcePage config={config} data={data} />           |
|    - Renders AppLayout & Breadcrumbs                      |
|    - Renders ToolBar (Filter button, View toggle, Create) |
|    - Switches between <DataTable /> and <KanbanView />    |
+-----------------------------------------------------------+
```

---

## Resource Page Architecture

The main engine is `<ResourcePage />` (`resources/js/components/resource-page/resource-page.tsx`).

It receives two primary props:
1. `config: Config` — The complete configuration object for the module.
2. `data: any[]` — An array of resource records returned from the backend.

### Key Layout Sections:
1. **Header & Breadcrumbs**: Generates automatic breadcrumbs based on `config.pluralTitle` and `config.modelName`.
2. **ToolBar**:
   - **Filter Panel Toggle**: Slides open/closes the filter sidebar.
   - **View Switcher**: Switches between `table` and `kanban` views (only shown if configured in `config.viewTypes`).
   - **Primary Action Button**: "Add {Title}" or custom `createLabel`.
3. **Filter Panel Area**: Collapsible side-panel for resource filtering.
4. **Active Viewport**: Displays either `DataTable` or `KanbanView` depending on the active view state.

---

## Master Resource Configuration (`Config`)

Located at `resources/js/types/config-type.ts`, the `Config` interface controls all features, titles, permissions, and layout options for any given resource.

### Config Options Reference

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Required** | Singular title of the entity (e.g. `"Product"`, `"Task"`). |
| `pluralTitle` | `string` | **Required** | Plural title used in navigation and page titles (e.g. `"Products"`). |
| `modelName` | `string` | **Required** | URL slug and identifier (e.g. `"products"`, `"tasks"`). |
| `viewTypes` | `ViewTypes[]` | `['table']` | Supported views for this resource: `['table']`, `['kanban']`, or `['table', 'kanban']`. |
| `createable` | `boolean` | `true` | Enables or hides the primary "Create/Add" button in the toolbar. |
| `editable` | `boolean` | `true` | Enables or hides the "Edit" action inside row action menus. |
| `duplicateable` | `boolean` | `false` | Enables or hides the "Duplicate" action in row action menus. |
| `showable` | `boolean` | `false` | Enables or hides the "View/Details" action. |
| `deletable` | `boolean` | `true` | Enables or hides the "Delete" action in row action menus. |
| `createLabel` | `string` | `"Add {title}"` | Custom label for the create button (e.g. `"New Task"`). |
| `editLabel` | `string` | `"Edit"` | Custom label for the edit action. |
| `duplicateLabel` | `string` | `"Duplicate"` | Custom label for the duplicate action. |
| `showLabel` | `string` | `"View"` | Custom label for the view action. |
| `deleteLabel` | `string` | `"Delete"` | Custom label for the delete action. |
| `deleteConfirmTitle` | `string` | Optional | Custom title for delete confirmation modal. |
| `deleteConfirmMessage`| `string` | Optional | Custom confirmation message before deletion. |
| `deleteSuccessMessage`| `string` | Optional | Toast message displayed after successful deletion. |
| `deleteErrorMessage` | `string` | Optional | Toast message displayed upon deletion failure. |
| `columns` | `Column[]` | `[]` | Array of column schemas for the Table view. |
| `kanbanSchema` | `KanbanConfig` | Optional | Schema mapping for the Kanban board view. |

### Example Config (`config.tsx`)

```typescript
import Config from "@/types/config-type";
import { columns } from "./table-schema";
import { kanbanConfig } from "./kanban-schema";

const config: Config = {
    title: "Task",
    pluralTitle: "Tasks",
    modelName: "tasks",

    createLabel: "Create Task",

    createable: true,
    editable: true,
    duplicateable: true,
    showable: false,
    deletable: true,

    viewTypes: ["table", "kanban"],

    columns: columns,
    kanbanSchema: kanbanConfig,
};

export default config;
```

---

## Table Component & Column Schema

The `DataTable` engine dynamically loops through records and formats cell values based on each column's specified `type`.

### Column Config Schema (`Column`)

```typescript
export type Column = {
    key: string;                                // Model attribute key (e.g. 'name', 'email', 'status')
    title: string;                              // Header display title (e.g. 'Customer Name')
    type?: columnType;                          // Cell formatting type (defaults to raw value)
    options?: Record<string, BadgeVariant>;     // Mapping for 'badge' variant types
};
```

### Column Types Reference Guide

| Type Key | Expected Input Value | What It Renders | When to Use |
| :--- | :--- | :--- | :--- |
| `text` | `string` | Capitalized text element (`<div className="capitalize">...</div>`). | For standard names, titles, city, general string attributes. |
| `email` | `string` | Raw email string. | For email addresses. |
| `number` | `number` \| `string` | Formatted number with comma separators (e.g. `10,000`). If empty, displays `—`. | For quantities, view counts, weights, inventory levels. |
| `currency` | `number` \| `string` | Formatted number with comma separators and currency suffix (`EGP`). If empty, displays `—`. | For prices, total balances, salaries, amounts. |
| `date` | ISO Date / String | Formatted locale date (`new Date(value).toLocaleDateString()`). | For timestamps like `created_at`, `due_date`, `birth_date`. |
| `datetime` | ISO Date / String | Formatted date and time string. | For scheduled events, updated_at timestamps. |
| `badge` | `string` | `<Badge variant={...}>value</Badge>`. Variant mapped from `column.options[value]`. | For statuses (`active`, `pending`, `draft`, `archived`, `trashed`). |
| `undefined` / default | Any | Direct value output without formatting. | For IDs, keys, or fallback values. |

#### Badge Variants (`BadgeVariant`):
- `"default"` (Primary dark fill)
- `"secondary"` (Muted gray background)
- `"destructive"` (Red alert fill for errors/trashed items)
- `"outline"` (Subtle border outline)

### Example Table Schema (`table-schema.tsx`)

```typescript
import { Column } from "@/types/config-type";

export const columns: Column[] = [
    {
        key: "id",
        title: "ID",
    },
    {
        key: "name",
        title: "Task Name",
        type: "text",
    },
    {
        key: "email",
        title: "Assigned Email",
        type: "email",
    },
    {
        key: "balance",
        title: "Budget",
        type: "currency",
    },
    {
        key: "status",
        title: "Status",
        type: "badge",
        options: {
            draft: "secondary",
            published: "default",
            trashed: "destructive",
            archived: "outline",
        },
    },
    {
        key: "created_at",
        title: "Created At",
        type: "date",
    },
];
```

---

## Kanban Component & Schema

When `viewTypes` includes `"kanban"`, users can switch from Table view to a full drag-and-drop Kanban Board powered by `@hello-pangea/dnd`.

### Kanban Config Schema (`KanbanConfig`)

| Key | Type | Description |
| :--- | :--- | :--- |
| `groupByKey` | `string` | The item property used to divide items into columns (e.g. `"status"`). When an item is dragged across columns, this key is updated. |
| `columns` | `KanbanColumn[]` | Array of column objects: `{ id: string, title: string, color?: string }`. |
| `card` | `KanbanCardMapping` | Defines which model keys map to card elements. |

#### `KanbanCardMapping` Keys:
- `titleKey` (`string`, **Required**): The primary title text of the card (e.g. `"name"`).
- `codeKey` (`string`, Optional): A code or ID displayed in small muted text at the top (e.g. `"id"` or `"code"`).
- `descriptionKey` (`string`, Optional): Secondary description or subtitle (e.g. `"balance"`, `"summary"`).
- `dateKey` (`string`, Optional): Date attribute to display on the card.
- `badgeKeys` (`string[]`, Optional): Array of property keys rendered as outline badges at the bottom of the card.

### Example Kanban Schema (`kanban-schema.tsx`)

```typescript
import { KanbanConfig } from "@/types/config-type";

export const kanbanConfig: KanbanConfig = {
    groupByKey: "status",
    columns: [
        { id: "draft", title: "Draft" },
        { id: "published", title: "Published" },
        { id: "archived", title: "Archived" },
        { id: "trashed", title: "Trashed" },
    ],
    card: {
        titleKey: "name",
        codeKey: "id",
        descriptionKey: "balance",
        dateKey: "created_at",
        badgeKeys: ["status"],
    },
};
```

---

## Built-in State & Custom Hooks

The engine uses lightweight standalone reactive stores built with React 19's `useSyncExternalStore`. This ensures instant reactivity without prop drilling or heavy context providers.

### 1. `useViewType({ viewTypes })`
- **File**: `resources/js/hooks/resource-page/use-view-type.tsx`
- **Functionality**: Manages whether the current view is `"table"` or `"kanban"`.
- **Persistence**: Automatically persists user preference in `localStorage` (`"view"`).

### 2. `useFilterPanel()`
- **File**: `resources/js/hooks/resource-page/use-filter-panel.tsx`
- **Functionality**: Toggles the collapsible filter sidebar.
- **Persistence**: Remembers sidebar open/closed state in `localStorage` (`"panel"`).
- **Methods**: `panel` (boolean), `togglePanel()`, `openPanel()`, `closePanel()`.

### 3. `useSelection()`
- **File**: `resources/js/hooks/resource-page/use-selection.tsx`
- **Functionality**: Handles multi-row selection for bulk actions.
- **Methods**:
  - `selected`: `Set<string>` of selected record IDs.
  - `isSelected(id)`: Checks if a row is selected.
  - `toggle(id)`: Toggles row selection checkbox.
  - `selectAll(ids)`: Selects all visible rows.
  - `clear()`: Deselects all rows.
  - `count`: Total count of selected items.
- **Header Checkbox**: Supports true, false, and indeterminate states automatically.

---

## Step-by-Step: Creating a New Module

Follow this 5-step guide to add any new CRUD module (e.g., `customers`):

### Step 1: Create the Controller
In `app/Http/Controllers/CustomerController.php`:
```php
<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::latest()->get();

        return Inertia::render('customers/index', [
            'data' => $customers
        ]);
    }
}
```

### Step 2: Define Table Schema
In `resources/js/pages/customers/table-schema.tsx`:
```typescript
import { Column } from "@/types/config-type";

export const columns: Column[] = [
    { key: "id", title: "ID" },
    { key: "name", title: "Full Name", type: "text" },
    { key: "email", title: "Email", type: "email" },
    { key: "company", title: "Company", type: "text" },
    { 
        key: "status", 
        title: "Status", 
        type: "badge",
        options: {
            lead: "secondary",
            active: "default",
            inactive: "destructive"
        }
    },
    { key: "created_at", title: "Joined Date", type: "date" },
];
```

### Step 3: Define Kanban Schema (Optional)
In `resources/js/pages/customers/kanban-schema.tsx`:
```typescript
import { KanbanConfig } from "@/types/config-type";

export const kanbanConfig: KanbanConfig = {
    groupByKey: "status",
    columns: [
        { id: "lead", title: "New Leads" },
        { id: "active", title: "Active Customers" },
        { id: "inactive", title: "Inactive" },
    ],
    card: {
        titleKey: "name",
        codeKey: "id",
        descriptionKey: "company",
        badgeKeys: ["status"],
    },
};
```

### Step 4: Assemble Master Config
In `resources/js/pages/customers/config.tsx`:
```typescript
import Config from "@/types/config-type";
import { columns } from "./table-schema";
import { kanbanConfig } from "./kanban-schema";

const config: Config = {
    title: "Customer",
    pluralTitle: "Customers",
    modelName: "customers",

    createable: true,
    editable: true,
    deletable: true,
    duplicateable: false,

    viewTypes: ["table", "kanban"],

    columns: columns,
    kanbanSchema: kanbanConfig,
};

export default config;
```

### Step 5: Render the Resource Page
In `resources/js/pages/customers/index.tsx`:
```tsx
import ResourcePage from "@/components/resource-page/resource-page";
import config from "./config";

export default function CustomersIndex({ data }: { data: any[] }) {
    return <ResourcePage config={config} data={data} />;
}
```

Add your route in `routes/web.php`:
```php
Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
```

---

## AI Agent Prompt Guide

If you are using an AI Coding Agent (Cursor, Antigravity IDE, Claude Code, Windsurf) to generate features in this repository, provide this prompt:

> **Agent Instruction:**
> "In this project, always adhere to the Config-Driven Architecture:
> 1. Do NOT build custom, hardcoded table views or kanban views.
> 2. To create a new module, build the files under `resources/js/pages/{module_name}/`:
>    - `table-schema.tsx` with typed `Column[]` items using supported cell types (`text`, `email`, `number`, `currency`, `date`, `datetime`, `badge`).
>    - `kanban-schema.tsx` if Kanban view is required.
>    - `config.tsx` satisfying the `Config` interface from `@/types/config-type`.
>    - `index.tsx` exporting a component rendering `<ResourcePage config={config} data={data} />`.
> 3. Keep all core reusable logic in `resources/js/components/resource-page/`."

---

## Feature Progress & Roadmap

### Finished Features (Current Status)
- [x] **Config-Driven Resource Page (`ResourcePage`)**: Unified breadcrumbs, toolbar, and container.
- [x] **Dynamic Data Table (`DataTable`)**:
  - [x] Config-driven column definitions.
  - [x] Cell renderers for: `text`, `email`, `number`, `currency` (EGP), `date`, `badge`.
  - [x] Sticky table header.
  - [x] Empty state (`NoDataFound`) with custom messaging.
  - [x] Row action dropdown menu (Edit, Duplicate, Delete) with permission switches.
- [x] **Dynamic Kanban View (`KanbanView`)**:
  - [x] Drag & drop cards between columns using `@hello-pangea/dnd`.
  - [x] Configurable grouping key (`groupByKey`).
  - [x] Customizable card fields (`titleKey`, `codeKey`, `descriptionKey`, `badgeKeys`).
- [x] **ToolBar Controls**:
  - [x] Filter sidebar toggle button.
  - [x] View switcher toggle (Table vs Kanban) with tooltips.
  - [x] Dynamic "Add" button linked to resource config.
- [x] **State & Store Management**:
  - [x] Persistent view mode across pages and sessions via `localStorage`.
  - [x] Persistent filter panel state via `localStorage`.
  - [x] Bulk selection system (`useSelection`) supporting single, all, and indeterminate states.

### Planned Features (Next Milestones)
- [ ] **Filter Panel Engine**:
  - [ ] Schema-driven filter field generation (text search, select dropdowns, date ranges, number ranges).
  - [ ] Reset and apply filter state synced with Inertia query parameters.
- [ ] **Dynamic Form Modal / Drawer**:
  - [ ] Config-driven CRUD forms (`FormSchema`) for creating and editing records without leaving the page.
- [ ] **Server-Side Kanban Sync**:
  - [ ] Emit backend Inertia/Axios status update request upon `onDragEnd`.
- [ ] **Bulk Actions Toolbar**:
  - [ ] Floating action bar displaying selected count with actions: Bulk Delete, Bulk Status Update, Export Selected.
- [ ] **Server-side Pagination & Sorting**:
  - [ ] Column sort triggers (ASC/DESC) connected to query string parameters.
  - [ ] Integrated pagination controls at the bottom of `DataTable`.
- [ ] **Import / Export Handlers**:
  - [ ] CSV/Excel export and modal for file import.
