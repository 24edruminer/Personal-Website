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
          });
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
  }