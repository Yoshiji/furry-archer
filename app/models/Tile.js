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

  TileSchema.statics.raise_fertility = function() {
    console.log('Raising fertility as set by the Interval');
    
    Tile.find({crop: {$size: 0}}, function(err, tiles) {
      tiles.forEach(function(tile) {

        if(tile.fertility < 100) {          
          tile.fertility += 1;
          tile.save();
        }
      });
    });
  }

  // Compile Model
  var Tile = mongoose.model('Tile', TileSchema);

}