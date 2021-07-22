//globals

var cropper; 
var timer;  
var selectedUsers = [];

$(document).ready(()=>{
    refreshMessagesBadge();
    refreshNotificationsBadge();
})

$("#postTextarea, #replyTextarea").keyup((event)=>{
    var textbox =$(event.target);
    var value = textbox.val().trim();
    // console.log(value);

    var isModal = textbox.parents(".modal").length == 1 ; 
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.lenght == 0) return alert("No submmit button found");

    if(value ==""){
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})


$("#submitPostButton , #submitReplyButton").click((event)=>{
    var button = $(event.target);

    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea"):  $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    if(isModal){
        var id = button.data().id;
        if(id == null) return alert("Butoon id is null")
        data.replyTo = id ;
    }

    $.post("/api/posts", data, (postData)=>{

        if(postData.replyTo){
            emitNotification(postData.replyTo.postedBy);
            location.reload()
        } else {
            console.log(postData)
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true)
        }     
     })

});

$("#replyModal").on("show.bs.modal", (event )=>{
    // console.log("hi")
    var button = $(event.relatedTarget)
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id",postId);

    $.get("/api/posts/" + postId , results =>{
        outputPosts(results.postData , $("#originalPostContainer"))
        // outputPosts(results, $(".postsContainer"))
    })
    

})


$("#replyModal").on("hidden.bs.modal", ( )=> $("#originalPostContainer").html(""))


$("#deletePostModal").on("show.bs.modal", (event )=>{
    // console.log("hi")
    var button = $(event.relatedTarget)
    var postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id",postId);  

})



$("#confirmPostModal").on("show.bs.modal", (event )=>{
    // console.log("hi")
    var button = $(event.relatedTarget)
    var postId = getPostIdFromElement(button);
    $("#pinPostButton").data("id",postId); 
})

$("#unPinModal").on("show.bs.modal", (event )=>{
    // console.log("hi")
    var button = $(event.relatedTarget)
    var postId = getPostIdFromElement(button);
    $("#unPinPostButton").data("id",postId); 
})



$("#pinPostButton").click((event)=>{
    var postId =$(event.target).data("id");
    $.ajax({
        url:`api/posts/${postId}`,
        type: "PUT",
        data: {pinned: true},
        success: (data, status, xhr) =>{
            if(xhr.status!=204){
                alert ("could not delete the post");
                return;
            }
           location.reload();
        }
    })

})


