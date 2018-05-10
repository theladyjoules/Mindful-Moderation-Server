var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer({dest: 'tmp/csv/'})
var AuthenticationController = require('../controllers/authentication'),
    passportService = require('../config/passport'),
    passport = require('passport');
var meal_controller = require('../controllers/mealController');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });  
const requireLogin = passport.authenticate('local', { session: false });

// Constants for role types
const REQUIRE_ADMIN = "Admin",  
      REQUIRE_OWNER = "Owner",
      REQUIRE_CLIENT = "Client",
      REQUIRE_MEMBER = "Member";

// User and Account routes
router.post('/register', AuthenticationController.register);
router.post('/update_user', requireAuth, AuthenticationController.update_user);
router.post('/update_password', requireAuth, AuthenticationController.update_password);
router.post('/login', requireLogin, AuthenticationController.login);
router.get('/account', requireAuth, AuthenticationController.account);

// Meal Routes
router.post('/meal/create', requireAuth, meal_controller.create_meal);
router.get('/meal/:id', requireAuth, meal_controller.view_meal);
router.post('/meal/update', meal_controller.update_meal);
router.post('/meal/delete', meal_controller.delete_meal);

router.post('/import', upload.single('importFile'), requireAuth, meal_controller.import);

router.get('/export', requireAuth, meal_controller.export);

router.get('/day/:day', requireAuth, meal_controller.view_meals_by_day);

router.get('/month/:month/:year', requireAuth, meal_controller.view_meals_by_month);

router.get('/stats/:month/:year', requireAuth, meal_controller.get_stats);

module.exports = router;

