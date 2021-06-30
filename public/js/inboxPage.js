$(document).ready(()=>{
    $.get("/api/chats", (results, status, xhr ) =>{
        if(xhr.status == 400 ){
            alert("could not get chat list.");
        }
        else {
            console.log(results);
            outputChatsList(results, $(".resultsContainer"))
        }
       
    })
})




