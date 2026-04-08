import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'
import TaskContext from './context/TaskContext';
import useLists from './hooks/useLists';
import ListContainer from './components/ListContainer';

function SortableList({list, onTasksChange, onDelete, onRename, onPin}){

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: list.id})

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
    }

    return (
        <div ref={setNodeRef} style={style}>
            <ListContainer
                list={list}
                onTasksChange={onTasksChange}
                onDelete={onDelete}
                onRename={onRename}
                onPin={onPin}
                dragHandleProps={{...attributes, ...listeners}}
            />
        </div>
    )

}

export default function App() {
    const { lists, addList, deleteList, renameList, updateListTasks, togglePin, reorderLists } = useLists();
    const sensors = useSensors(useSensor(PointerSensor))
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [newListTitle, setNewListTitle] = useState('');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    function handleAddList(e) {
        e.preventDefault();
        if (!newListTitle.trim()){

            alert('Please enter a list name.')
            return

        }
        const success = addList(newListTitle.trim())

        if(success === 'max'){

            alert('You have reached the maximum of 20 lists.')
            return

        }

        if(success === false){
            alert('A list with that name already exists.')
            return
        }
        setNewListTitle('');
    }

    function handleDragEnd(event){

        const {active, over} = event
        if(!over || active.id === over.id) return
        reorderLists(active.id, over.id)

    }

    const pinnedLists = lists.filter(l => l.pinned)
    const unpinnedLists = lists.filter(l => !l.pinned)

    return (
        <div className="app">
        <header className="app-header">
            <h1 className="app-title">My Lists</h1>
            <button
            className="theme-toggle"
            onClick={() => setDarkMode(d => !d)}
            aria-label="Toggle dark mode"
            >
            {darkMode ? '☀️' : '🌙'}
            </button>
        </header>

        <main>
            <form className="add-list-form" onSubmit={handleAddList}>
                <input
                    type="text"
                    value={newListTitle}
                    onChange={e => setNewListTitle(e.target.value)}
                    placeholder="New list name…"
                    aria-label="New list name"
                    maxLength={50}
                />
                <button type="submit">Add List</button>
            </form>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

                {pinnedLists.length > 0 && (
                    <section className='list-section'>
                        <h2 className='section-heading'>Pinned</h2>
                        <SortableContext items={pinnedLists.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            <div className='lists-column'>
                                {pinnedLists.map(list => (
                                    <SortableList
                                        key={list.id}
                                        list={list}
                                        onTasksChange={tasks => updateListTasks(list.id, tasks)}
                                        onDelete={() => deleteList(list.id)}
                                        onRename={title => renameList(list.id, title)}
                                        onPin={() => togglePin((list.id))}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </section>
                )}
                <section className='list-section'>
                    {pinnedLists.length > 0 && <h2 className='section-heading'>Lists</h2>}
                    <SortableContext items={unpinnedLists.map(l => l.id)} strategy={verticalListSortingStrategy}>
                        <div className='lists-column'>
                            {unpinnedLists.length === 0 && (
                                <p className='empty-state'>No lists yet - add one above to get started.</p>
                            )}
                            {unpinnedLists.map(list => (

                                <SortableList
                                    key={list.id}
                                    list={list}
                                    onTasksChange={tasks => updateListTasks(list.id, tasks)}
                                    onDelete={() => deleteList(list.id)}
                                    onRename={title => renameList(list.id, title)}
                                    onPin={() => togglePin(list.id)}
                                />

                            ))}
                        </div>
                    </SortableContext> 
                </section>
            </DndContext>

        </main>
        </div>
    );
}