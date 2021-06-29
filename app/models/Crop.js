module.exports = function (mongoose) {
  var CropSchema = mongoose.Schema({
    name: String,
    maturity: Number,
    decay_time: Number,
    productivity: Number,
    storability: Number,
    seed_price: Number,
    is_attacked: Boolean,
  });

  CropSchema.methods.reload_maturity_routine = function (
    self,
    callback,
    kill_interval,
    cb_update_actions
  ) {
    Tile.findOne({ crop: self._id }, function (err, tile) {
      if (!tile) {
        kill_interval();
        console.log("NO TILE FOUND");
        return;
      }

      tile.fertility -= 5;
      if (tile.fertility < 0) {
        tile.fertility = 0;
      }
      tile.humidity -= 5;
      if (tile.humidity < 0) {
        tile.humidity = 0;
      }
      tile.save();

      var old_maturity = self.maturity - (self.maturity % 20);
      self.maturity += 10;

      if (self.maturity >= 100) {
        kill_interval();
        self.maturity = 100;
        self.save();
        setTimeout(
          Crop.withered,
          self.decay_time * 1000,
          self._id,
          tile._id,
          callback,
          cb_update_actions
        );
        User.findOne(
          { username: tile.owner_name, pos_x: tile.x, pos_y: tile.y },
          function (err, user) {
            if (user) {
              cb_update_actions(tile);
            }
          }
        );
      } else {
        self.save();
      }

      if (old_maturity != self.maturity - (self.maturity % 20)) {
        callback(tile);
      }
    });
  };

  CropSchema.statics.withered = function (
    crop_id,
    tile_id,
    callback,
    cb_update_actions
  ) {
    Tile.update({ crop: crop_id }, { $pull: { crop: crop_id } }).exec();
    Crop.remove({ _id: crop_id }).exec();

    Tile.findOne({ _id: tile_id }, function (err, tile) {
      callback(tile);
      User.findOne(
        { username: tile.owner_name, pos_x: tile.x, pos_y: tile.y },
        function (err, user) {
          if (user) cb_update_actions(tile);
        }
      );
    });
  };

  var Crop = mongoose.model("Crop", CropSchema);
};
