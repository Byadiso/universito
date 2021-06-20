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
    pageTitle:"Notification ",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    
};

    res.status(200).render("notificationsPage", payload);
});


    
module.exports = router;

