const mongoose = require('mongoose');
const crypto = require ('crypto');


const {ObjectId } = mongoose.Schema;


const postSchema = new mongoose.Schema({
    content:{ type:String, trim:true},
    postedBy:{ type: ObjectId,  ref: "User" },
    likes: [{ type: ObjectId, ref: "User" }],
    retweetUsers: [{ type: ObjectId, ref: "User" }],
    retweetData: { type: ObjectId, ref: "Post" },
    replyTo: { type: ObjectId, ref: "Post" },
    pinned: Boolean   
    }, 
    { timestamps: true }
);


var Post = mongoose.model("Post", postSchema);

module.exports = Post;