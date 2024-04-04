require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)
.then(result => {
    console.log('connected to MongoDB')
})
.catch(error => {
    console.log('error connecting to MongoDB:', error.message)
})

// establish contact schema
const contactSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

// transform returned documents with configurable options in setter of schema
contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// establish contact model, assigning model name and model schema
module.exports = mongoose.model('Contact', contactSchema)