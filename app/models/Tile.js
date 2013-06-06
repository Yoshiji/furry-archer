module.exports = function (mongoose) {

  // Create Schema
  var TileSchema = mongoose.Schema({
      x: Number,
      y: Number,
      type: String,
      owner_name: String,
      humidity: Number,
      fertility: Number,
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

  TileSchema.methods.harvest_and_sell = function(socket, tile) {
    Crop.findOne({ _id: tile.crop[0] }, function(err, crop) {
      if(err) { return; }
      if(crop.maturity > 80) {
        var health = tile.health();
        var productivity = crop.productivity;
        var gold_gained = Math.round(health / 100 * productivity);
        console.log('Harvesting a mature plant for GOLD: ' + gold_gained.toString());
        if(gold_gained > 0) {
          User.findOne({_id: socket.session.user._id}, function(err, user) {
            user.gold += gold_gained;
            user.save(function(err) {
              socket.emit('update_infos', user);
            });
          });
        }

        crop.remove();
      }
    });
    return this;
  }

  // Compile Model
  var Tile = mongoose.model('Tile', TileSchema);

}