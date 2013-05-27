module.exports = function (mongoose) {

  // Create Schema
  var TileSchema = mongoose.Schema({
      x: Number,
      y: Number,
      type: String,
      owner_name: String,
      humidity: Number,
      fertility: Number,
      crops : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }]
  });

  // Compile Model
  var User = mongoose.model('Tile', TileSchema);

}