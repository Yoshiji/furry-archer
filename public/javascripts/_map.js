Map = {
  // ATTRIBUTES
  tiles: {},
  players: {},

  // METHODS
  handle_disaster: function (data) {
    $("#disaster").empty().append(data.name).show().fadeOut(2500);
  },

  update_player: function (data, socket) {
    this.players[data.user_id] = data;
    console.log("update_player #" + data.user_id);
  },

  update_weather: function (data) {
    $("#weather").empty().append(data.name);
    $("#weather").css({ "background-color": data.color });
  },

  update_stock_value: function (data) {
    $("#stock_value").empty().append(data.value);
  },

  update_stocks: function (data) {
    $(".stock.value")
      .empty()
      .append(data.current + " / " + data.maximum);
  },

  update_building: function (data) {
    switch (data.name) {
      case "silo":
        var silo = Crafty.e("Building").addComponent(data.name);
        iso.place(data.positions[0], data.positions[1], 15, silo);
        silo.x += 90;
        silo.y += 30;

        break;
      case "barn":
        var barn = Crafty.e("Building").addComponent(data.name);
        var x = data.positions[3][0];
        var y = data.positions[3][1];
        iso.place(x, y, 15, barn);
        barn.y -= 20;
        barn.x += 160;
        break;
      case "cold storage":
        break;
    }
  },

  update_actions: function (data, socket) {
    var actions = $("#actions").empty();
    for (var i = 0, len = data.length; i < len; i++) {
      var str =
        '<a href="#" class="action" data-action="' +
        data[i][0] +
        '">' +
        data[i][0];
      if (typeof data[i][1] != "undefined") str += " (" + data[i][1] + ")";
      str += "</a>";

      actions.append(str);
    }

    $(".action", actions).click(function (event) {
      event.preventDefault();
      socket.emit("action", {
        action: $(this).data("action"),
        x: user.pos_x,
        y: user.pos_y,
      });
      console.log(
        new Date().toLocaleTimeString() + ": ACTION: " + $(this).data("action")
      );
    });
  },

  attack_alert: function (data, socket) {
    var attacks = $("#attacks");
    var str =
      '<p class="attack-alert"> Attack from: ' +
      data.attacker +
      " at:" +
      data.x +
      "/" +
      data.y +
      "</p>";
    attacks.append(str);

    $(".attack-alert", attacks).click(function (event) {
      event.preventDefault();
      $(this).remove();
    });
  },

  update_weapons: function (data, socket) {
    var weapons = $("#weapons").empty();
    for (var i = 0, len = data.length; i < len; i++) {
      var str = '<a href="#" class="weapon';

      if (typeof data[i][3] != "undefined" && data[i][3] == true)
        str += " in-use";

      str += '" data-action="' + data[i][0] + '"';

      if (typeof data[i][2] != "undefined")
        str += ' data-id="' + data[i][2] + '"';

      str += ">" + data[i][0];

      if (typeof data[i][1] != "undefined" && data[i][1] != false)
        str += " (" + data[i][1] + ")";

      str += "</a>";

      weapons.append(str);
    }

    $(".weapon", weapons).click(function () {
      event.preventDefault();
      socket.emit("action", {
        action: $(this).data("action"),
        id: $(this).data("id"),
      });
      console.log(
        new Date().toLocaleTimeString() + ": ACTION: " + $(this).data("action")
      );
    });
  },

  update_infos: function (user) {
    var infos = $("#infos #old").empty();
    var data = [];
    var ignored_keys = [
      "__v",
      "email",
      "password",
      "_id",
      "pos_x",
      "pos_y",
      "username",
    ];
    var keys = Object.keys(user);
    $(".value.gold").empty().append(user.gold);
    $(".value.level").empty().append(user.level);
  },

  update_tile: function (data, socket) {
    var tile_settings = this.set_tile_settings(data);

    if (tile_settings) {
      if (
        data.type != "voided" &&
        data.type != "water" &&
        data.owner_name != "-1"
      ) {
        if (user.pos_x == data.x && user.pos_y == data.y) {
          Crafty(user.id).update_several_infos(tile_settings);
        }
        if (data.owner_name == user.username) data.type = "my_";
        else data.type = "others_";

        if (tile_settings.crop && tile_settings.crop[0]) {
          var maturity = tile_settings.crop[0].maturity || 0;
          var health =
            (tile_settings.fertility + tile_settings.humidity) / 2 || 0;

          if (maturity > 99) maturity = 99;
          if (health > 99) health = 99;

          maturity = maturity - (maturity % 20);
          health = health - (health % 20);

          data.type = data.type + maturity + "_" + health;
        } else {
          data.type += "grass";
        }
      }

      Crafty(tile_settings.id).sprite(
        tile_sprite_settings[data.type][0],
        tile_sprite_settings[data.type][1],
        tile_sprite_settings[data.type][2],
        tile_sprite_settings[data.type][3]
      );

      // ATTACK ANIMATION
      if (tile_settings.is_attacked) {
        console.log("ANIMATE -----------");
        Crafty(tile_settings.id)
          .stop()
          .animate("is_attacked", [
            [
              tile_sprite_settings[data.type][0],
              tile_sprite_settings[data.type][1],
            ],
            [
              tile_sprite_settings["is_attacked"][0],
              tile_sprite_settings["is_attacked"][1],
            ],
          ]);
        Crafty(tile_settings.id).stop().animate("is_attacked", 48, -1);
      } else {
        Crafty(tile_settings.id).stop().reset();
      }
    }
  },

  // GETTERs & SETTERs
  set_tile: function (data, socket) {
    var tile = Crafty.e("Tile").set_socket(socket);
    data.id = tile[0];

    tile.addComponent("tile_sprite");
    iso.place(data.x, data.y, 1, tile);
    this.update_tile(data, socket);
  },

  get_tile_settings: function (data, inputIsInPx) {
    var x = data.x;
    var y = data.y;
    if (inputIsInPx) {
      var pos = iso.px2pos(x, y);
      x = pos.x;
      y = pos.y;
    }
    var key = "x" + x + "y" + y;
    if (this.tiles[key]) return this.tiles[key];
    else return false;
  },

  set_tile_settings: function (data, inputIsInPx) {
    var x = data.x;
    var y = data.y;
    var tile_settings = this.get_tile_settings(data);

    if (tile_settings && tile_settings.id) {
      data.id = tile_settings.id;
    }

    if (inputIsInPx) {
      var pos = iso.px2pos(x, y);
      x = pos.left;
      y = pos.top;
    }
    var key = "x" + x + "y" + y;
    this.tiles[key] = data;
    return this.tiles[key];
  },

  // INIT METHODS
  init: function (socket) {
    Crafty.init(800, 600);
    this.init_scenes(socket);
    Crafty.scene("loading");
    this.init_sockets(socket);

    return this;
  },

  init_player: function (data, socket) {
    var player = (this.player = Crafty.e("Player").set_socket(socket));
    Crafty.addEvent(player, Crafty.stage.elem, "WalkingOnNewTile");
    iso.place(data.pos_x, data.pos_y, 20, player);
    Crafty.viewport.follow(player);
    player.x += 128 - 12;
    player.y += 74 - 16;
    data.pos_x = -10; //Workaround to trigger 'Moved' as soon as we first walk
    data.id = player[0];
    user = data;
    this.init_tiles_around_me(socket, player);
    this.update_infos(user);
    socket.emit("get_buildings");
  },

  init_tiles_around_me: function (socket, player) {
    area = iso.area();
    for (var y = area.y.start; y <= area.y.end; y++) {
      for (var x = area.x.start; x <= area.x.end; x++) {
        socket.emit("get_tile", { x: x, y: y });
      }
    }
    player.trigger("Moved", { x: player.x, y: player.y });
  },

  init_sockets: function (socket) {
    var self = this;
    var verbose = true;

    socket.on("update_tile", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_tile");
      self.update_tile(data, this);
    });

    socket.on("set_tile", function (data) {
      if (verbose) console.log(new Date().toLocaleTimeString() + ": set_tile");
      self.set_tile(data, this);
    });

    socket.on("set_player", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": set_player");
      self.init_player(data, this);
    });

    socket.on("update_player", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_player");
      self.update_player(data, this);
    });

    socket.on("update_actions", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_actions");
      self.update_actions(data, this);
    });

    socket.on("update_weapons", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_weapons");
      self.update_weapons(data, this);
    });

    socket.on("update_infos", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_infos");
      self.update_infos(data);
    });

    socket.on("update_stocks", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_stocks");
      self.update_stocks(data);
    });

    socket.on("update_weather", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_weather");
      self.update_weather(data);
    });

    socket.on("disaster", function (data) {
      if (verbose) console.log(new Date().toLocaleTimeString() + ": Disaster!");
      self.handle_disaster(data);
    });

    socket.on("update_tile_sprite", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_tile_sprite");
      self.update_tile_sprite(data, this);
    });

    socket.on("attack_alert", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": attack_alert");
      self.attack_alert(data, this);
    });

    socket.on("update_building", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_building");
      self.update_building(data);
    });

    socket.on("update_stock_value", function (data) {
      if (verbose)
        console.log(new Date().toLocaleTimeString() + ": update_stock_value");
      self.update_stock_value(data);
    });
  },

  init_scenes: function (socket) {
    Crafty.scene("loading", function () {
      var percents = Crafty.e("2D, DOM, Text")
        .attr({ w: 100, h: 20, x: 150, y: 140 })
        .text("0%")
        .css({ "text-align": "center" });

      Crafty.load(
        ["images/grasstile.png", "images/players.png"],
        function () {
          Crafty.scene("main");
        },
        function (e) {
          // in progress
          percents.text("" + e.percent + "%");
        }
      );
      Crafty.e("2D, DOM, Text")
        .attr({ w: 100, h: 20, x: 150, y: 120 })
        .text("Loading...")
        .css({ "text-align": "center" });
    });

    Crafty.scene("main", function () {
      Crafty.canvas.init();

      iso = Crafty.isometric.size(256);

      Crafty.viewport.init(800, 600);
      Crafty.viewport.mouselook(false);
      Crafty.viewport.clampToEntities = false;

      socket.emit("get_player");
    });
  },
};
