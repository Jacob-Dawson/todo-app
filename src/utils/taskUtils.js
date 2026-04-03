export function findParentId(tasks, childId, parentId = null){

    for(const task of tasks){

        if(task.id === childId) return parentId
        const found = findParentId(task.children, childId, task.id)
        if(found !== undefined) return found

    }
    return undefined

}

export function findTaskById(tasks, id){

    for(const task of tasks){

        if(task.id === id) return task
        const found = findTaskById(task.children, id)
        if(found) return found

    }
    return null

}

export function findTaskDepth(tasks, id, depth = 0){

    for(const task of tasks){

        if(task.id === id) return depth
        const found = findTaskDepth(task.children, id, depth + 1)
        if(found !== -1) return found

    }
    return -1

}

export function filterActiveTree(tasks){

    return tasks
        .filter(task => !task.completed)
        .map(task => ({
            ...task,
            children: filterActiveTree(task.children)
    }))
}

export function filterCheckedTree(tasks){

    const result = []

    for(const task of tasks){

        if(task.completed){

            result.push({ 
                ...task, 
                children: filterCheckedTree(task.children)
            })

        } else {

            const checkedChildren = filterCheckedTree(task.children)

            if(checkedChildren.length > 0){

                result.push({
                    ...task,
                    children: checkedChildren
                })

            }

        }

    }

    return result

}

export function getTaskHeight(task){

    if(!task.children || task.children.length === 0) return 0
    return 1 + Math.max(...task.children.map(getTaskHeight))

}