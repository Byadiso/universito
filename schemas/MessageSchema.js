const mongoose = require('mongoose');
const crypto = require ('crypto');

const {ObjectId } = mongoose.Schema;

const messageSchema = new mongoose.Schema({

        sender: { type: ObjectId, ref: "User" },
        content : {type:String, trim:true},
        chat: { type: ObjectId, ref: "chat" },
        readBy: { type: ObjectId, ref: "User"}
    }, 
    { timestamps: true }
);


var Message = mongoose.model("Message", messageSchema);

module.exports = Message;