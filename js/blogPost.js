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
            document.getElementById("page--head--title").innerText = "Eli's Blog - " + doc.data().title;
            loadComments(title);
        });
    })
    .catch((error) => {
        logFirebaseError(error)
    });
}

function loadComments(title) {
    if (currentUser == null) {
        document.getElementById("submit--container").remove();
    }
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
            const topBar = document.createElement("div");
            topBar.classList.add("comment--topbar");

            const createdby = document.createElement("p");
            createdby.classList.add("comment--title");
            createdby.innerText = doc.data().createdby;
            topBar.appendChild(createdby);
            createdby.setAttribute("style", "display: inline;");

            const p = document.createElement("p");
            p.classList.add("comment--text");
            p.innerText = doc.data().body;

            const btn = document.createElement("btn");
            btn.classList.add("comment--replybtn")

            const img = document.createElement("img");
            img.setAttribute("src", "Images/ReplyIcon.png");
            img.setAttribute("width", "20vh");
            img.setAttribute("height", "20vh");

            btn.appendChild(img);
            topBar.appendChild(btn);

            const li = document.createElement("li");
            li.classList.add("comment--item");
            li.appendChild(topBar);
            li.appendChild(p);
            console.log(li);
            btn.setAttribute("onclick", "setReplyField('" + doc.id + "', this);");

            db.collection("replies").where("replyto", "==", doc.id)
            .get()
            .then((replySnapshot) => {
                const element = document.getElementById("comments--container");
                element.appendChild(li);
                replySnapshot.forEach((reply) => {
                    const replyContainer = document.createElement("li");
                    replyContainer.classList.add("reply--item");
                    console.log(reply);
                    const createdby = document.createElement("p");
                    createdby.classList.add("comment--title");
                    createdby.innerText = reply.data().createdby;
        
                    const p = document.createElement("p");
                    p.classList.add("comment--text");
                    p.innerText = reply.data().body;
        
                    replyContainer.appendChild(createdby);
                    replyContainer.appendChild(p);
                        element.appendChild(replyContainer);
                });

            }).catch((error) => {
                logFirebaseError(error);
            });

        });
        document.getElementsByTagName("body")[0].classList.remove("hidden");
    })
    .catch((error) => {
        logFirebaseError(error)
    });
}

function submitComment() {
    var docID = Date.now();
    var title = sessionStorage.getItem("currentPage");
    var body = document.getElementById("bodyfield").innerText;
    console.log(body);
    var dispName = currentUser.displayName || currentUser.email.split("@")[0];
    if (body != null && body != "") {
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
          logFirebaseError(error);
      });
    }else{
        alert("Comment text empty");
    }

}

function submitReply(docId) {
    var newDocId = Date.now();
    var title = sessionStorage.getItem("currentPage");
    var body = document.getElementById("replyfield").innerText;
    console.log(body);
    var dispName = currentUser.displayName || currentUser.email.split("@")[0];
    if (body != null && body != "") {
    // Add a new document in collection "cities"
    db.collection("replies").add({
        body: body,
        createdby: dispName,
        createdat: newDocId,
        replyto: docId
      })
      .then(() => {
        alert("Reply Posted!");
        loadComments(title);
        console.log("Document successfully written!");
      })
      .catch((error) => {
          logFirebaseError(error);
      });
    }else{
        alert("Reply text empty");
    }
}

function setReplyField(docId, buttonElement) {
    closeReplyField();
    
    var parentElement = buttonElement.parentNode.parentNode;
    var submitContainer = document.getElementById("submit--container");
    var commentContainerChildren = parentElement.parentNode.children;
    var parentIndex = Array.prototype.indexOf.call(commentContainerChildren, parentElement);
    
    var newContainer = submitContainer.cloneNode(true);
    newContainer.setAttribute("id", "reply--container");
    newContainer.classList.add("reply--container");

    newContainer.querySelector("#bodyfield").classList.add("reply--input");
    newContainer.querySelector("#bodyfield").setAttribute("id", "replyfield");

    var submitButton = newContainer.querySelector("#submit");
    submitButton.classList.add("reply--submit");
    submitButton.setAttribute("onclick", "submitReply('" + docId + "');")

    var cancelButton = submitButton.cloneNode(true);
    cancelButton.classList.remove("greenbutton");
    cancelButton.classList.remove("redbutton");
    cancelButton.innerText = "Cancel";
    cancelButton.setAttribute("onclick", "closeReplyField()");

    submitButton.parentNode.appendChild(cancelButton);

    parentElement.parentNode.insertBefore(newContainer, commentContainerChildren[parentIndex + 1]);
    console.log(parentElement);
}

function closeReplyField() {
    var oldReplyContainer = document.getElementById("reply--container");
    if (oldReplyContainer != null){
        oldReplyContainer.remove();
    }
}
