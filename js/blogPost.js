function loadFirebasePage(){
    var title = sessionStorage.getItem("currentPage");
    console.log(title);
    db.collection("blogposts").where("title", "==", title)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            document.getElementById("title").innerText = doc.data().title;
            document.getElementById("body").innerText = doc.data().body;
            loadComments(title);
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

function loadComments(title) {
    db.collection("comments").where("linkedto", "==", title)
    .get()
    .then((querySnapshot) => {
        if (querySnapshot.docs.length > 0) {
            var container = document.getElementById("comments--container");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
        querySnapshot.forEach((doc) => {
            const li = document.createElement("li");
            li.classList.add("comment--item");
            const p = document.createElement("p");
            const createdby = document.createElement("p");
            createdby.classList.add("comment--title");
            createdby.innerText = doc.data().createdby;
            p.classList.add("comment--text");
            p.innerText = doc.data().body;
            li.appendChild(createdby);
            li.appendChild(p);
            
            const element = document.getElementById("comments--container");
            element.appendChild(li);
        });
        document.getElementsByTagName("body")[0].classList.remove("hidden");
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

function submitComment() {
    var docID = Date.now();
    var title = sessionStorage.getItem("currentPage");
    var body = document.getElementById("bodyfield").innerText;
    console.log(body);
    var dispName = currentUser.displayName || currentUser.email.split("@")[0];
    // Add a new document in collection "cities"
    db.collection("comments").doc(title + "," + docID).set({
      body: body,
      createdby: dispName,
      createdat: docID,
      linkedto: title
    })
    .then(() => {
      alert("Comment Posted!");
      loadComments(title);
      console.log("Document successfully written!");
    })
    .catch((error) => {
      alert("Error writing document: ", error);
      console.error("Error writing document: ", error);
    });
}