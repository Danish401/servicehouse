// const Chat = require("../models/Chat");

// // ✅ Send a new message (Text, Media, or Location)
// exports.sendMessage = async (req, res) => {
//   try {
//     const { bookingId, sender, receiver, message, media, location } = req.body;

//     const chat = new Chat({
//       bookingId,
//       sender,
//       receiver,
//       message,
//       media,
//       location,
//     });

//     await chat.save();
//     res.status(201).json({ success: true, chat });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };

// // ✅ Get chat messages for a specific booking ID
// exports.getChatByBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const chats = await Chat.find({ bookingId }).sort({ createdAt: 1 });
//     res.status(200).json({ success: true, chats });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat messages" });
//   }
// };

// // ✅ End chat session
// exports.endChat = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     await Chat.updateMany({ bookingId }, { $set: { status: "Ended" } });
//     res.status(200).json({ success: true, message: "Chat ended successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to end chat" });
//   }
// };

// // ✅ Resume chat session
// exports.resumeChat = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     await Chat.updateMany({ bookingId }, { $set: { status: "Active" } });
//     res.status(200).json({ success: true, message: "Chat resumed successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to resume chat" });
//   }
// };



const Chat = require("../models/Chat");

// ✅ Send a new message (Text, Media, or Location)
// exports.sendMessage = async (req, res) => {
//   try {
//     const { bookingId, sender, senderModel, receiver, receiverModel, message, media, location } = req.body;

//     // Check if a chat session exists for the bookingId
//     let chat = await Chat.findOne({ bookingId });

//     if (!chat) {
//       // If no chat exists, create a new chat session
//       chat = new Chat({
//         bookingId,
//         participants: [{ user: senderModel === "User" ? sender : null, employee: senderModel === "Employee" ? sender : null }],
//         messages: [],
//         status: "Active",
//       });
//     }

//     // Add new message to the existing chat
//     chat.messages.push({
//       sender,
//       senderModel,
//       receiver,
//       receiverModel,
//       message,
//       media,
//       location,
//     });

//     await chat.save();
//     res.status(201).json({ success: true, chat });
//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };
// exports.sendMessage = async (req, res) => {
//   try {
//     const { bookingId, sender, senderModel, receiver, receiverModel, message, location } = req.body;
//     const media = req.file ? `/uploads/${req.file.filename}` : null;  // ✅ Save file path

//     let chat = await Chat.findOne({ bookingId });

//     if (!chat) {
//       chat = new Chat({
//         bookingId,
//         participants: [{ user: senderModel === "User" ? sender : null, employee: senderModel === "Employee" ? sender : null }],
//         messages: [],
//         status: "Active",
//       });
//     }

//     chat.messages.push({
//       sender,
//       senderModel,
//       receiver,
//       receiverModel,
//       message,
//       media,
//       location,
//     });

//     await chat.save();
//     res.status(201).json({ success: true, chat });

//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };

const path = require("path");

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, sender, senderModel, receiver, receiverModel, message, location } = req.body;

    let mediaUrl = null;
    if (req.file) {
      mediaUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    let chat = await Chat.findOne({ bookingId });
    if (!chat) {
      chat = new Chat({
        bookingId,
        participants: [
          { user: senderModel === "User" ? sender : null, employee: senderModel === "Employee" ? sender : null }
        ],
        messages: [],
        status: "Active",
      });
    }

    const newMessage = {
      sender,
      senderModel,
      receiver,
      receiverModel,
      message,
      media: mediaUrl,
      location: location ? JSON.parse(location) : null,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.getChatByBooking = async (req, res) => {
    try {
      const { bookingId } = req.params;
  
      // Fetch chat session for this bookingId
      const chat = await Chat.findOne({ bookingId })
        .populate("messages.sender", "name") // Populate sender name
        .populate("messages.receiver", "name");
  
      if (!chat) {
        return res.status(404).json({ success: false, message: "No chat found for this booking" });
      }
  
      res.status(200).json({ success: true, chat });
    } catch (error) {
      console.error("❌ Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  };

  // ✅ End chat session
exports.endChat = async (req, res) => {
    try {
      const { bookingId } = req.params;
      const chat = await Chat.findOneAndUpdate({ bookingId }, { status: "Ended" }, { new: true });
  
      if (!chat) {
        return res.status(404).json({ success: false, message: "No active chat found" });
      }
  
      res.status(200).json({ success: true, message: "Chat ended successfully", chat });
    } catch (error) {
      console.error("❌ Error ending chat:", error);
      res.status(500).json({ error: "Failed to end chat" });
    }
  };
  
  // ✅ Resume chat session
  exports.resumeChat = async (req, res) => {
    try {
      const { bookingId } = req.params;
      const chat = await Chat.findOneAndUpdate({ bookingId }, { status: "Active" }, { new: true });
  
      if (!chat) {
        return res.status(404).json({ success: false, message: "No ended chat found" });
      }
  
      res.status(200).json({ success: true, message: "Chat resumed successfully", chat });
    } catch (error) {
      console.error("❌ Error resuming chat:", error);
      res.status(500).json({ error: "Failed to resume chat" });
    }
  };
  