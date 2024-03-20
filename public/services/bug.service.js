
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getFilterFromParams
}


function query(filterBy={}) {
    // return axios.get(BASE_URL).then(res => res.data)
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
        
}
function getById(bugId) {
   
    return axios.get(BASE_URL , bugId)
        .then(res => res.data)
        .catch(err => {
            console.log('err:', err)
        })
}

function remove(bugId) {
    return axios.delete(BASE_URL, bugId)
            .then(res => res.data)
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL, bug)
    } else {
        return axios.post(BASE_URL, bug)
    }
}

function getDefaultFilter() {
    return { txt: '', severity: '' }
}

function getFilterFromParams(searchParams = {}) {
    const defaultFilter = getDefaultFilter()
    return {
        txt: searchParams.get('txt') || defaultFilter.txt,
        severity: searchParams.get('severity') || defaultFilter.severity,
        // description: searchParams.get('description') || defaultFilter.description
    }
}

function getEmptyBug(title= '',description= '',severity= '') {
    return { title, description, severity }
}


function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                description: 'cant stop this',
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                description: 'where is it?',
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                description: 'Errorrr',
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                description: 'that not the druids you looking for',
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }
}
