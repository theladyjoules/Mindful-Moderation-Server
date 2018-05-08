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

exports.get_stats = function(req, res, next) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  // NEED TO ORDER BY DATE DESC
  console.log(req.params)
  const month = (req.params.year === 'all' && req.params.month === 'all') ? null : moment(req.params.year + req.params.month + "01");
  query = (month) ? { mealUser: ObjectId(userInfo._id), mealDate: {"$gte": month.toDate(), "$lt": month.endOf('month').toDate() }} : { mealUser: ObjectId(userInfo._id)};
  Meal.find(query).sort({ 'mealDate': -1 }).exec(function (err, meals) {
    if (err) { return next(err); }
    if(meals && Object.keys(meals).length){

      // console.log(meals)
      let hungerBeforeTotal = 0;
      let hungerAfterTotal = 0;
      let durationTotal = 0;
      let moods = {};
      let settings = {};
      let streak = 0;
      let streakDay = moment();
      let mealTotal = meals.length
      for(let meal in meals){
        hungerBeforeTotal += Number(meals[meal].mealHungerBefore);
        hungerAfterTotal += Number(meals[meal].mealHungerAfter);
        durationTotal += meals[meal].mealDuration;
        let moodLength = meals[meal].mealMood.length;
        for (i = 0; i < moodLength; i++) {
          if(meals[meal].mealMood[i] in moods){
            moods[meals[meal].mealMood[i]] = moods[meals[meal].mealMood[i]] + 1
          }
          else{
            moods[meals[meal].mealMood[i]] = 1
          }
        }
        if(meals[meal].mealSetting in settings){
          settings[meals[meal].mealSetting] = settings[meals[meal].mealSetting] + 1
        }
        else{
          settings[meals[meal].mealSetting] = 1
        }
        if(streakDay){
          mealDateMoment = moment(meals[meal].mealDate);
          if(mealDateMoment.isSame(streakDay, 'day')){
            // console.log('meal is the same day as the streak day')
            streakDay.subtract(1, 'day');
            streak++;
          }
          else if(mealDateMoment.isBefore(streakDay, 'day')){
            if(mealDateMoment.isSame(moment().subtract(1, 'day'), 'day') && streak === 0){
              // console.log('meal date is the same as yesterday and the streak is zero')
              streakDay.subtract(2, 'day');
              streak++;
            }
            else{
              // console.log('meal is before the streak day')
              streakDay = null;
            }
          }
        }
      }

      var sortedMoods = [];
      var sortedSettings = [];
      for (var mood in moods) {
          sortedMoods.push([mood, moods[mood]]);
      }
      for (var setting in settings) {
          sortedSettings.push([setting, settings[setting]]);
      }
      sortedMoods.sort(function(a, b) {
          return b[1] - a[1];
      });
      sortedSettings.sort(function(a, b) {
          return b[1] - a[1];
      });
      // console.log(sortedMoods)
      // console.log(sortedSettings)
      var key = (month) ? req.params.month + '-' + req.params.year : 'allTimeStats'
      res.json({
        success: true,
        key: key,
        stats: {
          totalMeals: mealTotal,
          streak: streak,
          averageHungerBefore: Math.round( (hungerBeforeTotal/mealTotal) * 10 ) / 10,
          averageHungerAfter: Math.round( (hungerAfterTotal/mealTotal) * 10 ) / 10,
          averageMealDuration: Math.round( (durationTotal/mealTotal) * 10 ) / 10,
          topMoods: [ sortedMoods[0], sortedMoods[1], sortedMoods[2]],
          topSettings: [ sortedSettings[0], sortedSettings[1], sortedSettings[2]]
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