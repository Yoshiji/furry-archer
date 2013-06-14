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


  CropTemplateSchema.statics.generate = function() {
    var init_crop_templates = ['tomato', 'corn', 'cereal'];
    
    for( var i = 0; i < init_crop_templates.length; i++ ) {
      CropTemplate.create(
      { name: init_crop_templates[i],
        maturation_time: 3,
        decay_time: 10*(i+1),
        productivity: 5*i,
        storability: 15 + i*10,
        seed_price: i*2
      }, function (err, crop_template) {
        if(err)
          console.log(err); 
        else
          console.log("creating crop template: ", crop_template); 
      });
    }
  }

  // Compile Model
  var CropTemplate = mongoose.model('CropTemplate', CropTemplateSchema);
}