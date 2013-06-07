module.exports = function (mongoose) {

  // Create Schema
  var WeaponSchema = mongoose.Schema({
      name: String,
      power: Number,
      hit_ratio: Number,
      hits_per_second: Number,
      price: Number,
      is_in_use:  Boolean
  });

  // Compile Model
  var Weapon = mongoose.model('Weapon', WeaponSchema);
}