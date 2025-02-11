// const mongoose = require("mongoose");

// const chatSchema = new mongoose.Schema(
//   {
//     bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The other participant
//     message: { type: String, trim: true },
//     media: { type: String }, // URL of image or file
//     location: {
//       latitude: { type: Number },
//       longitude: { type: Number },
//     },
//     status: {
//       type: String,
//       enum: ["Active", "Ended"], // To handle end chat feature
//       default: "Active",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Chat", chatSchema);



const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      },
    ], // Store both user and employee
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "senderModel",
          required: true,
        }, // Dynamic ref (User or Employee)
        senderModel: {
          type: String,
          required: true,
          enum: ["User", "Employee"],
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "receiverModel",
          required: true,
        },
        receiverModel: {
          type: String,
          required: true,
          enum: ["User", "Employee"],
        },
        message: { type: String, trim: true },
        media: { type: String }, // Image or file URL
        location: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
        timestamp: { type: Date, default: Date.now }, // Store time of each message
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Ended"], // To track chat status
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
