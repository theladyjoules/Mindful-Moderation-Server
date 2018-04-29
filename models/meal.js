var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MealSchema = new Schema(
  {
    mealUser: [{type: Schema.ObjectId, ref: 'User'}],
    mealDate: {type: Date, required: true},
    mealDateFormatted: {type: String, required: true},
    mealTimeFormatted: {type: String, required: true},
    mealDuration: {type: Number},
    mealName: {type: String},
    mealFoods: {type: String},
    mealHungerBefore: {type: Number, min: 1, max:10},
    mealHungerAfter: {type: Number, min: 1, max:10},
    mealSetting: {type: String},
    mealMood: {type: [String]},
    mealNotes: {type: String}
  }
);

//Export model
module.exports = mongoose.model('Meal', MealSchema);