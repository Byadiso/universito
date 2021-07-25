const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const  User = require('../../schemas/UserSchema');
const  Chat = require('../../schemas/ChatSchema');
const  Message = require('../../schemas/MessageSchema');
const  Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/', async(req,res, next)=>{ 
     console.log(req.body.content +" and chat Id is " + req.body.chatId )  
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
    .then( async message =>{
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

