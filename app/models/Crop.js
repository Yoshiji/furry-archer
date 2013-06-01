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

    Tile.findOne({crop: self._id}, function(err, tile) {
      if(err){console.log(err);return;}
      var old_mat = self.maturity;
      self.maturity += 10;

      if(self.maturity > 100) { // Starts withering
        self.maturity = 100;
        console.log("The crop is ready: maturity = 100, clearing the Interval");
        clearInterval(this);
        setTimeout(self.withered, self.decay_time*1000, self, socket);
        // TODO send a sync_tile or something

      } else if(self.maturity > 80 && old_mat <= 80) { // Mature Plant
        socket.emit('update_tile_sprite', {x: tile.x, y: tile.y, sprite_name: 'my_mature_plants_good'});
      } else if(self.maturity > 60 && old_mat <= 60) { // Plant
        socket.emit('update_tile_sprite', {x: tile.x, y: tile.y, sprite_name: 'my_plants_good'});
      } else if(self.maturity > 40 && old_mat <= 40) { // Little Plant
        socket.emit('update_tile_sprite', {x: tile.x, y: tile.y, sprite_name: 'my_little_plants_good'});
      } else if(self.maturity > 20 && old_mat <= 20) { // Seedlings
        socket.emit('update_tile_sprite', {x: tile.x, y: tile.y, sprite_name: 'my_seedlings_good'});
      } else if(self.maturity > 0 && old_mat < 20) { // Seeded
        socket.emit('update_tile_sprite', {x: tile.x, y: tile.y, sprite_name: 'my_seeded_good'});
      }
   
      self.save();
    });
  }

  CropSchema.methods.withered = function(self, socket) {
    console.log('The crop should be removed (withered).');
    //self.remove();//Raises an Error!
  }

  // Compile Model
  var Crop = mongoose.model('Crop', CropSchema);
}