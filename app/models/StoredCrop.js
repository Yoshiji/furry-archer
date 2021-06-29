module.exports = function (mongoose) {
  // Create Schema
  var StoredCropSchema = mongoose.Schema({
    quantity: Number,
    dead_at: { type: Date, default: Date.now },
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  });

  StoredCropSchema.statics.destroy_rotten_crop_routine = function (io) {
    StoredCrop.remove({ dead_at: { $lt: new Date() } }).exec();
    io.sockets.clients().forEach(function (socket) {
      console.log("Routine: Destroying rotten crop");
      if (socket.session && socket.session.user)
        User.reload_stock(socket.session.user._id, socket);
    });
  };

  // Compile Model
  var StoredCrop = mongoose.model("StoredCrop", StoredCropSchema);
};
