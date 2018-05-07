var Meal = require('../models/meal');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { isValidDate } = require('../utilities/validation');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var Promise = require('promise');

exports.create_meal = [
  check('mealDate')
    .exists().withMessage('Meal date is required.')
    .custom(isValidDate).withMessage('Meal date must be a valid date.'),
  check('mealDateHumanFormat')
    .exists().withMessage('Human formatted meal date is required.'),
  check('mealTimeHumanFormat')
    .exists().withMessage('Human formatted meal time is required.'),
  check('mealDateFormFormat')
    .exists().withMessage('Form formatted meal date is required.'),
  check('mealTimeFormFormat')
    .exists().withMessage('Form formatted meal time is required.'),
  check('mealDuration').optional()
    .isNumeric().withMessage('Meal duration must be a number of minutes.'),
  check('mealHungerBefore')
    .exists().withMessage('Starting hunger level is required.')
    .isInt({min:1, max:10}).withMessage('Starting hunger level must be between 1 and 10.'),
  check('mealHungerAfter')
    .exists().withMessage('Ending hunger level is required.')
    .isInt({min:1, max:10}).withMessage('Ending hunger level must be between 1 and 10.'),
  
  sanitizeBody('*').trim().escape(),

  (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    else{
      var token = req.headers.authorization.substring(4);
      var userInfo = jwt.decode(req.headers.authorization.substring(4));
      var meal = new Meal({ 
        mealUser: userInfo._id,
        mealDate: req.body.mealDate,
        mealDateHumanFormat: req.body.mealDateHumanFormat,
        mealTimeHumanFormat: req.body.mealTimeHumanFormat,
        mealDateFormFormat: req.body.mealDateFormFormat,
        mealTimeFormFormat: req.body.mealTimeFormFormat,
        mealDuration: req.body.mealDuration, 
        mealName: req.body.mealName,
        mealFoods: req.body.mealFoods,
        mealHungerBefore: req.body.mealHungerBefore,
        mealHungerAfter: req.body.mealHungerAfter,
        mealMood: req.body.mealMood,
        mealSetting: req.body.mealSetting,
        mealNotes: req.body.mealNotes
      });

      meal.save(function (err, meal) {
        if (err) { return next(err); }
        res.status(200).json({
          success: true,
          meal: meal
        });
      });
    }
  }
];

exports.view_meal = function(req, res) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  Meal.findOne({mealUser: ObjectId(userInfo._id), _id: ObjectId(req.params.id)})
    .exec(function (err, results) {
      if (err) { return next(err); }

      if(results && Object.keys(results).length){
        res.json({
          'success': true,
          'day': results.mealDateHumanFormat,
          'meal': { [results._id]: results }
        });
      }
      else{
        res.json({
          'error': true,
          'message': 'The requested meal does not exist.'
        });
      }
    });
};

exports.view_meals_by_day = function(req, res) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  const dayParts = req.params.day.split("-");
  const day = moment(dayParts[2] + dayParts[0] + dayParts[1])
  console.log(day)
  Meal.find({mealUser: ObjectId(userInfo._id), mealDate: {"$gte": day.toDate(), "$lt": day.add(1, 'days').toDate()}}).sort({ 'mealDate': 1 })
    .exec(function (err, results) {
      if (err) { return next(err); }
      let meals = {}
      for(let meal in results){
        meals[results[meal]._id] = results[meal]
      }
      res.json({
        'success': true,
        'day': req.params.day,
        'meals': meals
      });
    });
};


