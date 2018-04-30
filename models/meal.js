var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MealSchema = new Schema(
  {
    mealUser: [{type: Schema.ObjectId, ref: 'User'}],
    mealDate: {type: Date, required: true},
    mealDateHumanFormat: {type: String, required: true},
    mealTimeHumanFormat: {type: String, required: true},
    mealDateFormFormat: {type: String, required: true},
    mealTimeFormFormat: {type: String, required: true},
    mealDuration: {type: Number},
    mealName: {type: String},
    mealFoods: {type: String},
    mealHungerBefore: {type: String},
    mealHungerAfter: {type: String},
    mealSetting: {type: String},
    mealMood: {type: [String]},
    mealNotes: {type: String}
  }
);

//Export model
module.exports = mongoose.model('Meal', MealSchema);