import Task from './Task'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTaskContext } from '../context/TaskContext'

export default function TaskList({tasks, depth, parentId = null, readonly = false}){

    if(!tasks || tasks.length === 0) return null

    return (
        <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
        >
            <ul>
                {tasks.map(task => (
                    <Task key={task.id} task={task} depth={depth} readonly={readonly}/>
                ))}
            </ul>
        </SortableContext>
    )

}