$("#unPinPostButton").click((event)=>{
    var postId =$(event.target).data("id");
    $.ajax({
        url:`api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false},
        success: (data, status, xhr) =>{
            if(xhr.status!=204){
                alert ("could not delete the post");
                return;
            }
           location.reload();
        }
    })

})


$("#deletePostButton").click((event)=>{
    var postId =$(event.target).data("id");
    $.ajax({
        url:`api/posts/${postId}`,
        type: "DELETE",
        success: (postData)=>{
           location.reload();
        }
    })

})



$("#filePhoto").change(function(){
    if(this.files && this.files[0]){
        var reader = new FileReader();
        reader.onload = (e)=>{

            var image = document.getElementById("imagePreview");
            image.src = e.target.result;

            
            if(cropper !== undefined){
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1/1,
                background: false
            })



        }
         reader.readAsDataURL(this.files[0]);
    } else {
        console.log("nope")
    }
})


$("#coverPhoto").change(function(){
    if(this.files && this.files[0]){
        var reader = new FileReader();
        reader.onload = (e)=>{

            var image = document.getElementById("coverPreview");
            image.src = e.target.result;

            
            if(cropper !== undefined){
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16/9,
                background: false
            })



        }
         reader.readAsDataURL(this.files[0]);
        } 
});


$("#coverPhotoUploadButton").click(()=>{
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null ){
        alert("could not load image make it is an image file");
        return;
    }

    canvas.toBlob((blob)=>{
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url:"/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()            
        })
        
    })

});


$("#imageUploadButton").click(()=>{
    var canvas = cropper.getCroppedCanvas();
    console.log("is clicked")

    if(canvas == null ){
        alert("could not load image make it is an image file");
        return;
        }

    canvas.toBlob((blob)=>{
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url:"/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()            
        })
        
    })

})

$("#userSearchTextbox").keydown((event)=>{
    clearTimeout(timer);
    var textbox =  $(event.target);
    var value = textbox.val();
    
    if(value == "" && (event.which == 8 || event.keyCode ==  8)){
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");
        if(selectedUsers.length == 0 ){
            $("#createChatButton").prop("disabled", true);
        }
        
        return;
    }
    timer = setTimeout(()=>{
        value = textbox.val().trim();

        if(value == ""){
            $(".resultsContainer").html("");
        }
        else{
            searchUsers(value)
        }
    }, 1000)
})



$("#createChatButton").click(()=>{    

   var data = JSON.stringify(selectedUsers); 
        $.post("/api/chats", {users: data}, chat =>{
            if(!chat || !chat._id) return alert ("Invalid response from server.");
            window.location.href= `/messages/${chat._id}`
        })

})


$(document).on("click",".likeButton", (event)=>{    
    var button = $(event.target)
    var postId = getPostIdFromElement(button);
  
    if(postId === undefined )return ;
    $.ajax({
        url:`api/posts/${postId}/like`,
        type: "PUT",
        success: (postData)=>{
            button.find("span").text(postData.likes.length || "" );
            
            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
                emitNotification(postData.postedBy);
                
            } else {
                button.removeClass("active");
            }
        }
    })

});


$(document).on("click",".retweetButton", (event)=>{    
    var button = $(event.target)
    var postId = getPostIdFromElement(button);
  
    if(postId === undefined )return ;
    $.ajax({
        url:`api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData)=>{
          
            button.find("span").text(postData.retweetUsers.length || "" );
            
            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
                emitNotification(postData.postedBy._id);
            } else {
                button.removeClass("active");
            }
        }
    })

});


$(document).on("click",".post", (event)=>{    
    var element = $(event.target)
    var postId = getPostIdFromElement(element);
  
    if(postId !== undefined && !element.is("button")){
        window.location.href='/posts/' + postId
    }
    

});


