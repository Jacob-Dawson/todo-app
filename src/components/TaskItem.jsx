import { useTaskContext } from '../context/TaskContext'

export default function TaskItem({task, depth}){

    const { dispatch } = useTaskContext()

    function handleToggleComplete(){

        dispatch({ type: 'TOGGLE_COMPLETE', id: task.id})

    }

    function handleToggleCollapse(){

        dispatch({ type: 'TOGGLE_COLLAPSE', id: task.id})

    }

    function handleDelete(){

        dispatch({ type: 'DELETE_TASK', id: task.id})

    }

    function handleEdit(){

        // Placeholder
        const newTitle = prompt('Edit task:', task.title)
        if(newTitle && newTitle.trim()){

            dispatch({ type: 'EDIT_TASK', id: task.id, title: newTitle.trim()})

        }

    }

    const hasChildren = task.hasChildren && task.hasChildren.length > 0

    return (
        <div data-depth={depth}>
            {/* Collapse toggle */}
            {hasChildren && (
                <button onClick={handleToggleCollapse} aria-label="Toggle subtasks">
                    {task.collapsed ? '▶' : '▼'}
                </button>
            )}

            <input
                type = "checkbox"
                checked = {task.completed}
                onChange = {handleToggleComplete}
                aria-label={'Mark "${task.title}" complete'}
            />
            
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none'}}>
                {task.title}
            </span>

            <button onClick={handleEdit} aria-label="Edit task">Edit</button>
            <button onClick={handleDelete} aria-label="Delete task">Delete</button>
        </div>
    )

}