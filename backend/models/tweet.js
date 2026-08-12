import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, default: "" },
  image: { type: String, default: null },
  
  // Interaction Fields
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  retweets: { type: Number, default: 0 },
  retweetedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: Number, default: 0 },

  // Audio Tweet Additions
  mediaType: { type: String, enum: ["text", "image", "video", "audio"], default: "text" },
  audioUrl: { type: String, default: null },
  audioDuration: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const Tweet = mongoose.models.Tweet || mongoose.model("Tweet", tweetSchema);
export default Tweet;