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
      console.log('Routine: new Capture Tile Cycle for all Users');
    });
  }

  UserSchema.statics.reload_stock = function(user_id, socket) {
    User.findOne({_id: user_id}, function(err, user) {
      if(!user || err) {console.log(err,"ERROR check can store"); return;}

      Building.find({user: user_id}, function(err, buildings) {
        if(err) {console.log(err);}

        var max_capacity = 0;
        buildings.forEach(function(building) {
          max_capacity += building.storage;
        });

        StoredCrop.find({user: user_id, dead_at: { $gt: new Date() }}, function(err, crops) {
          if(err) {console.log(err);}

          var current_stock = 0;
          crops.forEach(function(stored_crop) {
            current_stock += stored_crop.quantity;
          });

          socket.emit('update_stocks', {current: current_stock, maximum: max_capacity});
        });

      });
    });
  }

  UserSchema.statics.check_can_afford = function(user_id, gold_amount, callback) {
    User.findOne({_id: user_id}, function(err, user) {
      if(!user || err) {console.log(err,"ERROR check can afford"); return;}
      if(user.gold >= gold_amount) {
        user.gold -= gold_amount;
        user.save(function(err) {
          if(err) console.log(err);
          callback(user);
        });
      }
    });
  }

  UserSchema.statics.sell_stored_crops = function(user_id, callback) {
    User.findOne({_id: user_id}, function(err, user) {
      if(!user || err) {console.log(err,"ERROR sell stored crops"); return;}

      StoredCrop.find({user: user_id}, function(err, stored_crops) {
        var amount = 0;
        stored_crops.forEach(function(stored_crop) {
          amount += stored_crop.quantity;
        });
        amount = Math.round(amount);
        if(amount > 0) {
          var gold_gained = UTILS.Timeouts.CURRENT_STOCK_VALUE * amount;
          user.gold += Math.round(gold_gained);
          user.save();
          callback(user);
          StoredCrop.remove({user: user_id}).exec();
        }
      })
    })
  }

  UserSchema.statics.check_can_store = function(user_id, qty, callback) {
    User.findOne({_id: user_id}, function(err, user) {
      if(!user || err) {console.log(err,"ERROR check can store"); return;}

      Building.find({user: user_id}, function(err, buildings) {
        if(err) {console.log(err);}

        var max_capacity = 0;
        buildings.forEach(function(building) {
          max_capacity += building.storage;
        });

        StoredCrop.find({user: user_id, dead_at: { $gt: new Date() }}, function(err, crops) {
          if(err) {console.log(err);}

          var current_stock = 0;
          crops.forEach(function(stored_crop) {
            current_stock += stored_crop.quantity;
          });

          if(current_stock+qty <= max_capacity) {
            callback(user);
          } else {
            console.log('Max capacity reached!')
          }
        });
      });
    });
  }

  UserSchema.statics.raise_health_routine = function() {
    console.log('Routing: Raising the health of users not fighting');
    // TODO change 100 to the max health they can have depending on their level
    User.find({is_fighting: false}, function(err, users) {
      users.forEach(function(user) {
        if(user.health < 100)
          user.health += 5;
          user.save();
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