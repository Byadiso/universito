$(document).ready((e)=>{
     var userId = userLoggedIn._id
    console.log(userId)
    $.get("/api/users/findpeople/"+ userId , results =>{
        console.log(results)
        outputUsersToFollow(results, $(".whoToFollowsContainer"))
    })
})



//// first i will implement how to get user to follow 

//// how to reach my content and fetch few user like 5 to show 


// for trending posts
$(document).ready((e)=>{
     $.get("/api/posts/trending/", posts =>{
       console.log(posts)
       outputTrendingPosts(posts, $(".trendingsContainer"))
   })
})




// Topic to Follow 
$(document).ready((e)=>{
    const posts = ["Sport","News","Technology","Healthy"]
    console.log(posts)
    outputPostsToFollow(posts, $(".topicToFollowsContainer"))
})



