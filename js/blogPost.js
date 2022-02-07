postLikes = [];

function loadFirebasePage(){
    var title = sessionStorage.getItem("currentPage");
    db.collection("blogposts").where("title", "==", title)
    .get()
    .then((querySnapshot) => {
        if(querySnapshot.docs.length == 0) {
            alert("No loaded document, going back to the homepage!");
            location.href = "index.html";
        }
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            document.getElementById("title").innerText = doc.data().title;
            if (doc.data().createdby == curName || currentUser.uid == "rsNNG9JlJjaZqgkla7dUI0p28RD2" || currentUser.uid == "ZsB7WbdO87X5oPNj8QkDSM8YOq53"){
                const titleBar = document.getElementById("title--bar");
                
                const deleteButton = document.createElement("btn");
                deleteButton.classList.add("comment--replybtn")
                deleteButton.setAttribute("onclick", "deletePost('" + doc.id + "');");
    
                const deleteImg = document.createElement("img");
                deleteImg.setAttribute("src", "Images/BlackDelete.png");
                deleteImg.setAttribute("width", "20vh");
                deleteImg.setAttribute("height", "20vh");
                
                deleteButton.appendChild(deleteImg);
                titleBar.appendChild(deleteButton);

                const editButton = document.createElement("btn");
                editButton.classList.add("comment--replybtn")
                
                //Need String.raw`` because without it the quotes and other escape sequences inside would cause an error 
                editButton.setAttribute("onclick", "editPost('" + doc.id + "', String.raw`" + doc.data().body + "`);");
    
                const editImg = document.createElement("img");
                editImg.setAttribute("src", "Images/EditIcon.png");
                editImg.setAttribute("width", "20vh");
                editImg.setAttribute("height", "20vh");
                
                editButton.appendChild(editImg);
                titleBar.appendChild(editButton);
            }

            postLikes = doc.data().likedby;
            if (postLikes != undefined){
                if (postLikes.includes(currentUser.uid)){
                    document.getElementById("heart").classList.toggle("press");
                }
                document.getElementById("likedbycount").innerText = "Likes: " + postLikes.length;
            }
            // document.getElementById("body").innerText = doc.data().body;
            formatBody(doc.data().body);
            document.getElementById("page--head--title").innerText = "Eli's Blog - " + doc.data().title;
            loadComments(doc.id);
        });
    })
    .catch((error) => {
        console.log(error);
    });
}

function formatBody(text) {
    var bodyContainer = document.getElementById("body--container")
    var splitString = text.split("/~/");
    console.log(splitString);
    for(var i = 0; i < splitString.length; i++){
        var comArg = splitString[i].split("/~~/");
        console.log(comArg);
        if (comArg.length == 1){
            const pElement = document.createElement("p");
            pElement.innerText = comArg[0];
            bodyContainer.appendChild(pElement);
        }else{
            var parentElement = bodyContainer;
            //Any code before the /~~/ will be the parent of the second code, only supports 1 parent
            if (comArg[0] != ""){
                const parElement = document.createElement("div");
                console.log(comArg[0].trim());
                parElement.innerHTML = comArg[0].trim();
                bodyContainer.appendChild(parElement); 
                parentElement = parElement.children[0];
            }
            const newElement = document.createElement("div");
            newElement.innerHTML = comArg[1].trim();
            parentElement.appendChild(newElement);
        }
    }
}

