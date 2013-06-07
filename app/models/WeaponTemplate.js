module.exports = function (mongoose) {

  // Create Schema
  var WeaponTemplateSchema = mongoose.Schema({
      name: String,
      power: Number,
      hit_ratio: Number,
      hits_per_second: Number,
      price: Number
  });

  // Compile Model
  var WeaponTemplate = mongoose.model('WeaponTemplate', WeaponTemplateSchema);
}