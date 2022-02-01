function populatePostList() {
    db.collection("blogposts")
    .orderBy("createdat", "desc")
    .get()
    .then((querySnapshot) => {
        console.log(querySnapshot)
        querySnapshot.forEach((doc) => {
            console.log("hey?")
            const li = document.createElement("li");
            li.classList.add("postlink--item");
            const p = document.createElement("p");
            p.classList.add("postlink--text");
            p.innerText = doc.data().title;
            li.appendChild(p);
            
            const element = document.getElementById("post--container");
            element.appendChild(li);

            li.setAttribute("onclick", "openPostPage('" + doc.data().title + "', '" + doc.id + "');");
        });
    })
    .catch((error) => {
        logFirebaseError(error)
    });
}

function openPostPage(title, id){
    sessionStorage.setItem("currentPage", title);
    sessionStorage.setItem("currentID", id);
    
    location.href = "blogPost.html";
}