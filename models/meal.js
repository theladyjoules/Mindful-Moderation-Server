var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MealSchema = new Schema(
  {
    meal_user: [{type: Schema.ObjectId, ref: 'User'}],
    meal_name: {type: String, required: true},
    meal_time_start: {type: Date, required: true},
    meal_time_end: {type: Date, required: true},
    meal_foods: {type: String},
    meal_hunger_before: {type: Number, required:true, min: 1, max:10},
    meal_hunger_after: {type: Number, required:true, min: 1, max:10},
    meal_setting: {type: String},
    meal_moods: [{type: Schema.ObjectId, ref: 'Mood'}],
    meal_participants: {type: String},
    meal_notes: {type: String}
  }
);

//Export model
module.exports = mongoose.model('Drink', MealSchema);