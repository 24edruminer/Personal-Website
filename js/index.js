function populatePostList() {
    db.collection("blogposts")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const li = document.createElement("li");
            li.classList.add("postlink--item");
            const p = document.createElement("p");
            p.classList.add("postlink--text");
            p.innerText = doc.data().title;
            li.appendChild(p);
            
            const element = document.getElementById("post--container");
            element.appendChild(li);

            li.setAttribute("onclick", "openPostPage('" + doc.data().title + "');");
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

function openPostPage(title){
    sessionStorage.setItem("currentPage", title);
    console.log(sessionStorage.getItem("currentPage"))
    location.href = "blogPost.html";
}