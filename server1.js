

// let IO = require("socket.io")(port, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// IO.use((socket, next) => {
//   if (socket.handshake.query) {
//     let callerId = socket.handshake.query.callerId;
//     socket.user = callerId;
//     next();
//   }
// });

// IO.on("connection", (socket) => {
//   console.log(socket.user, "Connected");
//   socket.join(socket.user);

//   socket.on("makeCall", (data) => {
//     let calleeId = data.calleeId;
//     let sdpOffer = data.sdpOffer;

//     socket.to(calleeId).emit("newCall", {
//       callerId: socket.user,
//       sdpOffer: sdpOffer,
//     });
//   });

//   socket.on("answerCall", (data) => {
//     let callerId = data.callerId;
//     let sdpAnswer = data.sdpAnswer;

//     socket.to(callerId).emit("callAnswered", {
//       callee: socket.user,
//       sdpAnswer: sdpAnswer,
//     });
//   });

//   socket.on("IceCandidate", (data) => {
//     let calleeId = data.calleeId;
//     let iceCandidate = data.iceCandidate;

//     socket.to(calleeId).emit("IceCandidate", {
//       sender: socket.user,
//       iceCandidate: iceCandidate,
//     });
//   });
// });


// let port = process.env.PORT || 5000;



const mongoose = require("mongoose");
const IO = require("socket.io");
require("dotenv").config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

const User = require("./models/User"); // User schema
const Host = require("./models/Host"); // Host schema


let bindHost = process.env.HOST || "0.0.0.0";
let port = process.env.PORT || 2000;


let io = IO(port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory maps for users and hosts
const userSocketMap = new Map(); // Maps username -> socketId
const hostSocketMap = new Map(); // Maps hostname -> socketId

io.use(async (socket, next) => {
  const { username, hostname } = socket.handshake.query;

  try {
    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        socket.user = { username };
        return next();
      } else {
        return next(new Error("User not found"));
      }
    } else if (hostname) {
      const host = await Host.findOne({ hostname });
      if (host) {
        socket.user = { hostname };
        return next();
      } else {
        return next(new Error("Host not found"));
      }
    } else {
      return next(new Error("Invalid connection parameters"));
    }
  } catch (error) {
    return next(new Error("Database error: " + error.message));
  }
});

io.on("connection", (socket) => {
  const { username, hostname } = socket.user;

  if (username) {
    console.log(`User ${username} connected`);
    userSocketMap.set(username, socket.id); // Store in user map
  } else if (hostname) {
    console.log(`Host ${hostname} connected`);
    hostSocketMap.set(hostname, socket.id); // Store in host map
  }

  // Handle makeCall event
  socket.on("makeCall", async (data) => {
    const { hostname, sdpOffer } = data;

    const hostSocketId = hostSocketMap.get(hostname);
    if (hostSocketId) {
      socket.to(hostSocketId).emit("newCall", {
        callerUsername: username,
        sdpOffer: sdpOffer,
      });
    } else {
      console.log("Host not found or not connected");
    }
  });

  // Handle answerCall event
  socket.on("answerCall", async (data) => {
    const { username, sdpAnswer } = data;

    const userSocketId = userSocketMap.get(username);
    if (userSocketId) {
      socket.to(userSocketId).emit("callAnswered", {
        calleeHostname: hostname,
        sdpAnswer: sdpAnswer,
      });
    } else {
      console.log("User not found or not connected");
    }
  });

  // Handle IceCandidate event
  socket.on("IceCandidate", async (data) => {
    const { targetUsername, targetHostname, iceCandidate } = data;

    let targetSocketId = null;

    if (targetUsername) {
      targetSocketId = userSocketMap.get(targetUsername);
    } else if (targetHostname) {
      targetSocketId = hostSocketMap.get(targetHostname);
    }

    if (targetSocketId) {
      socket.to(targetSocketId).emit("IceCandidate", {
        sender: username || hostname,
        iceCandidate: iceCandidate,
      });
    } else {
      console.log("Target not found or not connected");
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (username) {
      userSocketMap.delete(username);
      console.log(`User ${username} disconnected`);
    } else if (hostname) {
      hostSocketMap.delete(hostname);
      console.log(`Host ${hostname} disconnected`);
    }
  });
});

console.log(`Socket.IO server running on ${bindHost}:${port}`);
