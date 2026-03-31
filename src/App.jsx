import { useTaskContext } from './context/TaskContext'
import TaskContext from './context/TaskContext'
import TaskList from './components/Tasklist'
import AddTaskForm from './components/Addtaskform'
import useTaskReducer from './hooks/useTaskReducer.js'

export default function App(){

    const { tasks, dispatch } = useTaskReducer()

    return (
        <TaskContext.Provider value={{ tasks, dispatch}}>
            <main>
                <h1>Tasks</h1>
                <AddTaskForm parentId={null} />
                <TaskList tasks={tasks} depth={0}/>
            </main>
        </TaskContext.Provider>
    )

}