module.exports = function (mongoose) {

  // Create Schema
  var SettingsSchema = mongoose.Schema({
    ratio_level_tile: Number, // user.level * ratio_level_tile + offset_level_tile
    offset_level_tile: Number,
    cycle_duration: Number,
    tiles_to_next_level: Number,
    gold_amount_at_starting: Number
  });

  // Compile Model
  var Settings = mongoose.model('Settings', SettingsSchema);
  
}