$(document).on("click",".followButton", (event)=>{    
    var button = $(event.target)
    var userId = button.data().user;
  
    if(userId === undefined ) return ;
    $.ajax({
        url:`/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr)=>{
            
            if(xhr.status == 404){
                alert("usere not found")
                return;
            }
            // button.find("span").text(userData.following.length || "" );
            
            var difference = 1; 
            if(data.following && data.following.includes(userId)){
                button.addClass("following");
                button.text("Following");
                emitNotification(userId);
            } else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1
            }

            var followersLabel = $("#followersValue");
            if(followersLabel.length != 0 ){
                var followersText = followersLabel.text();
                followersText= parseInt(followersText);
                followersLabel.text(followersText + difference)

            }
        }
    })

});

$(document).on("click", ".notification.active", (event)=>{
    var container = $(event.target);
    var notificationId = container.data().id;
    var href= container.attr("href");
    event.preventDefault();
    var callback = ()=>window.location=href;
    markNotificationsAsOpened(notificationId, callback);

})

function getPostIdFromElement(element){
    var isRoot = element.hasClass("post");
    var rootElement = isRoot ? element: element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("post id undefined");
          return postId
}

function createPostHtml(postData, largeFont = false) {      
    if(postData == null ) return alert('post object is null');   
   
    // check if this is a retweet
    var isRetweet = postData.retweetData !== undefined ;
     // get the user who retweeted
    var retweetedBy = isRetweet ? postData.postedBy.username : null;  
    postData = isRetweet ? postData.retweetData : postData ; 
 

    var postedBy = postData.postedBy;

    if(!postedBy) {
       console.log("PostedBy is null. Check the browser console to see the postData object.")
        return console.log(postData);
    }
    else if(postedBy._id === undefined){
        return console.log("User Object not populated")
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp= timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweeetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";


    var largeFontClass = largeFont ? "largeFont" : ""


    //for retweet 
    var retweetText = "";

    if(isRetweet){
        retweetText = `<span>
                              <i class="fas fa-retweet"></i>
                              Retweeted by <a href="/profile/${retweetedBy}">@${retweetedBy}</a>
                      </span>`
    }
 //for reply
    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id){
            return alert("reply  to is not populated")
        } else  if(!postData.replyTo.postedBy._id){
            return alert("postedBy is not populated")
        } 

        var replyToUsername = postData.replyTo.postedBy.username

        replyFlag =` <div class="replyFlag">
                        Replying to <a href="profile/${replyToUsername}">@${replyToUsername}</a>
                    </div>`
    }


    var buttons="";
    var pinnedPostText = "";
    if(postData.postedBy._id == userLoggedIn._id){

        var pinnedClass = "";
        var dataTarget = "#confirmPinModal";
        if(postData.pinned === true){
            pinnedClass= "active";
            dataTarget = "#unpinModal";
            pinnedPostText = '<i class="fas fa-thumbtack"></i><span>Pinned Post</span>';
        }


        buttons =`        
        <button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class="fas fa-thumbtack"></i></button> 
   
        
        <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-times"></i></button>` 
       }


    return `<div class="post ${ largeFontClass }" data-id='${postData._id}'>
              <div class="postActionContainer">
                ${retweetText}
                
              </div>
                <div class="mainContentContainer">
                    <div class="userImageContainer">
                         <img src="${postedBy.profilePic}">
                    </div>
                    <div class="postContentContainer">
                        <div class="pinnedPostText">${pinnedPostText}</div>
                        <div class="header">
                            <a href="/profile/${postedBy.username}">${displayName}</a>
                            <span class="username">@${postedBy.username}</span>
                            <span class="username">${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>
                        
                        <div class="postFooter">
                            <div class="postButtonContainer">
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class="fas fa-comment"></i>
                                </button>
                            </div>
                            <div class="postButtonContainer green">
                                <button class="retweetButton ${retweeetButtonActiveClass}">
                                     <i class="fas fa-retweet"></i>
                                     <span>${postData.retweetUsers.length || ""}</span>
                                 </button>
                            </div>
                            <div class="postButtonContainer red">
                                 <button class="likeButton ${likeButtonActiveClass}">
                                     <i class="fas fa-heart"></i>
                                     <span>${postData.likes.length || ""}</span>
                                 </button>
                            </div>
                            
                        </div>
                    
                    </div>
                </div>
            </div>
    `    
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 <30) return "Just now";

        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
    container.html("");

    if(!Array.isArray(results)) {
        results = [results];
    }
    results.forEach(result =>{             
        var html = createPostHtml(result);
        container.append(html);        
    })
    if(results.length === 0 ){
        container.append("<span class='noResults'> Nothing to show.</span>")
    }
}

function outputPostsWithReplies(){
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo)
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml);

    results.replies.forEach(result =>{    
        var html = createPostHtml(result);
        container.append(html);        
    })
}


function outputUsers(results, container){
    container.html("");
    results.forEach(result =>{
        var html = createUserHtml(result, true);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No Results found</span>")
    }
 }


 function createUserHtml(userData, showFollowButton){
     var name = userData.firstName + " " + userData.lastName;
     var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);

     var text = isFollowing ? "Following" : "Follow"
     var buttonClass = isFollowing ? "followButton following" : "followButton"

     var followButton = "";
     if(showFollowButton && userLoggedIn._id !=userData._id){
         followButton=`<div class="followButtonContainer">
                             <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
                       </div>`
     }

     return `<div class="user">
                 <div class="userImageContainer">
                     <img src="${userData.profilePic}">
                 </div>
                 <div class="userDetailsContainer">
                     <div calss="header">
                         <a href="/profile/${userData.username}">${name}</a>
                         <span class="username">@${userData.username}</span>
                     </div>                        
                 </div>
                 ${followButton}  

             </div>`
 }


 // output single post 
