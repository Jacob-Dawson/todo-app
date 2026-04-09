# Nested Task Manager

A feature-rich, three-tier task management app built with React. Designed as a portfolio project to demonstrate advanced React patterns, state management, and modern UI/UX practices.

🔗 **[https://jacob-dawson-todo-app.netlify.app/](https://jacob-dawson-todo-app.netlify.app/)**

---

## Screenshots

*(Add screenshots here after deployment)*

---

## Features

### Task Management
- Add, edit, and delete tasks at three nested tiers
- Inline editing with keyboard support (Enter to save, Escape to cancel)
- Collapse and expand subtasks
- Check off tasks with cascading completion — checking a parent automatically checks all descendants
- Auto-progress — a parent task completes automatically when all its children are checked
- Checked tasks move to a dedicated completed section, with parent context preserved

### Drag and Drop
- Drag tasks up and down to reorder within the same tier
- Drag right to demote a task (move it deeper into the hierarchy)
- Drag left to promote a task (move it up a tier)
- Tier limit enforced — subtrees cannot exceed three levels regardless of depth
- Drag lists to reorder within Pinned and Lists sections

### Multiple Lists
- Create and manage multiple independent task lists
- Pin lists to keep them at the top
- Pinned and unpinned lists are kept in separate sections
- Masonry column layout on wider screens
- Each list has its own independent undo/redo history

### UI & UX
- Full undo/redo support per list
- Dark mode with persistence across sessions
- Empty state messaging
- Task remaining count and completed task count per list
- Keyboard shortcut — press `N` to focus the add task input
- Slide-in animation on task creation, fade-out on deletion
- Drag overlay showing the dragged item
- Mobile-first responsive layout

### Data
- All data persisted to `localStorage` — survives page refresh
- Automatic migration from single-list format to multi-list format

---

## Technical Highlights

This project was built to demonstrate the following React patterns and concepts:

### Recursive Components
`Task` renders `TaskList`, and `TaskList` renders `Task` — a recursive component tree that handles arbitrary nesting depth. The three-tier limit is enforced via a `depth` prop passed through the tree.

### useReducer with History
All task state is managed through a `useReducer` hook wrapped in a history reducer that implements undo/redo. Every action pushes to a `past` stack; undo pops from it and pushes to `future`.

```js
{ past: [...], present: tasks, future: [...] }
```

### Recursive State Updates
Updating a deeply nested task without mutation uses a recursive helper:

```js
function updateTask(tasks, id, updater) {
  return tasks.map(task =>
    task.id === id
      ? updater(task)
      : { ...task, children: updateTask(task.children, id, updater) }
  );
}
```

### Custom Hooks
- `useTaskReducer` — encapsulates all task state logic, history, and localStorage sync
- `useLists` — manages the array of lists, persistence, and list-level operations

### Context API
`TaskContext` provides `tasks`, `dispatch`, and editing state to the component tree, avoiding prop drilling across recursive component levels.

### forwardRef
`AddTaskForm` uses `forwardRef` to expose its input to the parent, enabling the `N` keyboard shortcut to focus it from `App`.

### @dnd-kit Integration
Drag and drop is implemented using `@dnd-kit/core` and `@dnd-kit/sortable`. Horizontal drag delta is used to detect tier shifting (promote/demote), while vertical movement handles reordering. A `DragOverlay` provides visual feedback during drag.

---

## Tech Stack

- **React** — UI and state management
- **@dnd-kit** — drag and drop
- **CSS** — custom properties, responsive layout, dark mode, animations
- **Vite** — build tool
- **localStorage** — data persistence

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Jacob-Dawson/todo-app.git
cd todo-app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

---

## Project Structure

```
src/
├── App.jsx                  # Root component, list-level DnD context
├── context/
│   └── TaskContext.jsx      # Shared task state via Context API
├── hooks/
│   ├── useTaskReducer.js    # Task state, history, localStorage sync
│   └── useLists.js          # List management and persistence
├── components/
│   ├── ListContainer.jsx    # Individual list with its own task state
│   ├── TaskList.jsx         # Renders a list of Task components
│   ├── Task.jsx             # Recursive task component
│   ├── TaskItem.jsx         # Single task row with drag, edit, delete
│   └── AddTaskForm.jsx      # Add task input (forwardRef)
├── utils/
│   └── taskUtils.js         # Recursive tree helpers
└── styles/
    └── main.css             # All styles, dark mode, responsive layout
```

---

## Author

Jacob Dawson — [github.com/Jacob-Dawson](https://github.com/Jacob-Dawson)
