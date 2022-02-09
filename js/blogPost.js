postLikes = [];

//Where all the stuff stems off of, loads the page first, then calls to load commets, and replies
function loadFirebasePage(){
    //get the page with the title "passed" (in reality its just stored in the sessionStorage which is cleared when the tab is closed) in by the button on the homepage
    var title = sessionStorage.getItem("currentPage");
    db.collection("blogposts").where("title", "==", title)
    .get()
    .then((querySnapshot) => {
        //if the title is messed up then there is nothing to load and just leave
        if(querySnapshot.docs.length == 0) {
            alert("No loaded document, going back to the homepage!");
            location.href = "index.html";
        }
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            //set the title
            document.getElementById("title").innerText = doc.data().title;
            //if you are the creator of the post or Eli then allow editing and deleting
            if (curName != null && currentUser != null && (doc.data().createdby == curName || currentUser.uid == "rsNNG9JlJjaZqgkla7dUI0p28RD2" || currentUser.uid == "ZsB7WbdO87X5oPNj8QkDSM8YOq53")){
                                
                const titleBar = document.getElementById("title--bar");
                
                //Create the delete button that passes the id to deletePost
                const deleteButton = document.createElement("btn");
                deleteButton.classList.add("comment--replybtn")
                deleteButton.setAttribute("onclick", "deletePost('" + doc.id + "');");
    
                const deleteImg = document.createElement("img");
                deleteImg.setAttribute("src", "Images/BlackDelete.png");
                deleteImg.setAttribute("width", "20vh");
                deleteImg.setAttribute("height", "20vh");
                
                deleteButton.appendChild(deleteImg);
                titleBar.appendChild(deleteButton);

                //create the edit button that passes the id and bodytext to editPost, it passes the bodytext to have one less database read 
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

            //get post likes
            postLikes = doc.data().likedby;
            //if there are none just skip this and keeps likes at 0
            if (postLikes != undefined){
                //allow clicking
                document.getElementById("heart").setAttribute("onclick", "likePost(this);");
                //if youve liked it then turn it on
                if (currentUser != null && postLikes.includes(currentUser.uid)){
                    document.getElementById("heart").classList.toggle("press");
                }
                //set like count
                document.getElementById("likedbycount").innerText = "Likes: " + postLikes.length;
            }
            //format the body text to allow my embed system
            formatBody(doc.data().body);

            //Set the title element (in the abrowser) of the page to show the title of the post 
            document.getElementById("page--head--title").innerText = "Eli's Blog - " + doc.data().title;

            //Load comments (this is a real doozy of some code)
            loadComments(doc.id);
        });
    })
    .catch((error) => {
        console.log(error);
    });
}

//Process my embed system
function formatBody(text) {
    var bodyContainer = document.getElementById("body--container");
    //Split string itn osections by /~/
    var splitString = text.split("/~/");

    for(var i = 0; i < splitString.length; i++){
        var comArg = splitString[i].split("/~~/");
        if (comArg.length == 1){
            //if there is no /~~/ in the section then the section is treated as a normal text element
            const pElement = document.createElement("p");
            pElement.innerText = comArg[0];
            bodyContainer.appendChild(pElement);
        }else{
            var parentElement = bodyContainer;
            //Any code before the /~~/ will be the parent of the second code, only supports 1 parent
            if (comArg[0] != ""){
                //create a "div" (because it will most liekly be changed) and change all its code to be the code before the /~~/
                const parElement = document.createElement("div");

                parElement.innerHTML = comArg[0].trim();
                bodyContainer.appendChild(parElement); 
                parentElement = parElement.children[0];
            }

            //Create a "div" and change all its code to be the code after the /~~/
            const newElement = document.createElement("div");
            newElement.innerHTML = comArg[1].trim();
            parentElement.appendChild(newElement);
        }
    }
}

