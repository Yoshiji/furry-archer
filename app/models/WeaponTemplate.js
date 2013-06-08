module.exports = function (mongoose) {

  // Create Schema
  var WeaponTemplateSchema = mongoose.Schema({
      name: String,
      power: Number,
      hit_ratio: Number,
      hits_per_second: Number,
      price: Number
  });

  WeaponTemplateSchema.statics.generate = function () {
    var init_weapon_templates = ['AK 47', 'Chainsaw', 'Baseball Bat'];

    for( var i = 0; i < init_weapon_templates.length; i++ ) {
      WeaponTemplate.create(
      { name: init_weapon_templates[i],
        power: 10,
        hit_ratio: 3,
        hits_per_second: 2,
        price: 0
      }, function (err, weapon_template) {
        if(err)
          console.log(err); 
        else
          console.log("creating weapon template: ", weapon_template); 
      });
    }
  }

  // Compile Model
  var WeaponTemplate = mongoose.model('WeaponTemplate', WeaponTemplateSchema);
}