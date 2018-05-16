var Meal = require('../models/meal');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { isValidDate, isValidMealType } = require('../utilities/validation');
const { decodeString } = require('../utilities/strings');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var csv = require('fast-csv');

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
  check('mealType').exists()
    .custom(isValidMealType).withMessage('Meal type must be "snack" or "meal".'),
  check('mealDuration').optional()
    .isNumeric().withMessage('Meal duration must be a number of minutes.'),
  check('mealHungerBefore')
    .exists().withMessage('Starting hunger level is required.')
    .isInt({min:0, max:10}).withMessage('Starting hunger level must be between 0 and 10.'),
  check('mealHungerAfter')
    .exists().withMessage('Ending hunger level is required.')
    .isInt({min:0, max:10}).withMessage('Ending hunger level must be between 0 and 10.'),
  
  sanitizeBody('*').trim().escape(),

  (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    else{
      var token = req.headers.authorization.substring(4);
      var userInfo = jwt.decode(req.headers.authorization.substring(4));
      if('mealMood' in req.body){
        for (i = 0; i < req.body.mealMood; i++) {
          req.body.mealMood[i] = decodeString(req.body.mealMood[i])
        }
      }
      var meal = new Meal({ 
        mealUser: userInfo._id,
        mealDate: req.body.mealDate,
        mealDateHumanFormat: req.body.mealDateHumanFormat,
        mealTimeHumanFormat: req.body.mealTimeHumanFormat,
        mealDateFormFormat: req.body.mealDateFormFormat,
        mealTimeFormFormat: req.body.mealTimeFormFormat,
        mealType: req.body.mealType, 
        mealDuration: req.body.mealDuration, 
        mealName: 'mealName' in req.body ? decodeString(req.body.mealName) : '',
        mealFoods: 'mealFoods' in req.body ? decodeString(req.body.mealFoods) : '',
        mealHungerBefore: req.body.mealHungerBefore,
        mealHungerAfter: req.body.mealHungerAfter,
        mealMood: 'mealMood' in req.body ? req.body.mealMood : [],
        mealSetting: 'mealSetting' in req.body ? decodeString(req.body.mealSetting) : '',
        mealNotes: 'mealNotes' in req.body ? decodeString(req.body.mealNotes) : ''
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
  const day = moment(req.params.day + ' 12:00 am', 'MM-DD-YYYY HH:mm a')
  const startDay = new Date(day.clone().utcOffset(Math.abs(Number(req.params.offset))).format('YYYY-MM-DD HH:mm'))
  const endDay = new Date(day.clone().endOf('day').utcOffset(Math.abs(Number(req.params.offset))).format('YYYY-MM-DD HH:mm'))
  Meal.find({mealUser: ObjectId(userInfo._id), mealDate: {"$gte": startDay, "$lt": endDay}}).sort({ 'mealDate': 1 })
    .exec(function (err, results) {
      if (err) { return next(err); }
      let meals = {}
      for(let meal in results){
        meals[results[meal]._id] = results[meal]
      }
      res.json({
        'success': true,
        'day': req.params.day,
        'meals': meals,
        'serveroffset': moment(),
        'dayMoment': day,
        'startDay': startDay,
        'endDay': endDay
      });
    });
};


exports.view_meals_by_month = function(req, res) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  const month = moment(req.params.year + req.params.month + "01")
  Meal.find({mealUser: ObjectId(userInfo._id), mealDate: {"$gte": month.toDate(), "$lt": month.endOf('month').toDate() }}).sort({ 'mealDate': 1 }).select('mealDate mealDateHumanFormat mealTimeHumanFormat mealType mealName mealHungerBefore mealHungerAfter').sort({ 'mealDate': 1 })
    .exec(function (err, results) {
      if (err) { return next(err); }
      let meals = {}
      for(let meal in results){
        if(results[meal].mealDateHumanFormat in meals){
          meals[results[meal].mealDateHumanFormat].push(results[meal])
        }
        else{
          meals[results[meal].mealDateHumanFormat] = [results[meal]]
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
  check('mealType').optional()
    .custom(isValidMealType).withMessage('Meal type must be "snack" or "meal".'),
  check('mealDuration').optional()
    .isNumeric().withMessage('Meal duration must be a number of minutes.'),
  check('mealHungerBefore').optional()
    .isInt({min:0, max:10}).withMessage('Starting hunger level must be between 0 and 10.'),
  check('mealHungerAfter').optional()
    .isInt({min:0, max:10}).withMessage('Ending hunger level must be between 0 and 10.'),
  
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

      if('mealName' in updatedFields){
        updatedFields.mealName = decodeString(updatedFields.mealName)
      }
      if('mealFoods' in updatedFields){
        updatedFields.mealFoods = decodeString(updatedFields.mealFoods)
      }
      if('mealSetting' in updatedFields){
        updatedFields.mealSetting = decodeString(updatedFields.mealSetting)
      }
      if('mealNotes' in updatedFields){
        updatedFields.mealNotes = decodeString(updatedFields.mealNotes)
      }
      if('mealMood' in updatedFields){
        for (i = 0; i < updatedFields.mealMood; i++) {
          updatedFields.mealMood[i] = decodeString(updatedFields.mealMood[i])
        }
      }
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
  const month = (req.params.year === 'all' && req.params.month === 'all') ? null : moment(req.params.year + req.params.month + "01");
  query = (month) ? { mealUser: ObjectId(userInfo._id), mealDate: {"$gte": month.toDate(), "$lt": month.endOf('month').toDate() }} : { mealUser: ObjectId(userInfo._id)};
  Meal.find(query).sort({ 'mealDate': -1 }).exec(function (err, meals) {
    if (err) { return next(err); }
    if(meals && Object.keys(meals).length){
      let mealHungerBeforeTotal = 0;
      let snackHungerBeforeTotal = 0;
      let mealHungerAfterTotal = 0;
      let snackHungerAfterTotal = 0;
      let mealDurationTotal = 0;
      let snackDurationTotal = 0;
      let mealMoods = {};
      let snackMoods = {};
      let mealSettings = {};
      let snackSettings = {};
      let streak = 0;
      let streakDay = moment();
      let total = meals.length;
      let mealTotal = 0;
      let snackTotal = 0;
      let days = []
      for(let meal in meals){
        mealTotal += (meals[meal].mealType === 'meal') ? 1 : 0;
        snackTotal += (meals[meal].mealType === 'snack') ? 1 : 0;
        mealHungerBeforeTotal += (meals[meal].mealType === 'meal') ? Number(meals[meal].mealHungerBefore) : 0;
        snackHungerBeforeTotal += (meals[meal].mealType === 'snack') ? Number(meals[meal].mealHungerBefore) : 0;
        mealHungerAfterTotal += (meals[meal].mealType === 'meal') ? Number(meals[meal].mealHungerAfter) : 0;
        snackHungerAfterTotal += (meals[meal].mealType === 'snack') ? Number(meals[meal].mealHungerAfter) : 0;
        mealDurationTotal += (meals[meal].mealType === 'meal') ? meals[meal].mealDuration : 0;
        snackDurationTotal += (meals[meal].mealType === 'snack') ? meals[meal].mealDuration : 0;
        let moodLength = meals[meal].mealMood.length;
        if(meals[meal].mealType === 'meal'){
          for (i = 0; i < moodLength; i++) {
            if(meals[meal].mealMood[i] in mealMoods){
              mealMoods[meals[meal].mealMood[i]] = mealMoods[meals[meal].mealMood[i]] + 1
            }
            else{
              mealMoods[meals[meal].mealMood[i]] = 1
            }
          }
          if(meals[meal].mealSetting in mealSettings){
            mealSettings[meals[meal].mealSetting] = mealSettings[meals[meal].mealSetting] + 1
          }
          else{
            mealSettings[meals[meal].mealSetting] = 1
          }
        }
        else{
          for (i = 0; i < moodLength; i++) {
            if(meals[meal].mealMood[i] in snackMoods){
              snackMoods[meals[meal].mealMood[i]] = snackMoods[meals[meal].mealMood[i]] + 1
            }
            else{
              snackMoods[meals[meal].mealMood[i]] = 1
            }
          }
          if(meals[meal].mealSetting in snackSettings){
            snackSettings[meals[meal].mealSetting] = snackSettings[meals[meal].mealSetting] + 1
          }
          else{
            snackSettings[meals[meal].mealSetting] = 1
          }
        }
        if(streakDay){
          mealDateMoment = moment(meals[meal].mealDate);
          if(mealDateMoment.isSame(streakDay, 'day')){
            streakDay.subtract(1, 'day');
            streak++;
          }
          else if(mealDateMoment.isBefore(streakDay, 'day')){
            if(mealDateMoment.isSame(moment().subtract(1, 'day'), 'day') && streak === 0){
              streakDay.subtract(2, 'day');
              streak++;
            }
            else{
              streakDay = null;
            }
          }
        }
        if(days.indexOf(meals[meal].mealDateHumanFormat) === -1){
          days.push(meals[meal].mealDateHumanFormat)
        }
      }

      var sortedMealMoods = [];
      var sortedSnackMoods = [];
      var sortedMealSettings = [];
      var sortedSnackSettings = [];
      for (var mood in mealMoods) {
        sortedMealMoods.push([mood, mealMoods[mood]]);
      }
      for (var mood in snackMoods) {
        sortedSnackMoods.push([mood, snackMoods[mood]]);
      }
      for (var setting in mealSettings) {
        sortedMealSettings.push([setting, mealSettings[setting]]);
      }
      for (var setting in snackSettings) {
        sortedSnackSettings.push([setting, snackSettings[setting]]);
      }
      sortedMealMoods.sort(function(a, b) {
        return b[1] - a[1];
      });
      sortedSnackMoods.sort(function(a, b) {
        return b[1] - a[1];
      });
      sortedMealSettings.sort(function(a, b) {
        return b[1] - a[1];
      });
      sortedSnackSettings.sort(function(a, b) {
        return b[1] - a[1];
      });
      var key = (month) ? req.params.month + '-' + req.params.year : 'allTimeStats'
      res.json({
        success: true,
        key: key,
        stats: {
          total: total,
          streak: streak,
          meal: {
            mealTotal: mealTotal,
            averageMealsPerDay: Math.round( (mealTotal/days.length) * 10 ) / 10,
            averageHungerBefore: Math.round( (mealHungerBeforeTotal/mealTotal) * 10 ) / 10,
            averageHungerAfter: Math.round( (mealHungerAfterTotal/mealTotal) * 10 ) / 10,
            averageMealDuration: Math.round( (mealDurationTotal/mealTotal) * 10 ) / 10,
            topMoods: [ sortedMealMoods[0], sortedMealMoods[1], sortedMealMoods[2]],
            topSettings: [ sortedMealSettings[0], sortedMealSettings[1], sortedMealSettings[2]]
          },
          snack: {
            snackTotal: snackTotal,
            averageSnacksPerDay: Math.round( (snackTotal/days.length) * 10 ) / 10,
            averageHungerBefore: Math.round( (snackHungerBeforeTotal/snackTotal) * 10 ) / 10,
            averageHungerAfter: Math.round( (snackHungerAfterTotal/snackTotal) * 10 ) / 10,
            averageMealDuration: Math.round( (snackDurationTotal/snackTotal) * 10 ) / 10,
            topMoods: [ sortedSnackMoods[0], sortedSnackMoods[1], sortedSnackMoods[2]],
            topSettings: [ sortedSnackSettings[0], sortedSnackSettings[1], sortedSnackSettings[2]]
          }
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

exports.import = [
  (req, res, next) => {
    if (!req.file){
      res.json({
        'success': false,
        'message': 'No files found.'
      });
    }
    
    var token = req.headers.authorization.substring(4);
    var userInfo = jwt.decode(req.headers.authorization.substring(4));

    var importFile = req.file;
    var meals = [];
   
    csv.fromPath(req.file.path, {headers:true})
     .on("data", function(data){
        if(data['mealDateHumanFormat'] && data['mealDateHumanFormat'] !== ''){
          let mealDateArray = (data['mealDateHumanFormat'].indexOf('/') > -1) ? data['mealDateHumanFormat'].split('/') : data['mealDateHumanFormat'].split('-')
          let mealDateFormat = mealDateArray[2].length === 4 ? 'MM-DD-YYYY' : 'MM-DD-YY'
          mealDateFormat += (data['mealTimeHumanFormat'].slice(-2) === 'AM' || data['mealTimeHumanFormat'].slice(-2) === 'PM') ? ' h:mm A' : ' h:mm a'
          let mealDateMoment = moment(data['mealDateHumanFormat'] + ' ' + data['mealTimeHumanFormat'], mealDateFormat)
          let mealMoodArray = data['mealMoodString'].split(',')
          data['_id'] = new mongoose.Types.ObjectId()
          data['mealDateHumanFormat'] = mealDateMoment.format('MM-DD-YYYY')
          data['mealUser'] = ObjectId(userInfo._id)
          data['mealDate'] = mealDateMoment
          data['mealDateFormFormat'] = mealDateMoment.format('YYYY-MM-DD')
          data['mealTimeFormFormat'] = mealDateMoment.format('h:mm a')
          data['mealMood'] = mealMoodArray
          meals.push(data);
        }
     })
     .on("end", function(){
        Meal.create(meals, function(err, meals) {
          if (err) throw err;
        });
        
        res.json({
          'success': true,
          'importCount': meals.length
        });
     }
   );
  }
];

exports.export = function(req, res) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  Meal.find({mealUser: ObjectId(userInfo._id)}).sort({ 'mealDate': 1 }).exec(function (err, meals) {
      if (err) { return next(err); }

      if(meals && Object.keys(meals).length){
        for(let meal in meals){
          meals[meal].mealMoodString = meals[meal].mealMood.toString()
        }
        const Json2csvParser = require('json2csv').Parser;
        var fields = ['mealDateHumanFormat', 'mealTimeHumanFormat', 'mealType', 'mealDuration', 'mealName', 'mealFoods', 'mealHungerBefore', 'mealHungerAfter', 'mealSetting', 'mealMoodString', 'mealNotes'];
        const json2csvParser = new Json2csvParser({ fields });
        const csvFile = json2csvParser.parse(meals);
        res.setHeader('Content-disposition', 'attachment; filename=testing.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csvFile);
      }
      else{
        res.json({
          'success': false,
          'message': 'This user has no meals logged.'
        });
      }
  });
};