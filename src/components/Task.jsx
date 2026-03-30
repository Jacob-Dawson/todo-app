import TaskItem from './TaskItem'
import TaskList from './Tasklist'
import AddTaskForm from './Addtaskform'

const MAX_DEPTH = 2 // 0-2 (tiers 1-3)

export default function Task({task, depth}){

    return(
        <li>
            {/* checkbox, title, edit/delete buttons */}
            <TaskItem task={task} depth={depth} />

            {/* Children shown if not collapsed */}
            {!task.collapsed && (
                <>
                    <TaskList tasks={task.children} depth={depth + 1} />

                    {/* Only allow adding subtasks if we have not hit the tier limit */}

                    {depth < MAX_DEPTH && (
                        <AddTaskForm parentId={task.id} depth={depth + 1} />
                    )}
                </>
            )}
        </li>
    )

}