//load comments, good luck even with the comments
function loadComments(postID) {
    //if not logged in dont allow submiting comments, if thsi is circumvented somehow then Firebase will still not allow it because of its security rules
    if (currentUser == null) {
        document.getElementById("submit--container").remove();
    }
    
    //get all comments linked to the post, in reality these should just all be an array inside the post document in the database (less reads) but by the time i realized i was 
    //already done with the system. i will rewrite it later
    db.collection("comments").orderBy("createdat", "desc").where("linkedto", "==", postID)
    .get()
    .then((querySnapshot) => {
        //if there are comments to load, remove any comments already laoded to reload them (so if the page isnt refreshed when comments are loaded dont have duplicates)
        if (querySnapshot.docs.length > 0) {
            var container = document.getElementById("comments--container");
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
        querySnapshot.forEach((doc) => {
            //for holding createdby and buttons (seen created below)
            const topBar = document.createElement("div");
            topBar.classList.add("comment--topbar");

            const createdby = document.createElement("p");
            createdby.classList.add("comment--title");
            createdby.innerText = doc.data().createdbydisp + "(";

            //make the actual email in a span inside parenthesis for editing its style easily
            //make the default color of the actual email lighter
            const createdbyactual = document.createElement("span");
            createdbyactual.innerText = doc.data().createdbyactual;
            createdbyactual.setAttribute("style", "color: #888");
            createdby.appendChild(createdbyactual);

            const ender = document.createElement("p");
            ender.classList.add("comment--title");
            ender.innerText = ")";
            createdby.appendChild(ender);

            //load the colors, if no document exists and data is null then the elements will default to black
            db.collection("usercolor").doc(doc.data().createdUID).get().then((colorData) => {
                createdby.setAttribute("style", "display: inline; color: " + (colorData.data() || {color: "#000000"}).color + ";");
                ender.setAttribute("style", "display: inline; color: " + (colorData.data() || {color: "#000000"}).color + ";");
            } )
            .catch((error) => {
                // console.log(error);
                console.log(error);
            });
            
            topBar.appendChild(createdby);

            //the actual text, this is easy just set the innerText, of course we NEVER set innerHTML as that will allow code injection
            const p = document.createElement("p");
            p.classList.add("comment--text");
            p.innerText = doc.data().body;

            //if you are the user who posted the document or are Eli then create the edit and delete buttons
            if (currentUser != null && (doc.data().createdby == curName || currentUser.uid == "rsNNG9JlJjaZqgkla7dUI0p28RD2" || currentUser.uid == "ZsB7WbdO87X5oPNj8QkDSM8YOq53")){
                //create delete button and pass the doc id to deleteComment
                const deleteButton = document.createElement("btn");
                deleteButton.classList.add("comment--replybtn")
                deleteButton.setAttribute("onclick", "deleteComment('" + doc.id + "', this);");
    
                const deleteImg = document.createElement("img");
                deleteImg.setAttribute("src", "Images/BlackDelete.png");
                deleteImg.setAttribute("width", "20vh");
                deleteImg.setAttribute("height", "20vh");
                
                deleteButton.appendChild(deleteImg);
                topBar.appendChild(deleteButton);

                //create the edit button and pass the docId and text to editComment, the reason for passing the text is one less read
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

            //if your logged in then you can see the reply button
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

            //add the list item to the list with the attribute isComment so some general code knows to look in the comments collection in firebase
            const li = document.createElement("li");
            li.classList.add("comment--item");
            li.setAttribute("docId", doc.id);
            li.setAttribute("isComment", true);
            li.appendChild(topBar);
            li.appendChild(p);
            const element = document.getElementById("comments--container");
            element.appendChild(li);
            //get all the replies linked to the comments, like with the comments this should jsut be a subarray inside of the comments to cut down on reads and time taken
            //but that would require a rewrite i dont want to deal with
            db.collection("replies").orderBy("createdat", "desc").where("replyto", "==", doc.id)
            .get()
            .then((replySnapshot) => {

                replySnapshot.forEach((reply) => {
                    //add the list item to the list with the attribute isComment = false so some general code knows to look in the replies collection in firebase
                    const replyContainer = document.createElement("li");
                    replyContainer.classList.add("reply--item");
                    replyContainer.setAttribute("docId", reply.id);
                    replyContainer.setAttribute("isComment", false);
            
                    //if you are the user who posted the document or are Eli then create the edit and delete buttons
                    if (currentUser != null && (doc.data().createdby == curName || currentUser.uid == "rsNNG9JlJjaZqgkla7dUI0p28RD2" || currentUser.uid == "ZsB7WbdO87X5oPNj8QkDSM8YOq53")){
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
                    createdby.innerText = reply.data().createdbydisp + "(";
                    //make the actual email in a span inside parenthesis for editing its style easily
                    //make the default color of the actual email lighter
                    const createdbyactual = document.createElement("span");
                    createdbyactual.innerText = reply.data().createdbyactual;
                    createdbyactual.setAttribute("style", "color: #888");
                    createdby.appendChild(createdbyactual);
        
                    const ender = document.createElement("p");
                    ender.classList.add("comment--title");
                    ender.innerText = ")";
                    createdby.appendChild(ender);
        
                    //load the colors, if no document exists and data is null then the elements will default to black
                    db.collection("usercolor").doc(reply.data().createdUID).get().then((colorData) => {
                        console.log(colorData.data());
                        createdby.setAttribute("style", "margin: 0 0 0 0; color: " + (colorData.data() || {color: "#000000"}).color + ";");
                        ender.setAttribute("style", "display: inline; margin: 0 0 0 0; color: " + (colorData.data() || {color: "#000000"}).color + ";");
                    } )
                    .catch((error) => {
                        // console.log(error);
                        console.log(error);
                    });
                    
        
                    const p = document.createElement("p");
                    p.classList.add("comment--text");
                    p.innerText = reply.data().body;
        
                    //add reply contaienr as child of the comment its linked to
                    replyContainer.appendChild(createdby);
                    replyContainer.appendChild(p);
                    element.appendChild(replyContainer);
                    
                });

            }).catch((error) => {
                console.log(error);
            });

        });
        //finished loading so show the body
        document.getElementsByTagName("body")[0].classList.remove("hidden");
    })
    .catch((error) => {
        console.log(error)
    });
}

//create the textfield and submit button to be able to edit the post
function editPost(docId, postBody){
    //hide the body text so its not showing when editing (the edit field in effect takes its place)
    const bodyContainer = document.getElementById("body--container");
    bodyContainer.setAttribute("style", "display: none;");

    var parentElement = bodyContainer.parentNode;
    var submitContainer = document.getElementById("submit--container");
    var mainChildren = parentElement.children;
    //we need this so that the edit field container is actually inside the reply contaienr and not at the bottom of all the commenta
    var parentIndex = Array.prototype.indexOf.call(mainChildren, parentElement);
    
    var newContainer = submitContainer.cloneNode(true);
    newContainer.setAttribute("id", "editpost--container");
    newContainer.classList.add("editpost--container");

    //set up the input field to how we want and set its value to what was submited in the post before
    newContainer.querySelector("#bodyfield").innerText = postBody;
    newContainer.querySelector("#bodyfield").classList.add("edit--input");
    newContainer.querySelector("#bodyfield").setAttribute("style", "width: 75vw;");
    newContainer.querySelector("#bodyfield").setAttribute("id", "editpostfield");

    //submit the post
    var submitButton = newContainer.querySelector("#submit");
    submitButton.classList.add("reply--submit");
    submitButton.setAttribute("onclick", "submitPostEdit('" + docId + "');")

    //will close the edit field
    var cancelButton = submitButton.cloneNode(true);
    cancelButton.classList.remove("greenbutton");
    cancelButton.classList.remove("redbutton");
    cancelButton.innerText = "Cancel";
    cancelButton.setAttribute("onclick", "closeEditPostField()");

    submitButton.parentNode.appendChild(cancelButton);

    const centerParent = document.createElement("center");
    centerParent.appendChild(newContainer);

    //inserts it into the reply field so its where it should be
    parentElement.insertBefore(centerParent, mainChildren[parentIndex + 3]);
}

//Destroy any objects with the id editpost--container and reshows the body text
function closeEditPostField() {
    const editContainer = document.getElementById("editpost--container");
    editContainer.parentNode.remove();

    const bodyContainer = document.getElementById("body--container");
    bodyContainer.setAttribute("style", "margin: 5vw;");
}

//Changes the doc in the blogposts collection with the passed in id to have a different body value based on the editpostfield's value
function submitPostEdit(docID){
    var editText =  document.getElementById("editpostfield").innerText
    db.collection("blogposts").doc(docID).set({
        body: editText
        //use merge=true so that only te body field is overwriten
    }, { merge: true }).then(() => {
        alert("Post edited succesfully!");
        location.reload();
    } )
    .catch((error) => {
        console.log(error);
    });
}

//Submit a new comment with the value input in the comment field to firebase linked to the current post's id (stored in session storage)
function submitComment() {
    //unix timestamp for easiest sorting by time created
    var docID = Date.now();
    var linkedTo = sessionStorage.getItem("currentID");
    var body = document.getElementById("bodyfield").innerText;
    document.getElementById("bodyfield").innerText = "";
    if (body != null && body != "") {
    // Add a new document in collection "comments"
    db.collection("comments").add({
        body: body,
        createdbydisp: curName,
        createdbyactual: currentUser.email.split('@')[0],
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
          console.log(error);
      });
    }else{
        alert("Comment text empty");
    }

}

//Basically the same as submit comment but with the replyto field being the comment you clickd on, and the collection your setting the doc in being replies
function submitReply(docId) {
    var newDocId = Date.now();
    var title = sessionStorage.getItem("currentPage");
    var body = document.getElementById("replyfield").innerText;
    if (body != null && body != "") {
    // Add a new document in collection "cities"
    db.collection("replies").add({
        body: body,
        createdbydisp: curName,
        createdbyactual: currentUser.email.split('@')[0],
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
          console.log(error);
      });
    }else{
        alert("Reply text empty");
    }
}

//Construct the reply field at the appropriate location
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

    //put the reply field below the comment it is replying to
    parentElement.parentNode.insertBefore(newContainer, commentContainerChildren[parentIndex + 1]);
}

//destory any reply--cotnaienr objects
function closeReplyField() {
    var oldReplyContainer = document.getElementById("reply--container");
    if (oldReplyContainer != null){
        oldReplyContainer.remove();
    }
}

//deletes a post from the blogposts collection, as well as deleting all comments that are linked to that blogpost and all replies replying to thsoe comments
function deletePost(docID){
    //delete the post
    db.collection("blogposts").doc(docID).delete().then(() => {
        db.collection("comments").where("linkedto", "==", docID)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((comment) => {
                //delete the comment
                db.collection("comments").doc(comment.id).delete();
                db.collection("replies").where("replyto", "==", comment.id)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((reply) => {
                        //delete the reply
                        db.collection("replies").doc(reply.id).delete();
                    })
                })
            })
        })
    alert("Dey-ley-tey");
    location.href = "index.html";
    }).catch((error) => {
        console.log(error);
    });
}

