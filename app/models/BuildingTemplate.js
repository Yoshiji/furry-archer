module.exports = function (mongoose) {
  // Create Schema
  var BuildingTemplateSchema = mongoose.Schema({
    name: String,
    storage: Number,
    consommation: Number,
    price: Number,
    tile_size: Number,
  });

  BuildingTemplateSchema.statics.generate = function () {
    var buildings = [
      ["silo", 20, 20, 10, 1],
      ["barn", 50, 40, 25, 4],
      ["cold storage", 100, 0, 100, 6],
    ];

    for (var i = 0; i < buildings.length; i++) {
      BuildingTemplate.create(
        {
          name: buildings[i][0],
          storage: buildings[i][1],
          consommation: buildings[i][2],
          price: buildings[i][3],
          tile_size: buildings[i][4],
        },
        function (err, building_template) {
          if (err) console.log(err);
          else console.log("Creating BuildingTemplate", building_template);
        }
      );
    }
  };

  // Compile Model
  var BuildingTemplate = mongoose.model(
    "BuildingTemplate",
    BuildingTemplateSchema
  );
};
