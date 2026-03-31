import Task from './Task'

export default function TaskList({tasks, depth}){

    console.log("tasklist rendering", tasks)
    if(!tasks || tasks.length === 0) return null

    return (
        <ul>
            {tasks.map(task => (
                <Task key={task.id} task={task} depth={depth} />
            ))}
        </ul>
    )

}