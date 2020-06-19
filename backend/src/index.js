const express = require('express')
const cors = require('cors')
const { uuid, isUuid } = require('uuidv4')

const app = express()

app.use(cors())
app.use(express.json())

function logRequests(req, res, next) {
    const { method, url } = req

    const logLabel = `[${method.toUpperCase()}] ${url}`
    
    console.time(logLabel)
    next()
    console.timeEnd(logLabel)
}

function validateProjectId(req, res, next) {
    const { id } = req.params

    if(!isUuid(id)){
        return res.status(404).json({err: 'Invalid id format!'})
    }
    return next()
}

app.use(logRequests)
app.use('/repositories/:id', validateProjectId)

const projects = []

app.get('/repositories', (req, res) => {
    const { title } = req.query

    const results = title
        ? projects.filter(project => project.title.includes(title))
        : projects

    return res.json(results)
})

app.post('/repositories', (req, res) => {
    const { title, owner } = req.body

    const project = { id: uuid(), title, owner }
    
    projects.push(project)

    return res.json(project)
})

app.put('/repositories/:id', (req, res) => {
    const { id } = req.params
    const { title, owner } = req.body

    const projectIndex = projects.findIndex(project => project.id === id)

    if(projectIndex < 0){
        return res.status(400).json({ err: 'Project not found!' })
    }

    const project = { id, title, owner }

    projects[projectIndex] = project;

    return res.json(project)
})

app.delete('/repositories/:id', (req, res) => {
    const { id } = req.params

    const projectIndex = projects.findIndex(project => project.id === id)

    if(projectIndex < 0){
        return res.status(400).json({ err: 'Project not found!' })
    }

    projects.splice(projectIndex, 1)

    return res.status(204).send()
})

app.listen(3333, () => {
    console.log(`Server is running!`)
});