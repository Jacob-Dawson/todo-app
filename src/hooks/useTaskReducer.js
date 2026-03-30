import { useReducer, useEffect } from "react"

// placeholder

const initialState = []

// Recursive helper
function updateTask(tasks, id, updater){

    return tasks.map(task => 
        task.id === id
            ? updater(task)
            : { ...task, children: updateTask(task.children, id, updater)}
    )

}

// Reducer (actions to be filled in next)
function taskReducer(state, action){

    switch(action.type){
        // actions for task such as add, edit, delete, toggle, etc

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