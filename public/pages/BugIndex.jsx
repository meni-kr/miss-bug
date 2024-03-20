
import { bugService } from '../services/bug.service.js'
import { utilService } from '../services/util.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugSort } from '../cmps/BugSort.jsx'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

const { useState, useEffect,useRef } = React

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState({ type: '', dir: 1 })

    const debounceOnSetFilter = useRef(utilService.debounce(onSetFilter, 500))

    useEffect(() => {
        loadBugs()
        // showSuccessMsg('Welcome to bug index!')
    }, [filterBy, sortBy])

    function loadBugs() {
        bugService.query(filterBy,sortBy).then((bugs)=> setBugs(bugs))
    }

    function onSetFilter(filterBy) {
        setFilterBy((prevFilterBy) => ({...prevFilterBy, ...filterBy}))
      }

      function onSetSort(sortBy) {
		setSortBy(prevSort => ({ ...prevSort, ...sortBy }))
	}
    function onChangePageIdx(diff) {
		setFilterBy(prevFilter => ({
			...prevFilter, pageIdx: prevFilter.pageIdx + diff,
		}))
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
            <BugFilter onSetFilter={ debounceOnSetFilter.current }  filterBy={filterBy} />
            <BugSort 
                    onSetSort={ onSetSort } 
                    sortBy={ sortBy } />
                <button onClick={onAddBug}>Add Bug ⛐</button>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
                <div className="paging flex">
					<button
						className="btn"
						onClick={ () => onChangePageIdx(-1) }>Prev</button>

					<span>{ filterBy.pageIdx + 1 }</span>
					<button
						className="btn"
						onClick={ () => onChangePageIdx(1) }>Next</button>
				</div>
            </main>
        </main>
    )
}
