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

    const hasChildren = task.children && task.children.length > 0

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
                style={{width:'18px', height:'18px', cursor:'pointer'}}
                aria-label={'Mark "${task.title}" complete'}
            />
            
            <span style={{ 
                textDecoration: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.5 : 1,
                marginLeft: '8px'
            }}>
                {task.title}
            </span>

            <button onClick={handleEdit} aria-label="Edit task">Edit</button>
            <button onClick={handleDelete} aria-label="Delete task">Delete</button>
        </div>
    )

}