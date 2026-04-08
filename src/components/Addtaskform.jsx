import { useState, forwardRef } from "react";
import { useTaskContext } from '../context/TaskContext'

const AddTaskForm = forwardRef(function AddTaskForm({ parentId, depth = 0}, ref){

    const { dispatch } = useTaskContext()
    const [value, setValue] = useState('')

    const labels = ['Add task...', 'Add subtask...', 'Add sub-subtask...']
    const placeholder = labels[depth] ?? 'Add...'

    function handleSubmit(e){

        e.preventDefault()
        if(!value.trim()) return

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
                ref={ref}
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                maxLength={200}
            />
            <button type="submit">Add</button>
        </form>
    )

})

export default AddTaskForm