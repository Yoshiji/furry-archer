module.exports = function (mongoose) {

  // Create Schema
  var CropTemplateSchema = mongoose.Schema({
      name: String,
      maturation_time: Number,
      decay_time: Number,
      productivity: Number,
      storability: Number,
      seed_price: Number
  });

  // Compile Model
  var CropTemplate = mongoose.model('CropTemplate', CropTemplateSchema);
}