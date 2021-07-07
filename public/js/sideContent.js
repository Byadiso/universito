$(document).ready(()=>{
    $.get("/api/users//findpeople/:userId",      results =>{
        console.log(results);
        outputPosts(results, $(".postsContainer"))
    })
})



//// first i will implement how to get user to follow 

//// how to reach my content and fetch few user like 5 to show 