//delete a comment or reply (general purpose function) using the attribute iscomment to chekc what type
function deleteComment(docID, buttonElement){
    var parentElement = buttonElement.parentNode.parentNode;
    var commentContainerChildren = parentElement.parentNode.children;

    var start = Array.prototype.indexOf.call(commentContainerChildren, parentElement)
    var i = start + 1;

    while(commentContainerChildren.length > i && commentContainerChildren[i].classList.contains("reply--item")){
        i++;
    }

    //gets all children below the comment until the next comment (to remove all the replies)
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

//remove a comment or reply from the databse (using the attirbute "iscomment"), if ignoreMessage = true then dont show an alert (used when batch deleting replies)
function removeCommentItem(element, ignoreMessage) {
    //if attribute "iscomment" is "true" then delete from comments collection, if not then delete from replies collection
    if (element.getAttribute("iscomment") == "true") {
        db.collection("comments").doc(element.getAttribute("docID")).delete().then(() => {
            if (ignoreMessage == false){
                alert("Deleted your comment!");
            }
        }).catch((error) => {
            console.log(error);
        });
    }else{
        db.collection("replies").doc(element.getAttribute("docID")).delete().then(() => {
            if (ignoreMessage == false){
                alert("Deleted your reply!");
            }
        }).catch((error) => {
            console.log(error);
        });
    }
}

//construct the comment edit field
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

    //put the edit field inside the comment container
    parentElement.appendChild(newContainer);
}

