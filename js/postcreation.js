//General load to kick out any users that aren't Eli, even if thsi fails the database still won't allow any post submissions except from my uids
function postcreationLoad() {
    if (currentUser == null) {
        alert("Begone... you venture to a place more desolate than the one to which you have been exiled.")
        location.href = "index.html";
    }
    
    if (currentUser.uid != "rsNNG9JlJjaZqgkla7dUI0p28RD2" && currentUser.uid != "ZsB7WbdO87X5oPNj8QkDSM8YOq53") {
      alert("Begone... you venture to a place more desolate than the one to which you have been exiled.")
      location.href = "index.html";
    }
}

//Add the document
function submitNewPost() {
  //Unix timestamp (easiest way to sort by time created)
  var docID = Date.now();
  var title = document.getElementById("titlefield").value;
  var body = document.getElementById("bodyfield").innerText;

  var dispName = curName;

  db.collection("blogposts").add({
    title: title,
    body: body,
    createdby: dispName,
    createdat: docID
  })
  .then((doc) => {
    console.log(doc);
    alert("Document successfully written!");
    if (confirm("See the new post now?")){
      sessionStorage.setItem("currentPage", title);
      sessionStorage.setItem("currentID", doc.id);
      
      location.href = "blogPost.html";
    }
    console.log("Document successfully written!");
  })
  .catch((error) => {
    console.log(error);
    alert(error);
  });
}
