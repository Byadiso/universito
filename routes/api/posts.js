const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const  User = require('../../schemas/UserSchema');
const  Post = require('../../schemas/PostSchema');
const  Notification = require('../../schemas/NotificationSchema');

const router = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));


router.get('/', async (req,res, next)=>{       
    var searchObject = req.query;
    if(searchObject.isReply !== undefined){
        var isReply = searchObject.isReply == "true";
        searchObject.replyTo = { $exists: isReply };
        delete searchObject.replyTo;      
    } 

    if(searchObject.search !== undefined){
        searchObject.content = {$regex: searchObject.search, $options: "i"};
        delete searchObject.search;   
    }

    if(searchObject.followingOnly !== undefined){
        var followingOnly = searchObject.followingOnly == "true";

        if(followingOnly){
            var objectIds = [];

            if(!req.session.user.following){
                req.session.user.following =[];
            }
             req.session.user.following.forEach(user =>{
                 objectIds.push(user);
             });

            objectIds.push(req.session.user._id);             
            searchObject.postedBy = { $in: objectIds };
        }        
        delete searchObject.followingOnly;      
    } 

  var results = await getPosts(searchObject);
  res.status(200).send(results)
});


//router for  trending post 

router.get('/trending', async (req,res, next)=>{      
    let istrendingPost =  { likes: { $size: 1}};
    //   let istrendingPost =  { $match : { likes:{ $exists : true } } }
        var results = await getPosts(istrendingPost);
        res.status(200).send(results)
    });


router.get('/:id', async (req,res, next)=>{   
    var postId = req.params.id;
    var postData = await getPosts({_id: postId});
    postData = postData[0];

    var results = {
        postData : postData
    }

    if(postData.replyTo !==undefined){
        results.replyTo = postData.replyTo;
    }
    results.replies = await getPosts({ replyTo : postId});    
    res.status(200).send(results);
 });

router.post('/', async(req,res, next)=>{  
    if(!req.body.content){
        console.log("content param not sent with request ")
        return res.sendStatus(400);
    }      

    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }
    
    if(req.body.replyTo) {
        postData.replyTo = req.body.replyTo
    }
    Post.create(postData)
    .then( async newPost =>{
        newPost = await User.populate(newPost, { path: "postedBy" });
        newPost = await Post.populate(newPost, { path: "replyTo" });


        if(newPost.replyTo != undefined){
            await Notification.insertNotification(newPost.replyTo.postedBy, req.session.user._id, "reply", newPost._id)
        }
    

        res.status(201).send(newPost);
    })
    .catch(error =>{
        console.log(error);
        res.sendStatus(400);
    });
  
});


router.delete('/:id', async(req,res, next)=>{     
    var postId = req.params.id;  

    // delete post
    var post = await Post.findByIdAndDelete(postId)
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    })

    res.status(202).send(post)
 });
 
router.put('/:id', async(req,res, next)=>{  
    
    if(req.body.pinned !== undefined){
        await Post.updateMany({ postedBy: req.session.user}, {pinned: true})
        .catch((error)=>{
            console.log(error);
            res.sendStatus(400);
        })
    }
  
     Post.findByIdAndUpdate(req.params.id, req.body)
     .then(()=>res.sendStatus(204))
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    })

    
 });


router.put('/:id/like', async(req,res, next)=>{     
    var postId = req.params.id;
    var userId = req.session.user._id;
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    var option = isLiked ? "$pull" : "$addToSet";

    // insert user like 
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } } , { new : true })
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    });

    


    // insert post like 
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } } , { new : true })
    .catch((error)=>{
        console.log(error);
        res.sendStatus(400);
    })

    // console.log(post)

    if(!isLiked){        
        await Notification.insertNotification(post.postedBy, userId , "postLike", post._id)
     };
     

    res.status(200).send(post)
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

    //notifcation

    if(!deletedPost){
        await Notification.insertNotification(post.postedBy, userId, "retweet", post._id)
    }

    res.status(200).send(post)
 });


 async function getPosts(filter){
    var results = await Post.find(filter)
     .populate("postedBy")
     .populate("retweetData")
     .populate("replyTo")
     .sort({ "createdAt": -1})
     .catch(error => console.log(error))
     results = await User.populate(results, { path : "replyTo.postedBy"});
     return await User.populate(results, { path : "retweetData.postedBy"});
 }


    
module.exports = router;

