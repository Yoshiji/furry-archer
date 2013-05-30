module.exports = function (mongoose) {

  // Create Schema
  var CropSchema = mongoose.Schema({
      name: String,
      maturity: Number,
      decay_time: Number,
      productivity: Number,
      storability: Number,
      seed_price: Number,
      health: Number
  });

  CropSchema.methods.reload_maturity = function(self, socket) {
    self.maturity += 10;
    if(self.maturity > 100) {
      self.maturity = 100;
      console.log("The crop is ready: maturity = 100, clearing the Interval");
      clearInterval(this);
      setTimeout(self.withered, self.decay_time*1000, self, socket);
      // TODO send a sync_tile or something
    }
    self.save();
  }

  CropSchema.methods.withered = function(self, socket) {
    console.log("normaly remove");
    self.remove();
    // TODO send a sync_tile or something
  }

  // Compile Model
  var Crop = mongoose.model('Crop', CropSchema);
}