//construct the reply edit field
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

    //put the edit container inside the reply container
    parentElement.appendChild(newContainer);
}

//remove all editreply--container objects
function closeEditReplyField() {
    var oldEditContainer = document.getElementById("editreply--container");
    if (oldEditContainer != null){
        oldEditContainer.remove();
    }
}

//change just the body of a reply with the id of docID to the reply edit field's value
function submitReplyEdit(docID){
    var editText =  document.getElementById("editreplyfield").innerText
    db.collection("replies").doc(docID).set({
        body: editText
        //change just the body text with merge = true and nothing else
    }, { merge: true }).then(() => {
        alert("Reply edited succesfully!");
        location.reload();
    } )
    .catch((error) => {
        console.log(error);
    });
}

//destroy all edit--container objects
function closeEditField() {
    var oldEditContainer = document.getElementById("edit--container");
    if (oldEditContainer != null){
        oldEditContainer.remove();
    }
}

//change just the body of a comment with the id of docID to the comment edit field's value
function submitEdit(docID){
    var editText =  document.getElementById("editfield").innerText
    db.collection("comments").doc(docID).set({
        body: editText
    //change just the body text with merge = true and nothing else
    }, { merge: true }).then(() => {
        alert("Comment edited succesfully!");
        location.reload();
    } )
    .catch((error) => {
        console.log(error);
    });
}

