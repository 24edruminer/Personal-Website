function signup() {
  if (currentUser == null){
    firebase.auth().createUserWithEmailAndPassword(document.getElementById("namefield").value, document.getElementById("passfield").value)
    .then((userCredential) => {
      // Signed in 
      firebase.auth().currentUser.sendEmailVerification()
      .then(() => {
        alert("Created and signed in!");
        location.href="index.html";
        currentUser = userCredential.user;
        localStorage.setItem("userCredential", userCredential.user);
    });
    })
    .catch((error) => {
      logFirebaseError(error);
    });
  }else{
    alert("Already signed in!");
  }
}

function login() {
  if (currentUser == null){
    firebase.auth().signInWithEmailAndPassword(document.getElementById("namefield").value, document.getElementById("passfield").value)
    .then((userCredential) => {
      // Signed in
      alert("Signed in!");
      location.href="index.html";
    })
    .catch((error) => {
      logFirebaseError(error)
    });
  }else{
    alert("Already signed in!");
  }
}

function deleteaccount() {
  if (confirm('Are you sure you want to delete your account?')) {
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      alert("Deleted!");
      logout();
    }).catch((error) => {
      logFirebaseError(error)
    });
  } else {
    // Do nothing!
    console.log('Thing was not saved to the database.');
  }
}

function logout() {
  if (currentUser != null) {
    firebase.auth().signOut().then(() => {
      alert("Logged out!");
      var navbar = document.getElementsByClassName("navbar")[0];
      console.log(navbar);
      console.log(navbar.lastChild);
      navbar.children[navbar.children.length - 1].innerText = "Profile";
      if (navbar.children.length == 3){
        navbar.children[1].remove();
      }
    }).catch((error) => {
      logFirebaseError(error)
    });

  }else{
    alert("Not currently signed in!");
  }
}