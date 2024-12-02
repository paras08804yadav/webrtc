const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    roomId: { 
        type: String, 
        required: true 
    },  // Unique room for user-host chat (userId + hostId)
    
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },  
    
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },  
    
    messageType: { 
        type: String, 
        enum: ['text', 'audio'], 
        required: true 
    }, 
    
    message: { 
        type: String, 
        required: function() {
            return this.messageType === 'text';
        }
    }, 
    
    mediaUrl: { 
        type: String, 
        required: function() {
            return this.messageType === 'audio';
        }
    }, 
    
    ipAddress: { 
        type: String 
    }, 
    
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    
    isOffline: { 
        type: Boolean, 
        default: false // True if message is sent when receiver is offline
    }
});

module.exports = mongoose.model('Message', MessageSchema);
