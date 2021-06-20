$(document).ready(()=>{
    $.get("/api/posts", { followingOnly }, results =>{
        console.log(results);
        outputPosts(results, $(".postsContainer"))
    })
})

