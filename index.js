require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

const app = express()

// MORGAN CONSOLE LOGGING
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.content(req, res)
      ].join(' ')
}))
morgan.token('content', (req, res) => JSON.stringify(req.body))


// ROUTE REGISTRY

// REGISTER ROUTE FOR API/DB INFO
app.get('/api/info', (request, response) => {
  Contact.find({}).then(result => {
    console.log(result.length)
    response.send(`
        <div>Phonebook has info for ${result.length} people</div>
        <br>
        <div>${new Date()}</div>`)
  })
})

// REGISTER ROUTE FOR FETCHING ALL CONTACTS
app.get('/api/contacts', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

// REGISTER ROUTE FOR SINGULAR CONTACT
app.get('/api/contacts/:id', (request, response, next) => {
    Contact.findById(request.params.id)
      .then(contact => {
        if (contact) {
          response.json(contact)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

// REGISTER ROUTE FOR CREATING NEW CONTACT
app.post('/api/contacts', (request, response, next) => {
  const body = request.body

  const contact = new Contact({
    name: body.name,
    number: body.number,
  })

  contact.save()
    .then(savedContact => {
      response.json(savedContact)
    })
    .catch(error => next(error))
})

// REGISTER ROUTE FOR UPDATING EXISTING CONTACT
app.put('/api/contacts/:id', (request, response, next) => {
  const { name, number } = request.body

  Contact.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
  .then(updatedContact => {
    response.json(updatedContact)
  })
  .catch(error => next(error))
})

// REGISTER ROUTE FOR DELETING CONTACT FROM PHONEBOOK
app.delete('/api/contacts/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// END ROUTES


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)