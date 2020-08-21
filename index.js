require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

morgan.token('post-data', function (req, res) {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

const app = express()
app.use(express.static('build'))
app.use(bodyParser.json())

app.use(cors())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post-data'
  )
)
const Person = require('./models/person')
const { request } = require('express')
const { update } = require('./models/person')
//const { request } = require('express')

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.count({})
    .then(c => {
      res.send(`<p>Phonebook contains ${c} persons.</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Name and/or number missing.' })
  }

  Person.count({ name: body.name })
    .then(cnt => {
      if (cnt > 0) {
        return res.status(400).json({ error: 'Name already exists.' })
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        })

        person.save().then(savedPerson => {
          res.json(savedPerson)
        })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Name and/or number missing.' })
  }

  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unkown endpoint.' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id.' })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