function outputSinglePost(results, container){  

    container.html("");
    if(!Array.isArray(results)) {
        results = [results];
    }
    results.forEach(result =>{             
        var html = createSinglePostHtml(result, true);
        container.append(html);        
    })

    if(results.length === 0 ){
        container.append("<span class='noResults'> Nothing to show.</span>")
    }
}

// create HTML for single post 
function createSinglePostHtml(postData, largeFont = false) {  
      
    if(postData == null ) return alert('post object is null');    
    // check if this is a retweet
    var isRetweet = postData.retweetData !== undefined ;
     // get the user who retweeted
    var retweetedBy = isRetweet ? postData.postedBy.username : null;  
    // postData = isRetweet ? postData.retweetData : postData ;  
    postData= postData.postData
    var postedBy = postData.postedBy;

    if(!postedBy) {
       console.log("postedBy is null. Check the browser console to see the postData object.")
       console.log(postedBy)
        return console.log(postData);
    }
    else if(postedBy._id === undefined){
        return console.log("User Object not populated")
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp= timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweeetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";


    var largeFontClass = largeFont ? "largeFont" : "";

    //for retweet 
    var retweetText = "";

    if(isRetweet){
        retweetText = `<span>
                              <i class="fas fa-retweet"></i>
                              Retweeted by <a href="/profile/${retweetedBy}">@${retweetedBy}</a>
                      </span>`
    }
 //for reply
    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id){
            return alert("reply  to is not populated")
        } else  if(!postData.replyTo.postedBy._id){
            return alert("postedBy is not populated")
        } 

        var replyToUsername = postData.replyTo.postedBy.username

        replyFlag =` <div class="replyFlag">
                        Replying to <a href="profile/${replyToUsername}">@${replyToUsername}</a>
                    </div>`
    }

    var buttons="";
    var pinnedPostText = "";
    if(postData.postedBy._id == userLoggedIn._id){

        var pinnedClass = "";
        var dataTarget = "#confirmPinModal";
        if(postData.pinned === true){
            pinnedClass= "active";
            dataTarget = "#unpinModal";
            pinnedPostText = '<i class="fas fa-thumbtack"></i><span>Pinned Post</span>';
        }

        buttons =`        
        <button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class="fas fa-thumbtack"></i></button> 
   
        
        <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-times"></i></button>` 
       }


    return `<div class="post ${ largeFontClass }" data-id='${postData._id}'>
              <div class="postActionContainer">
                ${retweetText}
                
              </div>
                <div class="mainContentContainer">
                    <div class="userImageContainer">
                         <img src="${postedBy.profilePic}">
                    </div>
                    <div class="postContentContainer">
                        <div class="pinnedPostText">${pinnedPostText}</div>
                        <div class="header">
                            <a href="/profile/${postedBy.username}">${displayName}</a>
                            <span class="username">@${postedBy.username}</span>
                            <span class="username">${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>
                        
                        <div class="postFooter">
                            <div class="postButtonContainer">
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class="fas fa-comment"></i>
                                </button>
                            </div>
                            <div class="postButtonContainer green">
                                <button class="retweetButton ${retweeetButtonActiveClass}">
                                     <i class="fas fa-retweet"></i>
                                     <span>${postData.retweetUsers.length || ""}</span>
                                 </button>
                            </div>
                            <div class="postButtonContainer red">
                                 <button class="likeButton ${likeButtonActiveClass}">
                                     <i class="fas fa-heart"></i>
                                     <span>${postData.likes.length || ""}</span>
                                 </button>
                            </div>                            
                        </div>                    
                    </div>
                </div>
            </div>
    `    
}

