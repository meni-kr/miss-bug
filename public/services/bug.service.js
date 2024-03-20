
const BASE_URL = '/api/bug/'



export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getFilterFromParams
}


function query(filterBy, sortBy) {
    const queryParams = { ...filterBy, ...sortBy }
    
    return axios.get(BASE_URL, { params: queryParams })
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
    return { 
        txt: '', 
        minSeverity: 0, 
        labels: '', 
        pageIdx: 0 
    }
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


