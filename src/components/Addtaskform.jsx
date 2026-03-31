import { useState } from "react";
import { useTaskContext } from '../context/TaskContext'

export default function AddTaskForm({ parentId, depth = 0}){

    const { dispatch } = useTaskContext()
    const [value, setValue] = useState('')

    const labels = ['Add task...', 'Add subtask...', 'Add sub-subtask...']
    const placeholder = labels[depth] ?? 'Add...'

    function handleSubmit(e){

        e.preventDefault()
        if(!value.trim()) return

        console.log('test',{parentId, title: value.trim()})

        dispatch({
            type:'ADD_TASK',
            parentId,
            title: value.trim()
        })

        setValue('')

    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />
            <button type="submit">Add</button>
        </form>
    )

}