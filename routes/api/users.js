const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest:"uploads/" });
const path = require("path");
const fs = require("fs");

const  User = require('../../schemas/UserSchema');
const  Post = require('../../schemas/PostSchema');
const  Notification = require('../../schemas/NotificationSchema');

const router = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));



router.get('/', async(req,res, next)=>{    
    var searchObject = req.query;
    if(searchObject.search !== undefined){
        searchObject= {
            $or:[
                {firstName: {$regex: searchObject.search, $options: "i"}},
                {lastName: {$regex: searchObject.search, $options: "i"}},
                {username: {$regex: searchObject.search, $options: "i"}},

            ]
        }       
     
    }

    User.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(error =>{
        console.log(error);
        res.sendStatus(400)
    })
s });


router.put('/:userId/follow', async(req,res, next)=>{ 
    
    var userId= req.params.userId;

    var user = await User.findById(userId);

    if(user == null) return res.sendStatus(404);


    var isFollowing = user.followers && user.followers.includes(req.session.user._id);

    var option = isFollowing ? "$pull" : "$addToSet";

    // insert user like 
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } } , { new : true })
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    });

     User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id }})
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    });

    if(!isFollowing){
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id)
    }

    res.status(200).send(req.session.user);

 });


 
router.get('/:userId/following', async(req,res, next)=>{ 
    User.findById(req.params.userId)
    .populate("following")
    .then(results =>{
        res.status(200).send(results);  
    })
    .catch((error)=>{
        console.log(error);
        res.status(400);
    })
 });

 
 
router.get('/:userId/followers', async(req,res, next)=>{ 
    User.findById(req.params.userId)
    .populate("followers")
    .then(results =>{
        res.status(200).send(results);  
    })
    .catch((error)=>{
        console.log(error);
        res.status(400);
    })
 });
 

router.post('/:id/retweet', async(req,res, next)=>{ 

    var postId = req.params.id;
    var userId = req.session.user._id;
    

    // try and retweet
    var deletedPost = await Post.findOneAndDelete({ postedBY: userId, retweetData: postId})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);

    })

    // var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    var option = deletedPost != null ?  "$pull" : "$addToSet";

    var repost = deletedPost;

    if(repost == null){
        repost = await Post.create({ postedBy: userId, retweetData: postId})
          .catch( error => {
              console.log(error);
              res.sendStatus(400);
          })
    }

    // insert user like 
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } } , { new : true })
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    })


    // insert post like 
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } } , { new : true })
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    })

    res.status(200).send(post)
 });

 router.post('/profilePicture',upload.single("croppedImage"), async(req,res, next)=>{ 
        if(!req.file){
            console.log("no file uploaded with the ajax request");
            return res.sendStatus(400);
        }
        var filePath = `/uploads/images/${req.file.filename}.png`;
        var tempPath = req.file.path;
        var targetPath = path.join(__dirname, `../../${filePath}`);

        fs.rename(tempPath, targetPath, async(error) =>{
            if(error != null ){
                console.log(error);
                return res.sendStatus(400);
            }

        req.session.user = await User.findByIdAndUpdate(req.session.userId._id, {profilePic: filePath}, {new: true})
        res.sendStatus(204);
        })    

     });

     
 router.post('/coverphoto',upload.single("croppedImage"), async(req,res, next)=>{ 
    if(!req.file){
        console.log("no file uploaded with the ajax request");
        return res.sendStatus(400);
    }
    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async(error) =>{
        if(error != null ){
            console.log(error);
            return res.sendStatus(400);
        }

    req.session.user = await User.findByIdAndUpdate(req.session.userId._id, { coverPhoto: filePath}, {new: true})
    res.sendStatus(204);
    })    

 });




 async function getUsers(filter){
     var results = await User.find(filter)
     .populate("postedBy")
     .populate("retweetData")
     .populate("replyTo")
     .sort({ "createdAt": -1})
     .catch(error => console.log(error))

     results = await Post.populate(results, {path : "replyTo.postedBy"});
     return await Post.populate(results, {path : "retweetData.postedBy"});
 }


    
module.exports = router;

