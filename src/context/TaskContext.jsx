import { createContext, useContext } from "react";

const TaskContext = createContext(null)

export default TaskContext

// Convenience hook
export function useTaskContext(){

    const context = useContext(TaskContext)
    if(!context) throw new Error('useTaskContext must be used inside TaskContext.Provider')
    return context

}