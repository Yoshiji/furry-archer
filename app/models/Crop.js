module.exports = function (mongoose) {

  // Create Schema
  var CropSchema = mongoose.Schema({
      name: String,
      maturation_time: Number,
      decay_time: Number,
      productivity: Number,
      storability: Number,
      seed_price: Number,
      health: Number
  });

  // Compile Model
  var Crop = mongoose.model('Crop', CropSchema);
}