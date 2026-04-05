import { useState, useEffect, useRef } from 'react';
import TaskContext from './context/TaskContext';
import useLists from './hooks/useLists';
import ListContainer from './components/ListContainer';

export default function App() {
    const { lists, addList, deleteList, renameList, updateListTasks, togglePin } = useLists();
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
        if (!newListTitle.trim()) return;
        addList(newListTitle.trim());
        setNewListTitle('');
    }

    const sortedLists = [...lists].sort((a, b) => {

        if(a.pinned === b.pinned) return 0
        return a.pinned ? -1 : 1

    })

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
                />
                <button type="submit">Add List</button>
            </form>
            {lists.length === 0 && (
            <p className="empty-state">No lists yet — add one below to get started.</p>
            )}

            {sortedLists.map(list => (
                <ListContainer
                    key={list.id}
                    list={list}
                    onTasksChange={tasks => updateListTasks(list.id, tasks)}
                    onDelete={() => deleteList(list.id)}
                    onRename={title => renameList(list.id, title)}
                    onPin={() => togglePin(list.id)}
                /> 
            ))}

        </main>
        </div>
    );
}