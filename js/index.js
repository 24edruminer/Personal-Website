//Create a list of all the posts ordered by most recent to oldest
function populatePostList() {
    db.collection("blogposts")
    .orderBy("createdat", "desc")
    .get()
    .then((querySnapshot) => {
        console.log(querySnapshot)
        querySnapshot.forEach((doc) => {

            const li = document.createElement("li");
            li.classList.add("postlink--item");
            const p = document.createElement("p");
            p.classList.add("postlink--text");
            p.innerText = doc.data().title;
            li.appendChild(p);
            
            const element = document.getElementById("post--container");
            element.appendChild(li);

            //when opening the page pass the id and title
            li.setAttribute("onclick", "openPostPage('" + doc.data().title + "', '" + doc.id + "');");
        });
    })
    .catch((error) => {
        console.log(error);
        alert(error);
    });
}

//set the title and id for use when loading the page
function openPostPage(title, id){
    sessionStorage.setItem("currentPage", title);
    sessionStorage.setItem("currentID", id);
    
    location.href = "blogPost.html";
}