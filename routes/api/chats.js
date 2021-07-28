const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest:"uploads/" });
const path = require("path");
const fs = require("fs");

const  User = require('../../schemas/UserSchema');
const  Chat = require('../../schemas/ChatSchema');
const  Message = require('../../schemas/MessageSchema');


const router = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));





 
router.get('/:chatId', async(req,res, next)=>{ 
    var chatId = req.params.chatId

    Chat.findOne({_id: chatId, users: { $elemMatch : {$eq: req.session.user._id }}})
    .populate("users")
    .then(results => res.status(200).send(results))
    .catch(error =>{
        console.log(error);
        res.sendStatus(400)
    })    
 });

router.post('/', async(req,res, next)=>{    
    if(!req.body.users){
        console.log("users param not sent to the server with request ");
        return res.sendStatus(400);
    }
    var users= JSON.parse(req.body.users);
    
    if(users.length == 0){
        console.log("users array is empty ");
        return res.sendStatus(400);
    }

    users.push(req.session.user);
    var chatData = {
        users: users,
        isGroupChat: true
    };

    Chat.create(chatData)
    .then(chats=>res.status(200).send(chats))
    .catch(error => {
        console.log(error);
        res.sendStatus(4004)
    })
 });



 

router.get('/', async(req,res, next)=>{ 
    Chat.find({ users: { $elemMatch : {$eq: req.session.user._id}}})
    .populate("users")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then( async results => {
        if(req.query.unreadOnly !== undefined && req.query.unreadOnly== "true"){
            results = results.filter(r => r.latestMessage && !r.latestMessage.readBy.includes(req.session.user._id))  
        }
        results = await User.populate( results, { path: "latestMessage.sender"})
        res.status(200).send(results)
    })
    .catch(error =>{
        console.log(error);
        res.sendStatus(400)
    })    
 });


 
router.put('/:chatId', async(req,res, next)=>{ 
    var chatId = req.params.chatId
    Chat.findByIdAndUpdate(chatId, req.body)
    .then(results => res.sendStatus(204))
    .catch(error =>{
        console.log(error);
        res.sendStatus(400)
    })    
 });


 router.get('/:chatId/messages', async(req,res, next)=>{ 
    var chatId = req.params.chatId;
    Message.find({Chat: chatId })
    .populate("sender")
    .then(results => res.status(200).send(results))
    .catch(error =>{
        console.log(error);
        res.sendStatus(400)
    })    
 });



 
 router.put('/:chatId/messages/marksAsRead', async(req,res, next)=>{ 
    var chatId = req.params.chatId;

    Message.updateMany({Chat: chatId }, { $addToSet: { readyBy: req.session.user._id}})
    .then(() => res.sendStatus(204))
    .catch(error =>{
        console.log(error);
        res.sendStatus(400)
    })    
 });


module.exports = router;

