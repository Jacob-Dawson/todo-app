import TaskContext from './context/TaskContext'
import useTaskReducer from './hooks/useTaskReducer'
import TaskList from './components/Tasklist'
import AddTaskForm from './components/Addtaskform'

export default function App(){

    const { tasks, dispatch } = useTaskReducer()

    return (
        <TaskContext.Provider value={{ tasks, dispatch}}>
            <main>
                <h1>Tasks</h1>
                <AddTaskForm parentId={null} />
                <TaskList task={tasks} depth={0}/>
            </main>
        </TaskContext.Provider>
    )

}