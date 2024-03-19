
import { bugService } from '../services/bug.service.js'
import { utilService } from '../services/util.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

const { useState, useEffect } = React

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())


    useEffect(() => {
        loadBugs()
        // showSuccessMsg('Welcome to bug index!')
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy).then((bugs)=> setBugs(bugs))
    }

    function onSetFilter(filterBy) {
        setFilterBy((prevFilterBy) => ({...prevFilterBy, ...filterBy}))
      }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        console.log(bugs);
        
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
            description: prompt('Enter bug description')
        }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug.data)
                showSuccessMsg('Bug added')
                setBugs(prevBugs =>([...prevBugs, savedBug.data]))
                // loadBugs()
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug.data._id ? savedBug.data : currBug
                )
            
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }
    console.log(bugs);
    return (
        <main>
            <h3>Bugs App</h3>
            <main>
            <BugFilter onSetFilter={onSetFilter} filterBy={filterBy} />
                <button onClick={onAddBug}>Add Bug ⛐</button>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
            </main>
        </main>
    )
}