//like a post
function likePost(btnElement){
    btnElement.classList.toggle("press");
    
    //if the button is now pressed like it, otherwise remove a like
    if(btnElement.classList.contains("press")) {
        //if your signed in and the psotlikes array does not include the user (just in case they somehow click like twice we don't want them to like it twice)
        if (currentUser != null && (postLikes == undefined || !postLikes.includes(currentUser.uid))) {
            //if the array is null then instantiate it with just the users uid, otherwise add the user's uid to the array
            if (postLikes == undefined) {
                postLikes = [currentUser.uid];
            }else{
                postLikes.push(currentUser.uid);
            }
            updatePostLikes();
        }
    }else{
        //if the array isn't empty and includes the user's id (if they somehow unlike it twice withotu liking it)
        if (postLikes.length > 0 && postLikes.includes(currentUser.uid)) {
            const index = postLikes.indexOf(currentUser.uid);
            if (index > -1) {
                postLikes.splice(index, 1); // 2nd parameter means remove one item only
            }
            updatePostLikes();
        } 
    }
}

//update the likes in firebase with the array
function updatePostLikes() {
    db.collection("blogposts").doc(sessionStorage.getItem("currentID")).set({
        likedby: postLikes
        //with merge = true, override only the likedby field
    }, { merge: true }).then(() => {
        document.getElementById("likedbycount").innerText = "Likes: " + postLikes.length;
    } )
    .catch((error) => {
        console.log(error);
    });
}