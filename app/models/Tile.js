module.exports = function (mongoose) {

  // Create Schema
  var TileSchema = mongoose.Schema({
      x: Number,
      y: Number,
      type: String,
      owner_name: String,
      humidity: Number,
      fertility: Number,
      is_attacked: Boolean,
      crop: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }]
  });

  TileSchema.methods.health = function() {
    return (this.fertility + this.humidity) / 2;
  }

  TileSchema.methods.fertilize = function() {
    this.fertility += 10;
    if(this.fertility > 100) {
      this.fertility = 100;
      console.log('The fertility is at 100%');
    }
    this.save();
    return this;
  }

  TileSchema.methods.waterize = function() {
    this.humidity += 10;
    if(this.humidity > 100) {
      this.humidity = 100;
      console.log('The humidity is at 100%');
    }
    this.save();
    return this;
  }

  TileSchema.methods.harvest_and_sell = function(user_id, tile, cb_update_infos, cb_update_tile) {
    Crop.findOne({ _id: tile.crop[0] }, function(err, crop) {
      if(err || !crop) { return; }
      if(crop.maturity > 80) {
        var health = tile.health();
        var productivity = crop.productivity;
        var gold_gained = Math.ceil((health / 100 * productivity) || 1);
        console.log('Harvesting a mature plant for GOLD: ' + gold_gained.toString());
        User.findOne({_id: user_id}, function(err, user) {
          user.gold += gold_gained;
          user.save(function(err) {
            cb_update_infos(user);
          });
        });
        Tile.update({_id: tile._id}, { $pull: { crop: tile.crop[0] } }, {}, function(err) {
          Tile.findOne({_id: tile._id}, function(err, tile) {
            cb_update_tile(tile);
          });
        });
        Crop.remove({_id: tile.crop[0]}).exec();
      }
    });
  }

  TileSchema.statics.raise_fertility_routine = function() {
    console.log('Raising the Fertility periodically');
    
    Tile.find({crop: {$size: 0}}, function(err, tiles) {
      tiles.forEach(function(tile) {
        if(tile.fertility < 100)        
          tile.fertility += 1;
          tile.save();
      });
    });
  }

  TileSchema.statics.raise_humidity_routine = function() {
    console.log('Raising the Humidity periodically');
    
    Tile.find({}, function(err, tiles) {
      tiles.forEach(function(tile) {
        if(tile.humidity < 100)
          tile.humidity += 1;
          tile.save();
      });
    });
  }

  TileSchema.statics.generate = function () {
    var map_size = 20;
    var bands = [ [1, 45], [45, 75], [75, 110], [45, 75], [1, 45] ];

    for(var i = 0; i < map_size; i++) {
      var current_band = bands[i%5];

      for(var j = 0; j < map_size; j++) {
        var humidity_rand = Math.floor(Math.random()*100) + 1; 
        var fertility_rand = Math.floor(Math.random()*(current_band[1]-current_band[0])) + current_band[0];
        
        if(fertility_rand > 100) {
          var type = 'water';
        } else {
          var type = 'grass';
        }                

        var attributes = { x: i, 
            y: j, 
            type: type, 
            owner_name: -1, 
            humidity: humidity_rand,
            fertility: fertility_rand,
          }

        Tile.create( attributes, function (err, tile) {
            if(tile) { 
              console.log("Tile created: { x: "+tile.x+", y: "+tile.y+", type: "+tile.type+", fertility: "+tile.fertility+", humidity: "+tile.humidity+" }"); 
            }
            if(err) { console.log(err); }
          }
        );
      }
    }
  }


  // Compile Model
  var Tile = mongoose.model('Tile', TileSchema);

}