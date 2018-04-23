var Meal = require('../models/meal');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.create_meal = [
  // Convert the mood to an array.
  (req, res, next) => {
      if(!(req.body.moods instanceof Array)){
          if(typeof req.body.moods==='undefined')
          req.body.moods=[];
          else
          req.body.moods=new Array(req.body.moods);
      }
      next();
  },
  body('meal_name', 'Meal name required').isLength({ min: 1 }).trim(),
  body('meal_time_start', 'Meal start time required').isLength({ min: 1 }).trim(),
  body('meal_time_end', 'Meal end time required').isLength({ min: 1 }).trim(),
  // body('meal_hunger_before', 'Meal beginning hunger required').isLength({ min: 1 }).isNumber().trim(),
  // body('meal_hunger_after', 'Meal ending hunger required').isLength({ min: 1 }).isNumber().trim(),
  
  sanitizeBody('*').trim().escape(),

  (req, res, next) => {

    const errors = validationResult(req);

    var meal = new Meal({ 
      meal_user_id: '5ac7e293734d1d2fb5429046',
      meal_name: req.body.meal_name,
      meal_time_start: req.body.meal_time_start,
      meal_duration: req.body.meal_duration,
      meal_foods: req.body.meal_foods,
      meal_hunger_before: req.body.meal_hunger_before,
      meal_hunger_after: req.body.meal_hunger_after,
      meal_setting: req.body.meal_setting,
      meal_moods: req.body.meal_moods,
      meal_notes: req.body.meal_notes
    });

    if (!errors.isEmpty()) {
      res.json('error', { errors: errors.array()});
      return;
    }
    else {
      meal.save(function (err) {
        if (err) { return next(err); }
        res.json('success!');
      });
    }
  }
];

exports.view_meal = function(req, res) {
  res.send('NOT IMPLEMENTED: View Meal Endpoint');
};

exports.view_meal_summary = function(req, res) {
  var requestedDate = req.params.id.split('-');
   Meal.find({meal_time_start: {"$gte": new Date(requestedDate[2], requestedDate[0], requestedDate[1]), "$lt": new Date(requestedDate[2], requestedDate[0], requestedDate[1] + 1)}}, 'meal_name meal_hunger_before meal_hunger_after meal_moods')
    .exec(function (err, results) {
      if (err) { return next(err); }
      res.json(results);
    });
};

exports.update_meal = function(req, res) {
  res.send('NOT IMPLEMENTED: Update Meal Endpoint');
};

exports.delete_meal = function(req, res) {
  res.send('NOT IMPLEMENTED: Delete Meal Endpoint');
};