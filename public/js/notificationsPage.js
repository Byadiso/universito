$(document).ready(()=>{
    $.get("/api/notifications", (results) =>{        
        outputNotificationList(results, $(".resultsContainer"))
    })
})

$("#markNotificationAsRead").click(()=> markNotificationsAsOpened());
