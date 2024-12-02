const mongoose = require('mongoose');

const HostSchema = new mongoose.Schema({

  full_name: {
    type: String,
  },
  hostname: {
    type: String,
    unique: true,
    required: true
  },
  agency_id: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
  },
  gender: {
    type: String,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  Date_of_Birth: {
    type: Date,
  },
  LookingFor: {
    type: String,
  },
  languages: {
    type: [String],
  },
  interest: {
    type: [String],
  },
  age_range: {
    type: String,
  },
  requestStatus: {
    type: String,
    enum: ['waiting', 'Allowed', 'Rejected'],
  },
  device_tokens: {
    type: [String],
  },
  bio: {
    type: String,
  },
  device_id: {
    type: String,
  },
  social_id: {
    type: String,
  },
  device_ip: {
    type: String,
  },
  coins: { 
    type: Number, 
    default: 0 },

  profile_url: {
    type: String,
  },
  rank: {
    type: Number, 
  },
  audio_rate: {
    type: Number, 
  },
  video_rate: {
    type: Number, 
  },
  chat_rate: {
    type: Number, 
  },
  rating: {
    type: String, 
  },
  followers: {
    type:Number,
  },
  followers_list: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  
  }]
}, { timestamps: true });

const Host = mongoose.model('Host', HostSchema);

module.exports = Host;
