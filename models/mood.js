var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MoodSchema = new Schema(
  {
    name: {type: String, required: true}
  }
);

//Export model
module.exports = mongoose.model('Mood', MoodSchema);