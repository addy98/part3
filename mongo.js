const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

// assign command line arguments
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://addisonwest98:${password}@cluster0.hlkgmrc.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

// establish contact schema
const contactSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

// establish contact model, assigning model name and model schema
const Contact = mongoose.model('Contact', contactSchema)

// branching predicated on how many arguments are given in the command line input
if (process.argv.length === 5) {     // create new contact
    const contact = new Contact({
        name: name,
        number: number,
    })
    contact.save().then(result => {
        console.log(`added ${contact.name}, number: ${contact.number} to phonebook`)
        mongoose.connection.close()
    })
} else {     // list all contacts
    Contact.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(contact => {
            console.log(`${contact.name} ${contact.number}`)
        })
        mongoose.connection.close()
    })
}