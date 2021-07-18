$(document).ready(()=>{
    $.get("/api/chats", (data, status, xhr ) =>{
        if(xhr.status == 400 ){
            alert("could not get chat list.");
        }
        else {
            console.log(data);
            outputChatsList(data, $(".resultsContainer"))
        }
       
    })
})




