var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DrinkSchema = new Schema(
  {
    drink_user: [{type: Schema.ObjectId, ref: 'User'}],
    drink_name: {type: String, required: true},
    drink_time_start: {type: Date, required: true},
    drink_time_end: {type: Date, required: true},
    drink_drink: {type: String},
    drink_sobriety_before: {type: Number, required:true, min: 1, max:10},
    drink_sobriety_after: {type: Number, required:true, min: 1, max:10},
    drink_setting: {type: String},
    drink_moods: [{type: Schema.ObjectId, ref: 'Mood'}],
    drink_participants: {type: String},
    drink_notes: {type: String}
  }
);

//Export model
module.exports = mongoose.model('Drink', DrinkSchema);