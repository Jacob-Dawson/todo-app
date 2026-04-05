import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { useTaskContext } from './context/TaskContext'
import TaskContext from './context/TaskContext'
import TaskList from './components/Tasklist'
import AddTaskForm from './components/Addtaskform'
import useTaskReducer from './hooks/useTaskReducer.js'
import { findParentId, findTaskById, findTaskDepth, filterActiveTree, filterCheckedTree, getTaskHeight} from './utils/taskUtils'

export default function App(){

    const { tasks, dispatch, canUndo, canRedo } = useTaskReducer()
    const [editingId, setEditingId] = useState(null)
    const [darkMode, setDarkMode] = useState(() => {

        return localStorage.getItem('theme') === 'dark'
    
    })
    const addTaskRef = useRef(null)
    const [appTitle, setAppTitle] = useState(() => {

        return localStorage.getItem('appTitle') || 'Tasks'

    })
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleValue, setTitleValue] = useState(appTitle)
    const sensors = useSensors(useSensor(PointerSensor))
    const dragDeltaX = useRef(0)
    const [activeTask, setActiveTask] = useState(null)
    const activeTasks = filterActiveTree(tasks)
    const checkedTasks = filterCheckedTree(tasks)

    useEffect(() => {

        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
        localStorage.setItem('theme', darkMode ? 'dark' : 'light')

    }, [darkMode])

    useEffect(() => {

        function handleKeyDown(e){

            const tag = document.activeElement.tagName.toLowerCase()
            if(e.key === 'n' && tag !== 'input' && tag !== 'textarea'){

                e.preventDefault()
                addTaskRef.current?.focus()

            }

        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)

    }, [])

    function handleDragStart(event){

        const {active} = event
        setActiveTask(findTaskById(tasks, active.id))

    }

    function handleDragMove(event){

        dragDeltaX.current = event.delta.x

    }

    function handleDragEnd(event){

        const { active, over } = event
        const deltaX = dragDeltaX.current
        const activeParentId = findParentId(tasks, active.id)

        setActiveTask(null)

        // Handle drag right - demote (must happen before early return)


        // Drag right - make it a child of the task above it
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
                    dispatch({
                        type: 'REPARENT_TASK',
                        activeId: active.id,
                        newParentId: taskAbove.id,
                        overId: null
                    })
                }
            }
            return

        }

        // Handle drag left - promote (must happen before early return)
        // Drag left - move up a tier
        if(deltaX < -40){

            const grandParentId = activeParentId !== null
                ? findParentId(tasks, activeParentId) ?? null
                : null

            if(activeParentId !== null){

                dispatch({
                    type: 'REPARENT_TASK',
                    activeId: active.id,
                    newParentId: grandParentId,
                    overId: activeParentId,
                    insertAfter: true
                })
            }
            return

        }

        // Vertical reorder - needs a valid over target
        if(!over || active.id === over.id) return

        // No significant horizontal movement - reorder within same tier
        const overParentId = findParentId(tasks, over.id)
        if(activeParentId === overParentId){

            dispatch({
                type: 'REORDER_TASKS',
                parentId: activeParentId,
                activeId: active.id,
                overId: over.id
            })

        }

    }

    function countCompleted(tasks){

        return tasks.reduce((acc, task) => {

            const self = task.completed ? 1 : 0
            return acc + self + countCompleted(task.children)

        }, 0)

    }

    const completedCount = countCompleted(tasks)

    function countRemaining(tasks){

        return tasks.reduce((acc, task) => {

            const self = !task.completed ? 1 : 0
            return acc + self + countRemaining(task.children)

        }, 0)

    }

    const remainingCount = countRemaining(tasks)

    return (
        <TaskContext.Provider value={{ tasks, dispatch, editingId, setEditingId}}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <main>
                    <div className='header-row'>
                        {editingTitle ? (
                            <input
                                className="title-edit-input"
                                value={titleValue}
                                onChange={e => setTitleValue(e.target.value)}
                                onBlur={() => {
                                    const trimmed = titleValue.trim() || 'Tasks'
                                    setAppTitle(trimmed)
                                    localStorage.setItem('appTitle', trimmed)
                                    setEditingTitle(false)
                                }}
                                onKeyDown={e => {
                                    if(e.key === 'Enter') e.target.blur()
                                    if(e.key === 'Escape'){
                                        setTitleValue(appTitle)
                                        setEditingTitle(false)
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            <h1 onClick={() => {
                                setTitleValue(appTitle)
                                setEditingTitle(true)
                            }}
                            title="Click to edit">
                                {appTitle}
                            </h1>
                        )}
                        
                        <button
                            className='theme-toggle'
                            onClick={() => setDarkMode(d => !d)}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                    {remainingCount > 0 && (
                        <p className='task-count'>
                            {remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} remaining
                        </p>
                    )}
                    <AddTaskForm parentId={null} ref={addTaskRef}/>
                    <TaskList tasks={activeTasks} depth={0} parentId={null}/>
                    {checkedTasks.length > 0 && (
                        <>
                            <h2>{completedCount} completed {completedCount === 1 ? 'task' : 'tasks'}</h2>
                            <TaskList tasks={checkedTasks} depth={0} parentId={null} readonly />
                        </>
                    )}
                    <div className='history-bar'>
                        <button
                            className='history-btn'
                            onClick={() => dispatch({type: "UNDO"})}
                            disabled={!canUndo}
                            aria-label='Undo'
                        >
                            ↩ Undo
                        </button>
                        <button
                            className='history-btn'
                            onClick={() => dispatch({type:"REDO"})}
                            disabled={!canRedo}
                            aria-label='Redo'
                        >
                            Redo ↪
                        </button>
                    </div>
                </main>
                <DragOverlay>
                    {activeTask ? (
                        <div className='drag-overlay'>
                            {activeTask.title}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </TaskContext.Provider>
    )

}