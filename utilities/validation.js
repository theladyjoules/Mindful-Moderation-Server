var moment = require('moment');

exports.isInvalidEmail = (email) => {
  if(!email || email === null || email === ''){
    return false
  }
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !re.test(email)
}

exports.isInvalidPassword = (password) => {
  if(!password || password === null || password === ''){
    return false
  }
  return password.length<8
}

exports.isInvalidRequiredField = (field) => {
  return !field || field === null || field === '' 
}

exports.isValidDate = (value) => {
  return moment(value).isValid()
}

exports.isValidMealType = (value) => {
  return value === 'meal' || value === 'snack'
}