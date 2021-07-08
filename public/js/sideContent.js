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