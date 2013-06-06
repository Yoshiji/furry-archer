module.exports = function (mongoose) {

  // Create Schema
  var CropSchema = mongoose.Schema({
      name: String,
      maturity: Number,
      decay_time: Number,
      productivity: Number,
      storability: Number,
      seed_price: Number
  });

  CropSchema.methods.reload_maturity = function(self, callback, kill_interval) {
    Tile.findOne({crop: self._id}, function(err, tile) {
      if(!tile) { console.log('NO TILE FOUND'); return; }

      tile.fertility -= 5;
      if(tile.fertility < 0) { tile.fertility = 0 }
      tile.humidity -= 5;
      if(tile.humidity < 0) { tile.humidity = 0 }
      tile.save();

      var old_maturity = self.maturity - (self.maturity % 20);
      self.maturity += 10;

      if(self.maturity >= 100) { // Starts withering
        kill_interval();
        self.maturity = 100;
        self.save();
        setTimeout(Crop.withered, self.decay_time*100, self._id, callback);

      } else {
        self.save();
      }

      if(old_maturity != (self.maturity - (self.maturity % 20))) {
        return callback();
      }
    });
  }

  CropSchema.statics.withered = function(crop_id, callback) {
    Tile.update({crop: crop_id}, { $pull: { crop: crop_id } });
    Crop.remove({_id: crop_id});

    return callback();
  }

  // Compile Model
  var Crop = mongoose.model('Crop', CropSchema);
}