module.exports = function (mongoose) {

  // Create Schema
  var BuildingSchema = mongoose.Schema({
      name: String,
      storage: Number,
      consommation: Number,
      user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      positions: Array
  });

  BuildingSchema.statics.build = function(tile, building_name, socket) {
    if(tile.crop.length < 1 && tile.building.length < 1) {
      BuildingTemplate.findOne({name: building_name}, function(err, building_template) {
        if(err) { console.log(err); }

        switch(building_template.tile_size) {
          case 1:

            User.check_can_afford(socket.session.user._id, building_template.price, function(user) {
              socket.emit('update_infos', user);
              Building.create({
                name: building_template.name, storage: building_template.storage, 
                consommation: building_template.consommation, user: socket.session.user._id,
                positions: [tile.x, tile.y]
              }, function(err, building) {
                tile.building = building._id;
                tile.save();
                socket.emit('update_building', building);
                User.reload_stock(socket.session.user._id, socket);
              });
            });
            
            break;

          case 4:

            var cur_x = tile.x;
            var cur_y = tile.y;
            var x_is_impair = cur_x % 2;
            var y_is_impair = cur_y % 2;
            var in_x; 
            var in_y;
            if(!x_is_impair && !y_is_impair) {
              in_x = [cur_x];
              in_y = [cur_y-1, cur_y, cur_y+1];
              in_x2 = [cur_x+1];
              in_y2 = [cur_y];
            } else if(!x_is_impair && y_is_impair) {
              in_x = [cur_x+1];
              in_y = [cur_y-1, cur_y, cur_y+1];
              in_x2 = [cur_x];
              in_y2 = [cur_y];
            } else if(x_is_impair && y_is_impair) {
              in_x = [cur_x+1];
              in_y = [cur_y-1, cur_y, cur_y+1];
              in_x2 = [cur_x];
              in_y2 = [cur_y];
            } else if(x_is_impair && !y_is_impair) {
              in_x = [cur_x];
              in_y = [cur_y-1, cur_y, cur_y+1];
              in_x2 = [cur_x+1];
              in_y2 = [cur_y];
            } else {
              console.log('WEIRD! Should not happen', cur_x, cur_y);
            }
            var coords = [];
            for(var i=0; i<in_x.length; i++) {
              for(var j=0; j<in_y.length; j++) {
                coords.push( [ in_x[i], in_y[j] ] );
              }
            }
            for(var i=0; i<in_x2.length; i++) {
              for(var j=0; j<in_y2.length; j++) {
                coords.push( [ in_x2[i], in_y2[j] ] );
              }
            }

            Tile.find({ $or: [ {x: {$in: in_x }, y: {$in: in_y } }, {x: {$in: in_x2}, y: {$in: in_y2} } ], owner_name: socket.session.user.username }, 
              function(err, tiles) {
                if(tiles.length > 3) {

                  console.log(coords);
                  Building.findOne({ positions: { $in: coords  } }, function(err, building) {
                    if(err) {console.log(err)}

                    if(!building) {
                      User.check_can_afford(socket.session.user._id, building_template.price, function(user) {
                        socket.emit('update_infos', user);
                        Building.create({
                          name: building_template.name, storage: building_template.storage, 
                          consommation: building_template.consommation, user: socket.session.user._id,
                          positions: coords
                        }, function(err, building) {
                          tiles.forEach(function(tile) {
                            tile.building = building._id;
                            tile.save();
                          });
                          socket.emit('update_building', building);
                          User.reload_stock(socket.session.user._id, socket);
                        });
                      });
                    }
                  });
                  
                }
              }
            );

            break;

          case 6:
            break;
        }
      });
   }
  }

  // Compile Model
  var Building = mongoose.model('Building', BuildingSchema);
}