const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require ("bcrypt");
const  User = require('../schemas/UserSchema');

const router = express.Router();


app.set("view engine", "pug");
app.set("views", "views");


app.use(bodyParser.urlencoded({ extended: false }));


router.get('/',(req,res, next)=>{      
    res.status(200).render("login");
});

router.post('/', async(req,res, next)=>{        
    // var email = req.body.loginUsername
    // var password = req.body.loginPassword

    var payload = req.body;

    if( req.body.loginUsername && req.body.loginPassword ){
       var user = await User.findOne({
        $or: [
        { username: req.body.loginUsername },
        { email: req.body.loginUsername }
    ] 
})
.catch((error)=>{
            console.log(error)
            payload.errorMessage ="Something went wrong"
            res.status(200).render("login", payload);
         });

 console.log(user)
 if(user != null ){
             //  user found
            var result = await bcrypt.compare(req.body.loginPassword, user.password)
             
             if(result === true){
                req.session.user = user;               
                return res.redirect("/");
             }            
        }
        payload.errorMessage ="Login credentials incorrect!";
        return res.status(200).render("login", payload);         
    }
    payload.errorMessage ="Make sure each field has a valid value!"
    res.status(200).render("login", payload);
});

    
module.exports = router;

