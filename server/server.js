const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// Models
const User = require("./models/User");
const Message = require("./models/Message");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store Online Users
const onlineUsers = {};

// ================= MIDDLEWARE =================

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

// ================= API ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// ================= HOME =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "login.html"));
});



// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {

    console.log("✅ User Connected:", socket.id);

    // ================= USER JOIN =================

    socket.on("join", async (userId) => {

        onlineUsers[userId] = socket.id;

        await User.findByIdAndUpdate(userId, {
            online: true
        });

        io.emit("userStatus", {
            userId,
            online: true
        });

        console.log("🟢 User Joined:", userId);
        console.log("Online Users:", onlineUsers);

    });

    // ================= TYPING =================

    socket.on("typing", (data) => {

        console.log("⌨️ Typing:", data);

        const receiverSocket = onlineUsers[data.receiver];

        console.log("Receiver Socket:", receiverSocket);

        if (receiverSocket) {

            io.to(receiverSocket).emit("typing", {
                sender: data.sender
            });

            console.log("✅ Typing event sent");

        } else {

            console.log("❌ Receiver socket not found");

        }

    });

    // ================= STOP TYPING =================

    socket.on("stopTyping", (data) => {

        console.log("🛑 Stop Typing:", data);

        const receiverSocket = onlineUsers[data.receiver];

        console.log("Receiver Socket:", receiverSocket);

        if (receiverSocket) {

            io.to(receiverSocket).emit("stopTyping", {
                sender: data.sender
            });

            console.log("✅ StopTyping event sent");

        } else {

            console.log("❌ Receiver socket not found");

        }

    });
    // ================= SEND MESSAGE =================

    socket.on("sendMessage", async (data) => {

        try {

            const message = await Message.create({
                sender: data.sender,
                receiver: data.receiver,
                text: data.text || "",
                file: data.file || "",
                fileType: data.fileType || "",
                status: "sent"
            });


            // Sender gets ✓
            socket.emit("messageSaved", message);

            const receiverSocket = onlineUsers[data.receiver];

            if (receiverSocket) {

                message.status = "delivered";

                await message.save();

                // Receiver gets message
                io.to(receiverSocket).emit("receiveMessage", message);

                // Sender gets ✓✓
                socket.emit("messageDelivered", message);

                console.log("✅ Message Delivered");

            }

            else {

                console.log("📩 Receiver Offline");

            }

        }

        catch (err) {

            console.log("Socket Error:", err.message);

        }

    });

    // ================= MESSAGE READ =================

    socket.on("messageRead", async (messageId) => {

        try {

            const message = await Message.findById(messageId);

            if (!message) return;

            message.status = "read";

            await message.save();

            const senderSocket = onlineUsers[message.sender.toString()];

            if (senderSocket) {

                io.to(senderSocket).emit("messageRead", message);

            }

            console.log("👀 Message Read:", messageId);

        }

        catch (err) {

            console.log(err);

        }

    });
    // ================= DISCONNECT =================

    socket.on("disconnect", async (reason) => {

        console.log("❌ Socket Disconnected:", socket.id);
        console.log("Reason:", reason);

        for (const userId in onlineUsers) {

            if (onlineUsers[userId] === socket.id) {

                delete onlineUsers[userId];

                await User.findByIdAndUpdate(userId, {
                    online: false,
                    lastSeen: new Date()
                });

                io.emit("userStatus", {
                    userId,
                    online: false
                });

                console.log("🔴 User Left:", userId);
                console.log("Online Users:", onlineUsers);

                break;

            }

        }

    });

});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});