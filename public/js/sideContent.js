$(document).ready((e)=>{
     var userId = userLoggedIn._id
    console.log(userId)
    $.get("/api/users/findPeople/"+ userId , results =>{
        outputUsersToFollow(results, $(".whoToFollowsContainer"))
    })
})



//// first i will implement how to get user to follow 

//// how to reach my content and fetch few user like 5 to show 


// for trending posts
$(document).ready((e)=>{
     $.get("/api/posts/trending/", posts =>{
        outputTrendingPosts(posts, $(".trendingsContainer"))
   })
})




// Topic to Follow 
$(document).ready(()=>{
    const posts = ["Sport","News","Technology","Healthy"]
     outputPostsToFollow(posts, $(".topicToFollowsContainer"))
})



