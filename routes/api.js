var express = require('express');
var router = express.Router();
var AuthenticationController = require('../controllers/authentication'),
    passportService = require('../config/passport'),
    passport = require('passport');

var drink_controller = require('../controllers/drinkController');
var meal_controller = require('../controllers/mealController');
var mood_controller = require('../controllers/moodController');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });  
const requireLogin = passport.authenticate('local', { session: false });

// Constants for role types
const REQUIRE_ADMIN = "Admin",  
      REQUIRE_OWNER = "Owner",
      REQUIRE_CLIENT = "Client",
      REQUIRE_MEMBER = "Member";

// Registration route
router.post('/register', AuthenticationController.register);

// Login route
router.post('/login', requireLogin, AuthenticationController.login);
// Login route

router.get('/account', requireAuth, AuthenticationController.account);

// Drink Routes
router.post('/drink/create', drink_controller.create_drink);

router.get('/drink/:id/view', drink_controller.view_drink);

router.post('/drink/:id/update', drink_controller.update_drink);

router.post('/drink/:id/delete', drink_controller.delete_drink);

// Meal Routes
router.post('/meal/create', meal_controller.create_meal);

router.get('/meal/:id/view', meal_controller.view_meal);

router.post('/meal/:id/update', meal_controller.update_meal);

router.post('/meal/:id/delete', meal_controller.delete_meal);

router.get('/day/:id', requireAuth, meal_controller.view_meal_summary);

// Mood Routes
router.get('/mood/view', mood_controller.view_all_moods);

module.exports = router;