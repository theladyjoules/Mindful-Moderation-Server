module.exports = {  
  // Secret key for JWT signing and encryption
  'secret': 'fluffy hoppy soft buns',
  // Database connection information
  'database': process.env.MONGODB_URI || 'mongodb://theladyjoules:ml13babaR@ds231199.mlab.com:31199/mindful_moderation',
}