const express = require('express');
const mongoose  = require('mongoose');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require ("bcrypt");
const  User = require('../schemas/UserSchema');
const  Chat = require('../schemas/ChatSchema');
const session = require('express-session');

const router = express.Router();

router.get('/',(req,res, next)=>{ 
    var payload =  {
    pageTitle:"inbox ",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    
};

    res.status(200).render("inboxPage", payload);
});


router.get('/',(req,res, next)=>{ 
    var payload =  {
    pageTitle:"new message ",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    
};
    res.status(200).render("newMessage", payload);
});


router.get('/:chatId', async(req,res, next)=>{ 

    var payload =  {
    pageTitle:"Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
       
};

    var userId = req.session.user;
    var chatId = req.params.chatId;
    var isValidId = mongoose.isValidObjectId(chatId)

if(!isValidId){
    payload.errorMessage = "chat does not exist or you do not have permisison to view it "
    return res.status(200).render("chatPage", payload);
}   

    var chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId }}})
    .populate("users");

    if(chat == null) {
        //check if chat id is really user id
        var userFound  = await User.findById(chatId)
        if (userFound == null ){
            // get chat using user id 
           chat = await getChatByUserId(userFound._id, userId);
        }
    }

    if(chat == null){
        payload.errorMessage = "chat does not exist or you do not have permisison to viw it "
    } else {
        payload.chat = chat
    }


    res.status(200).render("chatPage", payload);
});


function getChatByUserId(userLoggedInId, otherUserId){
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2, 
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId)}},                
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId)}}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    },    
    {
        new: true,
        upsert: true
    })
    .populate("users");

}

    
module.exports = router;

