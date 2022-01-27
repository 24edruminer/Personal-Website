function postcreationLoad() {
    console.log(currentUser);
    if (currentUser == null) {
        alert("Begone... you venture to a place more desolate than the one to which you have been exiled.")
        location.href = "index.html";
    }
    var dispName = currentUser.displayName || currentUser.email.split("@")[0];

    if (dispName != "erumi321" && dispName != "24edruminer") {
      alert("Begone... you venture to a place more desolate than the one to which you have been exiled.")
      location.href = "index.html";
    }
}

function submitNewPost() {
  var docID = Date.now();
  var title = document.getElementById("titlefield").value;
  var body = document.getElementById("bodyfield").innerText;
  console.log(body);
  var dispName = currentUser.displayName || currentUser.email.split("@")[0];
  // Add a new document in collection "cities"
  db.collection("blogposts").doc(title).set({
    title: title,
    body: body,
    createdby: dispName,
    createdat: docID
  })
  .then(() => {
    alert("Document successfully written!");
    if (confirm("See the new post now?")){
      sessionStorage.setItem("currentPage", title);
      console.log(sessionStorage.getItem("currentPage"))
      location.href = "blogPost.html";
    }
    console.log("Document successfully written!");
  })
  .catch((error) => {
    logFirebaseError(error)
  });
}