const mongoose = require('mongoose')

const TagsSchema = new mongoose.Schema({
  name: {type: String, required: true, index: true},
  datasetsLength: {type: Number, required: true},
  datasets: [{type: mongoose.Types.ObjectId, ref: "Dataset"}],
  createdDate: {type: String, required: true, default: Date.now()}
})

module.exports = mongoose.model('Tag', TagsSchema)
