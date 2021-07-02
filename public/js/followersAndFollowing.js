

$(document).ready(()=>{

    if(selectedTab == "followers"){
        loadFollowers();
    }
    else{
          
          loadFollowing();
        }
    });
    
    
    
    function loadFollowers(){
        $.get(`/api/users/${profileUserId}/followers`, results =>{
            console.log(results);
            outputUsers(results.followers, $(".resultsContainer"))
        })
    }
    
    
    function loadFollowing(){
        $.get(`/api/users/${profileUserId}/following`,results =>{
            console.log(results);
            outputUsers(results.following, $(".resultsContainer"))
        })
    }