// for user to follow 
 function outputUsersToFollow(results, container){
    container.html("");
    results.forEach(result =>{
        var html = createUserHtmlToFollow(result, true);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No Results found</span>")
    }
 }
// for creating user to follow html 
 function createUserHtmlToFollow(userData, showFollowButton){

    var name = userData.name ;
    
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);

    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"

    var followButton = "";
    if(showFollowButton && userLoggedIn._id !=userData._id){
        followButton=`<div class="followButtonContainer">
                            <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
                      </div>`
    }
    

    return `<div class="contentUserTofollow">
                <div class="userImageContainer userTofollowDetails">
                    <img src="${userData.profilePic}">
                </div>
                <div class="userDetailsContainer userTofollowDetails">
                    <div calss="header">
                        <a href="/profile/${name}">${name}</a>
                        <span class="username">@${userData.name}</span>
                    </div>                        
                </div>
                ${followButton}  
            </div>`
}


// for trending post  
function outputTrendingPosts(results, container){
    container.html("");
    results.forEach(result =>{
        var html = createTrendingPostHtml(result);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No Results found</span>")
    }
 }
// for creating post rending html 
 function createTrendingPostHtml(postData){   

    return `<div class="contentTrendingPost">               
                <div class="trendingPostDetails">
                    <div class="postDetailsContainer">
                        <h6><a href="/posts/${postData._id}">#${postData.content}</a></h6>
                        <span class="likes">${postData.likes.length} Likes </span>
                        <span class="retweets">${postData.retweetUsers.length} Tweets</span>
                    </div>                        
                </div>              
            </div>`
}

// for Topic posts to follow 
function outputPostsToFollow(results, container){
    container.html("");
    results.forEach(result =>{
        var html = createTopicPostHtmlToFollow(result);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No Results found</span>")
    }
 }
// for creating topic post to follow html 
 function createTopicPostHtmlToFollow(postData){  

    return `<div class="contentUserTofollow">               
                <div class="userDetailsContainer userTofollowDetails">
                    <div calss="header">
                        <h6><a href="/profile/${postData}">${postData}</a></h6>    
                        <h7><a href="/profile/${postData}">All about ${postData} </a></h7>                      
                    </div>                        
                </div>
            
            </div>`
}

 function searchUsers(searchTerm){
     $.get("/api/users", { search: searchTerm}, results=>{
         outputSelectableUsers(results, $(".resultsContainer"));
     })

 }

 function outputSelectableUsers(results, container){
    container.html("");
    results.forEach(result =>{
        if(result._id ==userLoggedIn._id || selectedUsers.some(u=>u._id == result._id)){
            return;
        }

        var html = createUserHtml(result, false);
        var element = $(html)
        element.click(()=> userSelected(result));
        container.append(element);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No Results found</span>")
    }
 }


 function userSelected(user){
     selectedUsers.push(user);
     selectedUsersHtml();
     $("#userSearchTextbox").val("").focus();
     $(".resultsContainer").html("");
     $("#createChatButton").prop("disabled", false);

 }
 
 function updateSelectedUsersHtml(){
   var elements = []
   selectedUsers.forEach(user =>{
       var name = user.firstName + " " + user.lastName;
       var userElement = $(`<span class="selectedUser">${name}</span>`);
       elements.push(userElement);

   });
   $(".selectedUser").remove();
   $("#selectedUser").prepend(elements);
   
}

function getChatName(chatData){
    var chatName = chatData.chatName;

    if(!chatName){
        var otherChatUsers = getOtherChatUsers(chatData.users);
        var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName)
        chatName = namesArray.join(", ")
    }
    return chatName;

}


function getOtherChatUsers(users){
    if(users.length == 1) return users; 
    return users.filter(user => user._id != userLoggedIn._id);
}

function messageReceived(newMessage){
    if($(`[data-room=${newMessage.chat._id}]`).length == 0){
        //show popup notification
        showMessagePopup(newMessage)
    }
    else {
        addChatMessageHtml(newMessage);
    }
    refreshMessagesBadge();
}


function markNotificationsAsOpened ( notificationId=null, callback=null ){
    if(callback ==null) callback =()=>location.reload();

    var  url = notificationId!=null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
    $.ajax({
        url:url,
        type:"PUT",
        success:()=> { 
            callback();
        }
    })
}

function refreshMessagesBadge(){
    $.get("/api/chats", {unreadOnly: true}, (data)=>{
var numResults = data.length;

            if (numResults> 0 ){
                $('#messagesbadge').text(numResults).addClass("active");
                    }else {
                        $('#messagesbadge').text(numResults).removeClass("active")
                    }
    })
}


function refreshNotificationsBadge(){
    $.get("/api/notifications", {unreadOnly: true}, (data)=>{
var numResults = data.length;

            if (numResults> 0 ){
                $('#notificationsBadge').text(numResults).addClass("active");
                    }else {
                        $('#notificationsBadge').text(numResults).removeClass("active")
                    }
    })
}

function showNotificationPopup(data){
    var html = createNotificationHtml(data)
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(()=>element.fadeOut(400), 5000);
}


function showMessagePopup(data){
if(data.chat.latestMessage.Id){
    data.chat.latestMessage= data;  
}

    var html = createChatHtml(data.chat)
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(()=>element.fadeOut(400), 5000);
}

function outputNotificationList(notifications, container){
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);

        if(notifications.length == 0 ){
            container.append("<span class='noResults'>Nothing to show. </span>")
        }
    });
}

