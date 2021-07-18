const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest:"uploads/" });
const path = require("path");
const fs = require("fs");

const  User = require('../../schemas/UserSchema');
const  Post = require('../../schemas/PostSchema');
const  Chat = require('../../schemas/ChatSchema');
const  Message = require('../../schemas/MessageSchema');
const  Notification = require('../../schemas/NotificationSchema');

const router = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));


router.post('/', async(req,res, next)=>{    
    if(!req.body.content || req.body.chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender:req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId,     
    };

    Message.create(newMessage)
    .then( async message=>{
        message = await message.populate("sender").execPopulate();
        message = await message.populate("chat").execPopulate();
        message = await User.populate(message, { path: "chat.users" });


        var chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        .catch(error =>console.log(error));

        insertNotifications(chat , message);

        res.status(200).send(message);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(4004)
    })
 });


 function insertNotifications(chat , message){
     chat.users.forEach(userId=> {
         if(userId == message.sender._id.toString()) return ;

         Notification.insertNotifications(userId, message.sender._id, "newMessage",message.chat._id)
     })

 }

 
module.exports = router;

