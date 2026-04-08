import { useState, useRef } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskContext from '../context/TaskContext'
import useTaskReducer from '../hooks/useTaskReducer'
import TaskList from './Tasklist'
import AddTaskForm from './Addtaskform'
import { findParentId, findTaskById, findTaskDepth, filterActiveTree, filterCheckedTree, getTaskHeight } from '../utils/taskUtils'

export default function ListContainer({list, onTasksChange, onDelete, onRename, onPin, dragHandleProps}){

    const {tasks, dispatch, canUndo, canRedo} = useTaskReducer(list.tasks, onTasksChange)
    const [editingId, setEditingId] = useState(null)
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleValue, setTitleValue] = useState(list.title)
    const [activeTask, setActiveTask] = useState(null)
    const addTaskRef = useRef(null)
    const dragDeltaX = useRef(0)
    const sensors = useSensors(useSensor(PointerSensor))
    const activeTasks = filterActiveTree(tasks)
    const checkedTasks = filterCheckedTree(tasks)

    function countCompleted(tasks){

        return tasks.reduce((acc, task) => {

            const self = task.completed ? 1 : 0
            return acc + self + countCompleted(task.children)

        }, 0)

    }

    function countRemaining(tasks){

        return tasks.reduce((acc, task) => {

            const self = !task.completed ? 1 : 0
            return acc + self + countRemaining(task.children)

        }, 0)

    }

    const completedCount = countCompleted(tasks)
    const remainingCount = countRemaining(tasks)

    function handleDragStart(event){

        setActiveTask(findTaskById(tasks, event.active.id))

    }

    function handleDragMove(event){

        dragDeltaX.current = event.delta.x

    }

    function handleDragEnd(event){

        setActiveTask(null)
        const {active, over} = event
        const deltaX = dragDeltaX.current
        const activeParentId = findParentId(tasks, active.id)

        if(deltaX > 40){

            const siblings = activeParentId === null
                ? tasks
                : findTaskById(tasks, activeParentId)?.children ?? []
            const activeIndex = siblings.findIndex(t => t.id === active.id)
            const taskAbove = siblings[activeIndex - 1]
            
            if(taskAbove){

                const newDepth = findTaskDepth(tasks, taskAbove.id) + 1
                const activeTask = findTaskById(tasks, active.id)
                const taskHeight = getTaskHeight(activeTask)
                if(newDepth + taskHeight <= 2){

                    dispatch({type: 'REPARENT_TASK', activeId: active.id, newParentId: taskAbove.id, overId: null})

                }

            }
            return

        }

        if(deltaX < -40){

            const grandParentId = activeParentId !== null
                ? findParentId(tasks, activeParentId) ?? null
                : null
            if(activeParentId !== null){

                dispatch({type: 'REPARENT_TASK', activeId: active.id, newParentId: grandParentId, overId:activeParentId, insertAfter: true})

            }
            return

        }

        if(!over || active.id === over.id) return
        const overParentId = findParentId(tasks, over.id)
        if(activeParentId === overParentId){

            dispatch({type: 'REORDER_TASKS', parentId:activeParentId, activeId: active.id, overId:over.id})

        }

    }

    return (

        <TaskContext.Provider value={{tasks, dispatch, editingId, setEditingId}}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            >
                <div className='list-container'>
                    <div className='list-header' onClick={() => {setTitleValue(list.title); setEditingTitle(true)}}>
                        <button
                            className="list-drag-handle"
                            {...dragHandleProps}
                            onClick={e => e.stopPropagation()}
                            aria-label="Drag to reorder list"
                        >
                            ⠿
                        </button>
                        {editingTitle ? (
                            <input
                                className='title-edit-input'
                                value={titleValue}
                                onChange={e => setTitleValue(e.target.value)}
                                maxLength={50}
                                onBlur={() => {
                                    const trimmed = titleValue.trim() || list.title
                                    const success = onRename(trimmed)
                                    if(success === false){

                                        alert('A list with that name already exists.')
                                        setTitleValue(list.title)

                                    }
                                    setEditingTitle(false)
                                }}
                                onKeyDown={e => {
                                    if(e.key === 'Enter') e.target.blur()
                                    if(e.key === 'Escape') {

                                        setTitleValue(list.title)
                                        setEditingTitle(false)

                                    }
                                }}
                                autoFocus
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (

                            <h2 className='list-title' onClick={() => { 
                                setTitleValue(list.title)
                                setEditingTitle(true)
                            }}
                            title="Click to edit">
                                {list.title}
                            </h2>
                        )}
                        <button
                            className={`list-fav-btn ${list.pinned ? 'pinned' : ''}`}
                            onClick={e => {e.stopPropagation(); onPin()}}
                            aria-label="Favorite List"
                        >
                            ❤️
                        </button>
                        <button className='list-delete-btn' onClick={e => {e.stopPropagation(); 
                            if(window.confirm(`Delete "${list.title}"? This cannot be undone`))onDelete()}} aria-label="Delete list">X</button>
                    </div>
                    
                    {remainingCount > 0 && (

                        <p className='task-count'>
                            {remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} remaining
                        </p>

                    )}

                    <TaskList tasks={activeTasks} depth={0} parentId={null}/>
                    <AddTaskForm parentId={null} ref={addTaskRef}/>

                    {checkedTasks.length > 0 && (
                        <>
                            <p className='completed-label'>{completedCount} completed {completedCount === 1 ? 'task' : 'tasks'} </p>
                            <TaskList tasks={checkedTasks} depth={0} parentId={null} readonly/>
                        </>
                    )}

                    <div className='history-bar-inline'>
                        <button className='history-btn' onClick={() => dispatch({type: 'UNDO'})} disabled={!canUndo} aria-label="Undo">↩ Undo</button>
                        <button className='history-btn' onClick={() => dispatch({type: 'REDO'})} disabled={!canRedo} aria-label="Redo">Redo ↪</button>
                    </div>
                </div>
                <DragOverlay>
                    {activeTask ? <div className='drag-overlay'>{activeTask.title}</div> : null}
                </DragOverlay>
            </DndContext>
        </TaskContext.Provider>

    )

}