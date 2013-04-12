module.exports = function (mongoose) {

  // Create Schema
  var UserSchema = mongoose.Schema({
      first_name: String,
      last_name: String,
      email: String,
      password: String
  })


  function validateEmail (email) {
    var regexp = '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$';
    return email.match(regexp);
  }

  UserSchema.path('email').validate(validateEmail, 'Wrong email try again.');



  // Compile Model
  var User = mongoose.model('User', UserSchema);



}