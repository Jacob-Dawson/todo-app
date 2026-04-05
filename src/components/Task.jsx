import TaskItem from './TaskItem'
import TaskList from './Tasklist'
import AddTaskForm from './Addtaskform'

const MAX_DEPTH = 2 // 0-2 (tiers 1-3)

export default function Task({task, depth, readonly = false}){

    return(
        <li>
            {/* checkbox, title, edit/delete buttons */}
            <TaskItem task={task} depth={depth} readonly={readonly}/>

            {/* Children shown if not collapsed */}
            {!task.collapsed && (
                <>
                    <TaskList tasks={task.children} depth={depth + 1} parentId={task.id} readonly={readonly}/>

                </>
            )}
        </li>
    )

}