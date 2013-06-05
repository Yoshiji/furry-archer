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

  CropSchema.methods.reload_maturity = function(self, tile, callback) {
    var old_mat = self.maturity;
    self.maturity += 10;

    if(self.maturity >= 100) { // Starts withering
      clearInterval(this);
      self.maturity = 100;
      console.log("The crop is ready: maturity = 100, clearing the Interval");
      setTimeout(self.withered, self.decay_time*1000, self, tile, callback);
    }

    self.save();
    return callback();
  }

  CropSchema.methods.withered = function(self, tile, callback) {
    console.log('The crop should be removed (withered)');

    tile.crop = null;
    tile.save();
    return callback();
  }

  // Compile Model
  var Crop = mongoose.model('Crop', CropSchema);
}