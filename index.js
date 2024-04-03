const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

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

let contacts = [
    { 
        id: 1,
        name: "Arto Hellas", 
        number: "040-123456"
      },
      { 
        id: 2,
        name: "Ada Lovelace", 
        number: "39-44-5323523"
      },
      { 
        id: 3,
        name: "Dan Abramov", 
        number: "12-43-234345"
      },
      { 
        id: 4,
        name: "Mary Poppendieck", 
        number: "39-23-6423122"
      }
  ]

app.get('/', (request, response) => {
    response.send('<h1>Hello Pizza!</h1>')
})

app.get('/api/info', (request, response) => {
    response.send(`
        <div>Phonebook has info for ${contacts.length} people</div>
        <br>
        <div>${new Date()}</div>`)
})

app.get('/api/contacts', (request, response) => {
    response.json(contacts)
})

app.get('/api/contacts/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = contacts.find(note => note.id === id)
  
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
})

const generateId = () => {
    let random = Math.floor(Math.random()*100);
    if (contacts.map(contact => contact.id).includes(random)) {
        random = Math.floor(Math.random()*100);
    }
    return random;
}

app.post('/api/contacts', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
        error: 'content missing' 
    })
  } else if (contacts.map(contact => contact.name).includes(body.name)) {
    return response.status(400).json({ 
        error: 'name must be unique'
    })
  }

  const contact = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  contacts = contacts.concat(contact)

  response.json(contact)
})

app.delete('/api/contacts/:id', (request, response) => {
    const id = Number(request.params.id)
    contacts = contacts.filter(contact => contact.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})