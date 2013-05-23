module.exports = function (mongoose) {

  // Create Schema
  var TileSchema = mongoose.Schema({
      x: Number,
      y: Number,
      type: String,
      owner_name: String
  });

  // Compile Model
  var User = mongoose.model('Tile', TileSchema);



}