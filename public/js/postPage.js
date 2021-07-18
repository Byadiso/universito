$(document).ready(()=>{
    $.get("/api/posts/"+ postId, results => {
        console.log(results);
        outputSinglePost(results, $(".postsContainer"))
    })
})