function createNotificationHtml(notification){
    var userFrom = notification.userFrom;
    var text = getNotificationText(notification);
    var href = getNotificationUrl(notification);
    var className = notification.opened ? " ": "active";


    return `<a href="${href}" class="resultListItem notification ${className}" data-id="${notification._id}">
                <div class="resultsImageContainer">
                    <img src="${userFrom.profilePic}"></img>
                </div>
                <div class="resultsDetailsContainer ellipsis">
                    <span class="ellipsis">${text}</span>
                </div>
            </a>`

}

function getNotificationText(notification){
    var userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName){
        return alert("user from data not populated")
    }

    var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

    var text ;
    if(notification.notificationType == "retweet"){
        text= `${userFromName} retweeted one of your posts`;
    } 
    else if(notification.notificationType == "postLike"){
        text= `${userFromName} liked one of your posts`;
    } 
    else if(notification.notificationType == "reply"){
        text= `${userFromName} replied one of your posts`;
    } 
    else if(notification.notificationType == "follow"){
        text= `${userFromName} followed you`;
    } 

    return `<span class="ellipsis">${text}</span>`
}

function getNotificationUrl(notification){
    

    var url ="#";

    if(notification.notificationType == "retweet" ||
        notification.notificationType == "postLike"|| 
        notification.notificationType == "reply" ){
        url= `/posts/${notification.entityId}`;

    }     
    else if(notification.notificationType == "follow"){
        url= `/profile/${notification.entityId}`;
    } 

    return url

}

function outputChatsList(chatList, container){
    chatList.forEach(chat => {
        var html = createChatHtml(chat);
        container.append(html);
    });
   
    if(chatList.length == 0 ){
        container.append("<span class='noResults'>Nothing to show Go and start a conversation with your universito friends</span>");
    }
   }
   
   function createChatHtml (chatData){
    var chatName = getChatName(chatData);
    var image = getUserChatImageElement(); // to do 
    var latestMessage = getLatestMessage(chatData.latestMessage)

    var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";

    return ` <a href='/messages/${chatData._id}' class= "resultsListItem ${activeClass}">
                   ${image}
                   <div class='resultsDetailsContainer ellipsis'>
                       <span class='heading ellipsis'>${chatName}</span>
                       <span class='heading ellipsis'>${latestMessage}</span>
                   </div>
               </a>`;
   }
   
   
   function getLatestMessage(latestMessage){
       if(latestMessage != null ){
           var sender = latestMessage.sender;
           return `${sender.firstName } ${sender.lastName} : ${latestMessage.content}`;   
       }
   
       return "New chat";
   }
       
   function getChatImageElements(chatData){
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var groupChatClass = " ";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);
   
    if(otherChatUsers.length > 1 ){
        groupChatClass="groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1])
    }
   
   return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
   
   }
   
  function getUserChatImageElement (user){
       if(!user || !user.profilePic){
           return alert("User passed into function is invalid")
       }   
       return `<img src='${user.profilePic}' alt="user's profile pict">`   
   }


