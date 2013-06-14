module.exports = function (mongoose) {

  // Create Schema
  var BuildingSchema = mongoose.Schema({
      name: String,
      storage: Number,
      consommation: Number,
      user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      positions: Array
  });

  // Compile Model
  var Building = mongoose.model('Building', BuildingSchema);
}