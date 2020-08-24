const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('Error connecting to MongoDB: ', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  number: { type: String, minlength: 8, required: true },
})
personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnObj) => {
    returnObj.id = document._id.toString()
    delete returnObj._id
    delete returnObj.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
