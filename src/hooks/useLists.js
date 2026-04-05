import { useState, useEffect } from 'react'

function createList(title){

    return {
        id: crypto.randomUUID(),
        title: title.trim() || 'New List',
        tasks: [],
        pinned: false
    }

}

export default function useLists(){

    const [lists, setLists] = useState(() => {

        try{

            const saved = localStorage.getItem('lists')
            if(saved) return JSON.parse(saved)

            // Migrate existing tasks from old single-list format
            const oldTasks = localStorage.getItem('tasks')

            if(oldTasks){

                return [{
                    id: crypto.randomUUID(),
                    title: localStorage.getItem('appTitle') || 'Tasks',
                    tasks: JSON.parse(oldTasks)
                }]

            }
            return [createList('Tasks')]

        } catch {

            return [createList('Tasks')]

        }

    })

    useEffect(() => {

        localStorage.setItem('lists', JSON.stringify(lists))

    }, [lists])

    function addList(title){

        setLists(prev => [...prev, createList(title)])

    }

    function deleteList(id){

        setLists(prev => prev.filter(l => l.id !== id))

    }

    function renameList(id, title){

        setLists(prev => prev.map(l =>
            l.id === id ? {...l, title: title.trim() || l.title } : l
        ))

    }

    function updateListTasks(id, tasks){

        setLists(prev => prev.map(l =>
            l.id === id ? {...l, tasks } : l
        ))

    }

    function togglePin(id){

        setLists(prev => prev.map(l =>
            l.id === id ? { ...l, pinned: !l.pinned} : l
        ))

    }

    return { lists, addList, deleteList, renameList, updateListTasks, togglePin}

}