exports.view_meals_by_month = function(req, res) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  const month = moment(req.params.year + req.params.month + "01")
  console.log(month)
  Meal.find({mealUser: ObjectId(userInfo._id), mealDate: {"$gte": month.toDate(), "$lt": month.endOf('month').toDate() }}).sort({ 'mealDate': 1 }).select('mealDate mealDateHumanFormat mealTimeHumanFormat mealName mealHungerBefore mealHungerAfter')
    .exec(function (err, results) {
      if (err) { return next(err); }
      let meals = {}
      for(let meal in results){
        if(results[meal].mealDateHumanFormat in meals){
          meals[results[meal].mealDateHumanFormat][results[meal]._id] = results[meal]
        }
        else{
          meals[results[meal].mealDateHumanFormat] = {[results[meal]._id]:results[meal]}
        }
      }
      res.json({
        'success': true,
        'month': req.params.month + req.params.year,
        'meals': meals
      });
    });
};

exports.update_meal = [
  check('mealDate').optional()
    .custom(isValidDate).withMessage('Meal date must be a valid date.'),
  check('mealDuration').optional()
    .isNumeric().withMessage('Meal duration must be a number of minutes.'),
  check('mealHungerBefore').optional()
    .isInt({min:1, max:10}).withMessage('Starting hunger level must be between 1 and 10.'),
  check('mealHungerAfter').optional()
    .isInt({min:1, max:10}).withMessage('Ending hunger level must be between 1 and 10.'),
  
  sanitizeBody('*').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    else{
      var token = req.headers.authorization.substring(4);
      var userInfo = jwt.decode(req.headers.authorization.substring(4));
      var mealId = req.body.mealId;
      var updatedFields = req.body;
      delete updatedFields.mealId;

      var query = {mealUser: ObjectId(userInfo._id), _id: ObjectId(mealId)};
      Meal.findOneAndUpdate(query, updatedFields, {new: true}, function (err, meal) {
        if (err) { return next(err); }
        res.status(200).json({
          success: true,
          meal: meal
        });
      });
    }
  }
];

exports.delete_meal = [
  check('mealId')
    .exists().withMessage('Meal ID is required for deletion.'),

  (req, res, next) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    else{
      var token = req.headers.authorization.substring(4);
      var userInfo = jwt.decode(req.headers.authorization.substring(4));
      var mealId = req.body.mealId;
      var query = {mealUser: ObjectId(userInfo._id), _id: ObjectId(mealId)};
      Meal.findOneAndRemove(query, function (err, meal) {
        if (err) { return next(err); }
        res.status(200).json({
          success: true,
          meal: meal._id
        });
      });
    }
  }
];

function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

exports.get_stats = function(req, res) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  // NEED TO ORDER BY DATE DESC
  Meal.find({mealUser: ObjectId(userInfo._id)}, function (err, meals) {
    if (err) { return next(err); }
    if(meals && Object.keys(meals).length){

      console.log(meals)
      let hungerBeforeTotal = 0;
      let hungerAfterTotal = 0;
      let durationTotal = 0;
      let moodConcat = '';
      let settingConcat= '';
      let streak = 0;
      let streakDay = moment().subtract(1, 'day');
      let mealTotal = meals.length
      for(let meal in meals){
        hungerBeforeTotal += meals[meal].mealHungerBefore;
        hungerAfterTotal += meals[meal].mealHungerAfter;
        durationTotal += meals[meal].mealDuration;
        let moodLength = meals[meal].mealMood.length;
        for (i = 0; i < moodLength; i++) {
          moodConcat += '0' + meals[meal].mealMood + '0'
        }
        settingConcat += '0' + meals[meal].mealSetting + '0'
        if(streakDay){
          mealDateMoment = meals[meal]mealDate;
          if(mealDateMoment.isSame(streakDay, 'day')){
            streakDay.subtract(1, 'day');
            streak++;
          }
          else if(mealDateMoment.isAfter(streakDay, 'day')){
            streakDay = null;
          }
        }
      }

      res.json({
        success: true,
        stats: {
          totalMeals: mealTotal,
          averageHungerBefore: hungerBeforeTotal/mealTotal,
          averageHungerAfter: averageHungerAfter/mealTotal,
          averageMealDuration: durationTotal/mealTotal,
          
        }
      });
    }
    else{
      res.json({
        'error': true,
        'message': 'Error fetching stats.'
      });
    }
  });
};