function loadComments(postID) {
    if (currentUser == null) {
        document.getElementById("submit--container").remove();
    }
    
    db.collection("comments").orderBy("createdat", "desc").where("linkedto", "==", postID)
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

            db.collection("usercolor").doc(doc.data().createdUID).get().then((colorData) => {
                console.log(colorData.data());
                createdby.setAttribute("style", "display: inline; color: " + (colorData.data() || {color: "#000000"}).color + ";");
            } )
            .catch((error) => {
                // console.log(error);
                logFirebaseError(error);
            });
            
            topBar.appendChild(createdby);

            const p = document.createElement("p");
            p.classList.add("comment--text");
            p.innerText = doc.data().body;

            if (doc.data().createdby == curName || currentUser.uid == "rsNNG9JlJjaZqgkla7dUI0p28RD2" || currentUser.uid == "ZsB7WbdO87X5oPNj8QkDSM8YOq53"){
                const deleteButton = document.createElement("btn");
                deleteButton.classList.add("comment--replybtn")
                deleteButton.setAttribute("onclick", "deleteComment('" + doc.id + "', this);");
    
                const deleteImg = document.createElement("img");
                deleteImg.setAttribute("src", "Images/BlackDelete.png");
                deleteImg.setAttribute("width", "20vh");
                deleteImg.setAttribute("height", "20vh");
                
                deleteButton.appendChild(deleteImg);
                topBar.appendChild(deleteButton);

                const editButton = document.createElement("btn");
                editButton.classList.add("comment--replybtn")
                editButton.setAttribute("onclick", "editComment('" + doc.id + "', this, String.raw`" + doc.data().body + "`);");
    
                const editImg = document.createElement("img");
                editImg.setAttribute("src", "Images/EditIcon.png");
                editImg.setAttribute("width", "20vh");
                editImg.setAttribute("height", "20vh");
                
                editButton.appendChild(editImg);
                topBar.appendChild(editButton);
            }

            if (currentUser != null){
                const btn = document.createElement("btn");
                btn.classList.add("comment--replybtn");
                btn.setAttribute("onclick", "setReplyField('" + doc.id + "', this);");
    
                const img = document.createElement("img");
                img.setAttribute("src", "Images/ReplyIcon.png");
                img.setAttribute("width", "20vh");
                img.setAttribute("height", "20vh");
    
                btn.appendChild(img);
                topBar.appendChild(btn);
            }

            const li = document.createElement("li");
            li.classList.add("comment--item");
            li.setAttribute("docId", doc.id);
            li.setAttribute("isComment", true);
            li.appendChild(topBar);
            li.appendChild(p);
            
            db.collection("replies").orderBy("createdat", "desc").where("replyto", "==", doc.id)
            .get()
            .then((replySnapshot) => {
                const element = document.getElementById("comments--container");
                element.appendChild(li);
                replySnapshot.forEach((reply) => {
                    const replyContainer = document.createElement("li");
                    replyContainer.classList.add("reply--item");
                    replyContainer.setAttribute("docId", reply.id);
                    replyContainer.setAttribute("isComment", false);
        
                    if (reply.data().createdby == curName || currentUser.uid == "rsNNG9JlJjaZqgkla7dUI0p28RD2" || currentUser.uid == "ZsB7WbdO87X5oPNj8QkDSM8YOq53"){
                        const topBar = document.createElement("div");
                        topBar.classList.add("comment--topbar");

                        const deleteButton = document.createElement("btn");
                        deleteButton.classList.add("comment--replybtn")
                        deleteButton.setAttribute("onclick", "deleteComment('" + reply.id + "', this);");

                        const deleteImg = document.createElement("img");
                        deleteImg.setAttribute("src", "Images/BlackDelete.png");
                        deleteImg.setAttribute("width", "20vh");
                        deleteImg.setAttribute("height", "20vh");

                        deleteButton.appendChild(deleteImg);
                        topBar.appendChild(deleteButton);

                        const editButton = document.createElement("btn");
                        editButton.classList.add("comment--replybtn")
                        editButton.setAttribute("onclick", "editReply('" + reply.id + "', this, String.raw`" + reply.data().body + "`);");
            
                        const editImg = document.createElement("img");
                        editImg.setAttribute("src", "Images/EditIcon.png");
                        editImg.setAttribute("width", "20vh");
                        editImg.setAttribute("height", "20vh");
                        
                        editButton.appendChild(editImg);
                        topBar.appendChild(editButton);

                        replyContainer.appendChild(topBar);
                    }

                    const createdby = document.createElement("p");
                    createdby.classList.add("comment--title");
                    createdby.innerText = reply.data().createdby;

                    db.collection("usercolor").doc(doc.data().createdUID).get().then((colorData) => {
                        console.log(colorData.data());
                        createdby.setAttribute("style", "margin: 0 0 0 0; color: " + (colorData.data() || {color: "#000000"}).color + ";");
                    } )
                    .catch((error) => {
                        // console.log(error);
                        logFirebaseError(error);
                    });
        
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

function editPost(docId, postBody){
    const bodyContainer = document.getElementById("body--container");
    bodyContainer.setAttribute("style", "display: none;");

    var parentElement = bodyContainer.parentNode;
    var submitContainer = document.getElementById("submit--container");
    var mainChildren = parentElement.children;
    var parentIndex = Array.prototype.indexOf.call(mainChildren, parentElement);
    
    var newContainer = submitContainer.cloneNode(true);
    newContainer.setAttribute("id", "editpost--container");
    newContainer.classList.add("editpost--container");

    newContainer.querySelector("#bodyfield").innerText = postBody;
    newContainer.querySelector("#bodyfield").classList.add("edit--input");
    newContainer.querySelector("#bodyfield").setAttribute("style", "width: 75vw;");
    newContainer.querySelector("#bodyfield").setAttribute("id", "editpostfield");

    var submitButton = newContainer.querySelector("#submit");
    submitButton.classList.add("reply--submit");
    submitButton.setAttribute("onclick", "submitPostEdit('" + docId + "');")

    var cancelButton = submitButton.cloneNode(true);
    cancelButton.classList.remove("greenbutton");
    cancelButton.classList.remove("redbutton");
    cancelButton.innerText = "Cancel";
    cancelButton.setAttribute("onclick", "closeEditPostField()");

    submitButton.parentNode.appendChild(cancelButton);

    const centerParent = document.createElement("center");
    centerParent.appendChild(newContainer);

    parentElement.insertBefore(centerParent, mainChildren[parentIndex + 3]);
}

function closeEditPostField() {
    const editContainer = document.getElementById("editpost--container");
    editContainer.parentNode.remove();

    const bodyContainer = document.getElementById("body--container");
    bodyContainer.setAttribute("style", "margin: 5vw;");
}

function submitPostEdit(docID){
    var editText =  document.getElementById("editpostfield").innerText
    db.collection("blogposts").doc(docID).set({
        body: editText
    }, { merge: true }).then(() => {
        alert("Post edited succesfully!");
        location.reload();
    } )
    .catch((error) => {
        logFirebaseError(error);
    });
}

function submitComment() {
    var docID = Date.now();
    var linkedTo = sessionStorage.getItem("currentID");
    var body = document.getElementById("bodyfield").innerText;
    document.getElementById("bodyfield").innerText = "";
    var dispName = curName;
    console.log(currentUser);
    if (body != null && body != "") {
    // Add a new document in collection "cities"
    db.collection("comments").add({
        body: body,
        createdby: dispName,
        createdat: docID,
        linkedto: linkedTo,
        createdUID: currentUser.uid,
      })
      .then(() => {
        alert("Comment Posted!");
        location.reload();
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
    var dispName = curName;
    if (body != null && body != "") {
    // Add a new document in collection "cities"
    db.collection("replies").add({
        body: body,
        createdby: dispName,
        createdat: newDocId,
        replyto: docId,
        createdUID: currentUser.uid,
      })
      .then(() => {
        alert("Reply Posted!");
        location.reload();
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

    newContainer.querySelector("#bodyfield").innerText = "";
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
}

function closeReplyField() {
    var oldReplyContainer = document.getElementById("reply--container");
    if (oldReplyContainer != null){
        oldReplyContainer.remove();
    }
}

function deletePost(docID){
    db.collection("blogposts").doc(docID).delete().then(() => {
        db.collection("comments").where("linkedto", "==", docID)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((comment) => {
                db.collection("comments").doc(comment.id).delete();
                db.collection("replies").where("replyto", "==", comment.id)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((reply) => {
                        db.collection("replies").doc(reply.id).delete();
                    })
                })
            })
        })
    alert("Dey-ley-tey");
    location.href = "index.html";
    }).catch((error) => {
        logFirebaseError(error);
    });
}

function deleteComment(docID, buttonElement){
    var parentElement = buttonElement.parentNode.parentNode;
    var commentContainerChildren = parentElement.parentNode.children;

    var start = Array.prototype.indexOf.call(commentContainerChildren, parentElement)
    var i = start + 1;

    while(commentContainerChildren.length > i && commentContainerChildren[i].classList.contains("reply--item")){
        i++;
    }

    var childrenSlice = Array.prototype.slice.call(commentContainerChildren, start + 1, i);

    //remove all replies below comment
    if (parentElement.getAttribute("iscomment") == "true"){
        childrenSlice.forEach((child) => {
            removeCommentItem(child, true);
            child.remove();
        })
    }
    parentElement.remove();
    removeCommentItem(parentElement, false);    
}

function removeCommentItem(element, ignoreMessage) {
    if (element.getAttribute("iscomment") == "true") {
        db.collection("comments").doc(element.getAttribute("docID")).delete().then(() => {
            console.log("Document successfully deleted!");
            if (ignoreMessage == false){
                alert("Deleted your comment!");
            }
            location.reload();
        }).catch((error) => {
            logFirebaseError(error);
        });
    }else{
        db.collection("replies").doc(element.getAttribute("docID")).delete().then(() => {
            console.log("Document successfully deleted!");
            if (ignoreMessage == false){
                alert("Deleted your reply!");
            }
            location.reload();
        }).catch((error) => {
            logFirebaseError(error);
        });
    }
}

function editComment(docId, buttonElement, initialValue){
    closeEditField();
    
    var parentElement = buttonElement.parentNode.parentNode;
    var submitContainer = document.getElementById("submit--container");
    var commentContainerChildren = parentElement.parentNode.children;
    var parentIndex = Array.prototype.indexOf.call(commentContainerChildren, parentElement);
    
    var newContainer = submitContainer.cloneNode(true);
    newContainer.setAttribute("id", "edit--container");
    newContainer.classList.add("edit--container");

    newContainer.querySelector("#bodyfield").innerText = initialValue;
    newContainer.querySelector("#bodyfield").classList.add("edit--input");
    newContainer.querySelector("#bodyfield").setAttribute("id", "editfield");

    var submitButton = newContainer.querySelector("#submit");
    submitButton.classList.add("reply--submit");
    submitButton.setAttribute("onclick", "submitEdit('" + docId + "');")

    var cancelButton = submitButton.cloneNode(true);
    cancelButton.classList.remove("greenbutton");
    cancelButton.classList.remove("redbutton");
    cancelButton.innerText = "Cancel";
    cancelButton.setAttribute("onclick", "closeEditField()");

    submitButton.parentNode.appendChild(cancelButton);

    parentElement.appendChild(newContainer);
}

function editReply(docId, buttonElement, initialValue){
    closeEditReplyField();
    
    var parentElement = buttonElement.parentNode.parentNode;
    var submitContainer = document.getElementById("submit--container");
    var commentContainerChildren = parentElement.parentNode.children;
    var parentIndex = Array.prototype.indexOf.call(commentContainerChildren, parentElement);
    
    var newContainer = submitContainer.cloneNode(true);
    newContainer.setAttribute("id", "editreply--container");
    newContainer.classList.add("edit--container");

    newContainer.querySelector("#bodyfield").innerText = initialValue;
    newContainer.querySelector("#bodyfield").classList.add("editreply--input");
    newContainer.querySelector("#bodyfield").setAttribute("id", "editreplyfield");

    var submitButton = newContainer.querySelector("#submit");
    submitButton.classList.add("reply--submit");
    submitButton.setAttribute("onclick", "submitReplyEdit('" + docId + "');")

    var cancelButton = submitButton.cloneNode(true);
    cancelButton.classList.remove("greenbutton");
    cancelButton.classList.remove("redbutton");
    cancelButton.innerText = "Cancel";
    cancelButton.setAttribute("onclick", "closeEditReplyField()");

    submitButton.parentNode.appendChild(cancelButton);

    parentElement.appendChild(newContainer);
}

function closeEditReplyField() {
    var oldEditContainer = document.getElementById("editreply--container");
    if (oldEditContainer != null){
        oldEditContainer.remove();
    }
}

function submitReplyEdit(docID){
    var editText =  document.getElementById("editreplyfield").innerText
    db.collection("replies").doc(docID).set({
        body: editText
    }, { merge: true }).then(() => {
        alert("Reply edited succesfully!");
        location.reload();
    } )
    .catch((error) => {
        logFirebaseError(error);
    });
}

function closeEditField() {
    var oldEditContainer = document.getElementById("edit--container");
    if (oldEditContainer != null){
        oldEditContainer.remove();
    }
}

function submitEdit(docID){
    var editText =  document.getElementById("editfield").innerText
    db.collection("comments").doc(docID).set({
        body: editText
    }, { merge: true }).then(() => {
        alert("Comment edited succesfully!");
        location.reload();
    } )
    .catch((error) => {
        logFirebaseError(error);
    });
}

function likePost(btnElement){
    btnElement.classList.toggle("press");
    
    if(btnElement.classList.contains("press")) {
        if (postLikes == undefined || !postLikes.includes(currentUser.uid)) {
            if (postLikes == undefined) {
                postLikes = [currentUser.uid];
            }else{
                postLikes.push(currentUser.uid);
            }
            updatePostLikes();
        }
    }else{
        if (postLikes.length > 0 && postLikes.includes(currentUser.uid)) {
            const index = postLikes.indexOf(currentUser.uid);
            if (index > -1) {
                postLikes.splice(index, 1); // 2nd parameter means remove one item only
            }
            updatePostLikes();
        } 
    }
}

function updatePostLikes() {
    db.collection("blogposts").doc(sessionStorage.getItem("currentID")).set({
        likedby: postLikes
    }, { merge: true }).then(() => {
        document.getElementById("likedbycount").innerText = "Likes: " + postLikes.length;
    } )
    .catch((error) => {
        logFirebaseError(error);
    });
}

function moveBaba(width) {
    document.getElementById("baba").setAttribute("style", "margin-left: " + width + "px;");
    setTimeout(moveBaba(width + 5), 50);
}