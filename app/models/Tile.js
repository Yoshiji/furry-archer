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

  TileSchema.methods.fertilize = function() {
    console.log('Fertilizing a Tile (+10%)');
    this.fertility += 10;
    if(this.fertility > 100) {
      this.fertility = 100;
      console.log('The fertility is at 100%');
    }
    this.save();
    return this;
  }

  TileSchema.methods.waterize = function() {
    console.log('Waterizing a Tile (+10%)');
    this.humidity += 10;
    if(this.humidity > 100) {
      this.humidity = 100;
      console.log('The humidity is at 100%');
    }
    this.save();
    return this;
  }

  TileSchema.methods.harvest = function() {
    console.log('Harvesting the Crop of this Tile');
    Crop.findOne({ _id: this.crop[0] }, function(err, crop) {
      if(err) { return; }
      if(crop.maturity > 80) {
        crop.remove();
      }
    });
    return this;
  }

  // Compile Model
  var Tile = mongoose.model('Tile', TileSchema);

}