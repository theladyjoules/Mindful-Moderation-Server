var jwt = require('jsonwebtoken'),  
    crypto = require('crypto'),
    User = require('../models/user'),
    config = require('../config/main'),
    validation = require('../utilities/validation'),
    strings = require('../utilities/strings'),
    isEmpty = require('../utilities/isEmpty'),
    bcrypt = require('bcrypt-nodejs');

function generateToken(user) {  
  return jwt.sign(user, config.secret, {
    expiresIn: 10080 // in seconds
  });
}

// Set user info from request
function setUserInfo(request) {  
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role,
  }
}

exports.account = function(req, res, next) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));

  User.findOne({ '_id': userInfo._id }, function(err, existingUser) {
    if (err) { return next(err); }
    res.status(200).json({
      firstName: existingUser.profile.firstName,
      lastName: existingUser.profile.lastName,
      email: existingUser.email
    });
  });
}

//========================================
// Login Route
//========================================
exports.login = function(req, res, next) {

  let userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo,
    expires: 10080
  });
}

//========================================
// Registration Route
//========================================
exports.register = function(req, res, next) {
  // Check for registration errors
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;

  // Return error if no email provided
  if (!email) {
    return res.status(422).send({ error: 'You must enter an email address.'});
  }

  // Return error if full name not provided
  if (!firstName || !lastName) {
    return res.status(422).send({ error: 'You must enter your full name.'});
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ error: 'You must enter a password.' });
  }

  User.findOne({ email: email }, function(err, existingUser) {
      if (err) { return next(err); }

      // If user is not unique, return error
      if (existingUser) {
        return res.status(422).send({ error: 'That email address is already in use.' });
      }

      // If email is unique and password was provided, create account
      let user = new User({
        email: email,
        password: password,
        profile: { firstName: firstName, lastName: lastName }
      });

      user.save(function(err, user) {
        if (err) { return next(err); }

        // Subscribe member to Mailchimp list
        // mailchimp.subscribeToNewsletter(user.email);

        // Respond with JWT if user was created

        let userInfo = setUserInfo(user);

        res.status(201).json({
          token: 'JWT ' + generateToken(userInfo),
          user: userInfo,
          expires: 10080
        });
      });
  });
}

//========================================
// Update User Route
//========================================
exports.update_user = function(req, res, next) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  // Check for registration errors
  const email = req.body.email;
  const isUpdatingEmail = userInfo.email !== email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  const errors = {}
  if (validation.isInvalidRequiredField(firstName)){
    errors.firstName = strings.string('required')
  }
  if (validation.isInvalidRequiredField(lastName)){
    errors.lastName = strings.string('required')
  }
  if (validation.isInvalidRequiredField(email)){
    errors.email = strings.string('required')
  }
  if (isUpdatingEmail && validation.isInvalidEmail(email)){
    errors.email = strings.string('email')
  }

  if (!isEmpty.isEmpty(errors)) {
    return res.status(422).send(errors);
  }

  if(isUpdatingEmail){
    User.findOne({ email: email }, function(err, existingUser) {
      if (err) { return next(err); }

      // If user is not unique, return error
      if (existingUser) {
        return res.status(422).send({ error: 'That email address is already in use.' });
      }
    });
  }

  // If email is unique and password was provided, update account
  let userUpdate = {
    email: email,
    profile: { firstName: firstName, lastName: lastName }
  };
  User.findByIdAndUpdate(userInfo._id, userUpdate, {}, function (err, user) {
    if (err) { return next(err); }

    res.status(200).json({ 
      success: 'User successfully updated',
      firstName: userUpdate.profile.firstName,
      lastName: userUpdate.profile.lastName,
      email: userUpdate.email
    });
  });
}

//========================================
// Update Password Route
//========================================
exports.update_password = function(req, res, next) {
  var token = req.headers.authorization.substring(4);
  var userInfo = jwt.decode(req.headers.authorization.substring(4));
  // Check for registration errors
  const currentPassword = req.body.currentPassword;
  const password = req.body.password;

  const errors = {}
  if (validation.isInvalidRequiredField(currentPassword)){
    errors.currentPassword = strings.string('required')
  }
  if (validation.isInvalidRequiredField(password)){
    errors.password = strings.string('required')
  }
  if (validation.isInvalidPassword(password)){
    errors.password = strings.string('password')
  }

  if (!isEmpty.isEmpty(errors)) {
    res.status(400).json(errors);
  }

  User.findOne({'_id': userInfo._id }, function(err, user) {
    if (err) { return next(err); }

    bcrypt.compare(currentPassword, user.password, function(err, isMatch) {
      if (err || !isMatch) {
        res.status(400).json({
          error:'Current password is incorrect.',
          errorInfo: err
        });
      }
      else{
        const SALT_FACTOR = 5;
        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
          if (err) return next(err);

          bcrypt.hash(password, salt, null, function(err, hash) {
            if (err) return next(err);
            
            User.update({'_id':userInfo._id}, { password: hash }, {}, function (err, user) {
              if (err) { return next(err); }

              res.status(200).json({ 
                success: 'Password successfully updated'
              });
            });
          });
        });
      }
    });
  });

}

//========================================
// Authorization Middleware
//========================================

// Role authorization check
exports.roleAuthorization = function(role) {  
  return function(req, res, next) {
    const user = req.user;

    User.findById(user._id, function(err, foundUser) {
      if (err) {
        res.status(422).json({ error: 'No user was found.' });
        return next(err);
      }

      // If user is found, check role.
      if (foundUser.role == role) {
        return next();
      }

      res.status(401).json({ error: 'You are not authorized to view this content.' });
      return next('Unauthorized');
    })
  }
}