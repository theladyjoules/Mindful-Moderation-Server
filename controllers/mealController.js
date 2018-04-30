var Meal = require('../models/meal');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { isValidDate } = require('../utilities/validation');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

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


        console.log(req.body.mealDate)
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
      res.json({
        'success': true,
        'day': results.mealDateHumanFormat,
        'meal': { [results._id]: results }
      });
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

exports.update_meal = function(req, res) {
  res.send('NOT IMPLEMENTED: Update Meal Endpoint');
};

exports.delete_meal = function(req, res) {
  res.send('NOT IMPLEMENTED: Delete Meal Endpoint');
};