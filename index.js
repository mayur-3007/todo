var express = require('express')
var app = express()
app.use(express.json())
const moment = require('moment')
const fs = require('fs')
var tasks = require('./tasks.js')

// Function to write array to file
const writeToFile = () => {
  fs.writeFileSync('./tasks.js', `module.exports = ${JSON.stringify(tasks)};`)
}

const makeid = (length) => {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

// Middleware for basic validation
const validateData = (req, res, next) => {
  if (req.body.title === '' || req.body.description === '') {
    return res.status(400).send({
      status: 'Failure',
      response: 'Title is required',
    })
  } else if (req.body.description === '' || !req.body.description) {
    return res.status(400).send({
      status: 'Failure',
      response: 'Description is required',
    })
  }
  next()
}

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// http://localhost:3000/tasks?page=1&limit1
app.get('/tasks', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  const keys = Object.keys(tasks)
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedKeys = keys.slice(startIndex, endIndex)
  const paginatedData = {}
  paginatedKeys.forEach((key) => {
    paginatedData[key] = tasks[key]
  })
  return res.status(200).send({
    status: 'Success',
    response: {
      data: paginatedData,
      currentPage: page,
      totalPages: Math.ceil(keys.length / limit),
    },
  })
})

// http://localhost:3000/tasks/PbE4Vym
app.get('/tasks/:id', (req, res) => {
  const { id } = req.params
  if (!(id in tasks)) {
    return res.status(404).send({
      status: 'Failure',
      response: 'Task not found',
    })
  } else {
    return res.status(200).send({
      status: 'Success',
      response: tasks[id],
    })
  }
})

app.post('/tasks', validateData, (req, res) => {
  tasks[`${makeid(7)}`] = {
    title: req.body.title,
    description: req.body.description,
    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    updated_at: null,
  }
  writeToFile()
  return res.status(200).send({
    status: 'Success',
    response: 'Task is added',
  })
})

// PUT operation to update data
app.put('/tasks/:id', validateData, (req, res) => {
  const { id } = req.params
  const newTask = req.body
  tasks[id]['title'] = newTask.title
  tasks[id]['description'] = newTask.description
  writeToFile()
  return res.status(200).send({
    status: 'Success',
    response: 'Task is Updated',
  })
})

// DELETE operation to delete data
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params
  if (!(id in tasks)) {
    return res.status(404).send({
      status: 'Failure',
      response: 'Task not found',
    })
  } else {
    delete tasks[id]
    writeToFile()
    return res.status(200).send({
      status: 'Success',
      response: 'Task is Deleted',
    })
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
