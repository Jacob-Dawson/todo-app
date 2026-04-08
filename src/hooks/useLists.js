import { useState, useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

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

        if(lists.length >= 20){

            return 'max'

        }

        const trimmed = title.trim() || 'New List'
        const isDuplicate = lists.some(l => l.title.toLowerCase() === trimmed.toLowerCase())
        if(isDuplicate) return false
        setLists(prev => [...prev, createList(title)])
        return true

    }

    function deleteList(id){

        setLists(prev => prev.filter(l => l.id !== id))

    }

    function renameList(id, title){
        
        const trimmed = title.trim()
        const isDuplicate = lists.some(l => l.id !== id && l.title.toLowerCase() === trimmed.toLowerCase())
        if(isDuplicate) return false
        setLists(prev => prev.map(l =>
            l.id === id ? {...l, title: title.trim() || l.title } : l
        ))
        return true

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

    function reorderLists(activeId, overId){

        setLists(prev => {

            const activeList = prev.find(l => l.id === activeId)
            const overList = prev.find(l => l.id === overId)

            // Prevent mixing pinned and unpinned
            if(activeList.pinned !== overList.pinned) return prev

            const oldIndex = prev.findIndex(l => l.id === activeId)
            const newIndex = prev.findIndex(l => l.id === overId)

            return arrayMove(prev, oldIndex, newIndex)

        })

    }

    return { lists, addList, deleteList, renameList, updateListTasks, togglePin, reorderLists}

}