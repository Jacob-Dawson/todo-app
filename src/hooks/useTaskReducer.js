import { useReducer, useEffect } from "react"

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
function taskReducer(state, action){

    switch(action.type){
        // actions for task such as add, edit, delete, toggle, etc

        case 'ADD_TASK':{
            const newTask = createTask(action.title)
            if(action.parentId === null){
                return [...state, newTask]
            }
            return addTaskToParent(state, action.parentId, newTask)
        }

        case 'EDIT_TASK':{
            return updateTask(state, action.id, task => ({ ...task, title: action.title}))
        }

        case 'DELETE_TASK':{
            return deleteTask(state, action.id)
        }

        case 'TOGGLE_COMPLETE':{
            const updated = updateTask(state, action.id, task => ({ ...task, completed: !task.completed}))
            return syncParentCompletion(updated)
        }

        case 'TOGGLE_COLLAPSE':{
            return updateTask(state, action.id, task => ({ ...task, collapsed: !task.collapsed}))
        }

        default:
            return state
    }

}

// Custom hook

export default function useTaskReducer(){

    const [tasks, dispatch] = useReducer(taskReducer, initialState, (init) => {
        // Load from localStorage on first render

        const saved = localStorage.getItem('tasks')
        return saved ? JSON.parse(saved) : init
    })

    // Sync to localStorage on every state change
    useEffect(() => {

        localStorage.setItem('tasks', JSON.stringify(tasks))

    }, [tasks])

    return { tasks, dispatch}

}