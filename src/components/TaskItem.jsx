import { useState, useRef, useEffect } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TaskItem({task, depth, readonly = false}){

    const {dispatch, editingId, setEditingId} = useTaskContext()
    const isEditing = editingId === task.id
    const [editValue, setEditValue] = useState(task.title)
    const inputRef = useRef(null)

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: task.id})

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
    }

    // Focus the input when editing starts
    useEffect(() => {

        if(isEditing){

            inputRef.current?.focus()
            inputRef.current?.select()

        }

    }, [isEditing])

    function handleToggleComplete(){

        if(readonly && !task.completed) return
        dispatch({ type: 'TOGGLE_COMPLETE', id: task.id})

    }

    function handleToggleCollapse(){

        dispatch({ type: 'TOGGLE_COLLAPSE', id: task.id})

    }

    function handleDelete(){

        dispatch({ type: 'DELETE_TASK', id: task.id})

    }

    function handleEditStart(){

        setEditValue(task.title)
        setEditingId(task.id)

    }

    function handleSave(){

        if(editValue.trim()){

            dispatch({ type: 'EDIT_TASK', id: task.id, title: editValue.trim()})

        }
        setEditingId(null)

    }

    function handleCancel(){

        setEditValue(task.title)
        setEditingId(null)

    }

    function handleKeyDown(e){

        if(e.key === 'Enter') handleSave()
        if(e.key === 'Escape') handleCancel()

    }

    const hasChildren = task.children && task.children.length > 0

    return (
        <div data-depth={depth} ref={setNodeRef} style={style}>
            {/* Drag handle */}
            {!readonly && (
                <button className='drag-handle' {...attributes} {...listeners} aria-label="Drag to reorder">
                    ⠿
                </button>
            )}
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

            {isEditing ? (
                <>
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-label="Edit task title"
                        className="inline-edit-input"
                    />
                    <button onClick={handleSave} aria-label="Save edit">Save</button>
                    <button onClick={handleCancel} aria-label="Delete edit">Cancel</button>
                </>
            ) : (
                <>
                    <span>
                        {task.title}
                    </span>
                    {!readonly && (
                        <>
                            <button onClick={handleEditStart} aria-label="Edit task">Edit</button>
                            <button onClick={handleDelete} aria-label="Delete task">Delete</button>
                        </>
                    )}
                </>
            )}
            
        </div>
    )

}