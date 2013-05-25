module.exports = function (mongoose) {

  // Create Schema
  var UserSchema = mongoose.Schema({
      username: String,
      email: String,
      password: String,
      pos_x: Number,
      pos_y: Number
  });


  function validateUsername (username) {
      return !username == '' 
  }
  function validatePassword (password) {
    return !password == '' 
  }
  function validateEmail (email) {
    var regexp = '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$';
    return email.match(regexp);
  }

  UserSchema.path('email').validate(validateEmail, 'Wrong email try again.');
  UserSchema.path('username').validate(validateUsername, 'Username is Required');
  UserSchema.path('password').validate(validatePassword, 'Password is required');

  // Compile Model
  var User = mongoose.model('User', UserSchema);



}