import { useReducer, useEffect } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { findParentId, findTaskById } from "../utils/taskUtils"

// placeholder

const initialState = []

// helpers

function createTask(title){

    return {
        id: crypto.randomUUID(),
        title,
        completed: false,
        collapsed: false,
        children: []
    }

}

function addTaskToParent(tasks, parentId, newTask){

    return tasks.map(task => 
        task.id === parentId
            ? { ...task, children: [...task.children, newTask]}
            : { ...task, children: addTaskToParent(task.children, parentId, newTask)}
    )

}

// Recursive helper
function updateTask(tasks, id, updater){

    return tasks.map(task => 
        task.id === id
            ? updater(task)
            : { ...task, children: updateTask(task.children, id, updater)}
    )

}

function deleteTask(tasks, id){

    return tasks
        .filter(task => task.id !== id)
        .map(task => ({ ...task, children: deleteTask(task.children, id)}))

}

function allChildrenComplete(task){

    if(task.children.length === 0) return task.completed
    return task.children.every(child => allChildrenComplete(child))

}

function syncParentCompletion(tasks){

    return tasks.map(task => {

        const syncedChildren = syncParentCompletion(task.children)
        const completed = syncedChildren.length > 0
            ? syncedChildren.every(child => allChildrenComplete(child))
            : task.completed
        return { ...task, completed, children: syncedChildren}

    })

}

// Reducer (actions to be filled in next)
function taskReducer(tasks, action){

    switch(action.type){
        // actions for task such as add, edit, delete, toggle, etc

        case 'ADD_TASK':{
            if(!action.title?.trim()) return tasks
            const newTask = createTask(action.title)
            if(action.parentId === null){
                return [...tasks, newTask]
            }
            return addTaskToParent(tasks, action.parentId, newTask)
        }

        case 'EDIT_TASK':{
            return updateTask(tasks, action.id, task => ({
                ...task, 
                title: action.title
            }))
        }

        case 'DELETE_TASK':{
            return deleteTask(tasks, action.id)
        }

        case 'TOGGLE_COMPLETE':{
            const updated = updateTask(tasks, action.id, task => (
                setCompletedRecursive(task, !task.completed)
            ))
            return syncParentCompletion(updated)
        }

        case 'TOGGLE_COLLAPSE':{
            return updateTask(tasks, action.id, task => ({ ...task, collapsed: !task.collapsed}))
        }

        case 'REORDER_TASKS':{
            return reorderTasks(tasks, action.parentId, action.activeId, action.overId)
        }

        case 'REPARENT_TASK':{
            // Find and extract the task being moved
            const taskToMove = findTaskById(tasks, action.activeId)
            if(!taskToMove) return tasks

            // Remove it from its current position
            const withoutTask = deleteTask(tasks, action.activeId)

            // Insert it under the new parent
            return insertTask(withoutTask, action.newParentId, taskToMove, action.overId, action.insertAfter ?? false)
        }

        default:
            return tasks
    }

}

// Actions that should not be undoable
const NO_HISTORY = new Set(['TOGGLE_COLLAPSE'])

// History reducer wrapper
function historyReducer(state, action){

    if(action.type === 'UNDO'){

        if(state.past.length === 0) return state
        const previous = state.past[state.past.length - 1]
        return {
            past: state.past.slice(0,-1),
            present: previous,
            future: [state.present, ...state.future]
        }

    }

    if(action.type === 'REDO'){

        if(state.future.length === 0) return state
        const next = state.future[0]
        return {
            past: [...state.past, state.present],
            present: next,
            future: state.future.slice(1)
        }

    }

    const newPresent = taskReducer(state.present, action)
    if(newPresent === state.present) return state

    if(NO_HISTORY.has(action.type)){

        return {...state, present: newPresent}

    }

    return {
        past: [...state.past, state.present],
        present: newPresent,
        future: []
    }

}

// Custom hook

export default function useTaskReducer(initialTasks, onTasksChange){

    const [state, dispatch] = useReducer(historyReducer, null, () => {
        // Load from localStorage on first render
        return { past: [], present: initialTasks ?? [], future: []};

    })

    // Sync to localStorage on every state change
    useEffect(() => {

        onTasksChange?.(state.present)

    }, [state.present])

    return { 
        tasks: state.present,
        dispatch,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0
    }

}

// sortable function
function reorderTasks(tasks, parentId, activeId, overId){

    if(parentId === null){

        const oldIndex = tasks.findIndex(t => t.id === activeId)
        const newIndex = tasks.findIndex(t => t.id === overId)
        return arrayMove(tasks, oldIndex, newIndex)

    }

    return tasks.map(task => 
        task.id === parentId
            ? {
                ...task,
                children: arrayMove(
                    task.children,
                    task.children.findIndex(t => t.id === activeId),
                    task.children.findIndex(t => t.id === overId)
                )
            } : {
                ...task,
                children: reorderTasks(task.children, parentId, activeId, overId)
            }
        
    )

}


function insertTask(tasks, parentId, task, overId, insertAfter = false){

    if(parentId === null){

        const index = tasks.findIndex(t => t.id === overId)
        const newTasks = [...tasks]
        const insertAt = index === -1 ? newTasks.length : insertAfter ? index + 1 : index
        newTasks.splice(insertAt, 0, task)
        return newTasks

    }

    return tasks.map(t =>
        t.id === parentId
            ? { ...t, children: insertTask(t.children, null, task, overId, insertAfter)}
            : { ...t, children: insertTask(t.children, parentId, task, overId, insertAfter)}
    )

}

function setCompletedRecursive(task, completed){

    return {
        ...task,
        completed,
        children: task.children.map(child => setCompletedRecursive(child, completed))
    }

}