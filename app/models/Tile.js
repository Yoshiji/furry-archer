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
    var self = this;
    User.findOne({username: self.owner_name}, function(err, user) {
      if(user.gold < 1) {
        console.log('Trying to fertilize but not enough GOLD!');
        return self;
      } else {
        console.log('Fertilizing a Tile (+10%), costs 3 Golds');
        user.gold -= 3;
        user.save();
        self.fertility += 10;
        if(self.fertility > 100) {
          self.fertility = 100;
        }
        self.save();
      }
    });
    return self;
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

  TileSchema.methods.harvest = function(socket) {
    console.log('Harvesting the Crop of this Tile');
    Crop.findOne({ _id: this.crop[0] }, function(err, crop) {
      if(err) { return; }
      if(crop.maturity > 80) {
        crop.remove();
        UTILS.Map.update_actions.level0(socket);
      }
    });
    return this;
  }

  // Compile Model
  var Tile = mongoose.model('Tile', TileSchema);

}