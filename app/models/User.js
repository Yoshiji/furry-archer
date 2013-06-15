module.exports = function (mongoose) {

  // Create Schema
  var UserSchema = mongoose.Schema({
      username: String,
      email: String,
      password: String,
      pos_x: Number,
      pos_y: Number,
      gold: Number,
      level: Number,
      health: Number,
      max_health: Number,
      is_fighting: Boolean,
      captured_tiles: Number,
      weapons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Weapon' }]
  });

  UserSchema.methods.remaining_tiles = function(self) {
    return self.max_tiles(self) - self.captured_tiles;
  }

  UserSchema.methods.max_tiles = function(self) {
    return self.level * SETTINGS.ratio_level_tile + SETTINGS.offset_level_tile;
  }

  UserSchema.methods.recalc_level = function(self, socket) {
    Tile.find({owner_name: self.username}, function(err, tiles) {
      var owned_tiles = tiles.length;
      var rest = owned_tiles % SETTINGS.tiles_to_next_level;
      var level = (owned_tiles - rest) / SETTINGS.tiles_to_next_level;
      self.level = level;
      self.save();
      socket.emit('update_infos', self);
    });
  }

  UserSchema.methods.captured_new_tile = function(self, socket) {
    Tile.find({owner_name: self.username}, function(err, tiles) {
      var owned_tiles = tiles.length;
      var limit_to_next_level = SETTINGS.tiles_to_next_level*self.level;

      if(owned_tiles > limit_to_next_level) {
        self.level += 1;
        self.max_health = self.level * 100;
        console.log('The Use gained a level!');
      }
      self.captured_tiles += 1;
      self.save();
      socket.emit('update_infos', self);
    });
  }


  UserSchema.statics.reinit_captured_tiles = function() {
    User.find({}, function(err, users) {
      for(var i = 0; i < users.length; i++) {
        var user = users[i];
        user.captured_tiles = 0;
        user.save();
      }
      console.log('Restarting a new Capture Tile Cycle for all Users');
    });
  }

  UserSchema.statics.check_can_afford = function(user_id, gold_amount, callback) {
    User.findOne({_id: user_id}, function(err, user) {
      if(!user)
        return;
      if(user.gold >= gold_amount) {
        user.gold -= gold_amount;
        user.save(function(err) {
          if(err) console.log(err);
          callback(user);
        });
      }
    });
  }

  UserSchema.statics.raise_health_routine = function() {
    console.log('Raising the health of users not fighting');
    User.find({is_fighting: false}, function(err, users) {

      users.forEach(function(user) {
        if(user.health < user.max_health){
          user.health += 5;
          if(user.health > user.max_health)
            user.health = user.max_health;
          user.save();
        }
      });
    });
  }


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