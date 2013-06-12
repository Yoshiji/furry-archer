module.exports = function (mongoose) {

  // Create Schema
  var BuildingTemplateSchema = mongoose.Schema({
      name: String
  });

  // Compile Model
  var BuildingTemplate = mongoose.model('BuildingTemplate', BuildingTemplateSchema);
}