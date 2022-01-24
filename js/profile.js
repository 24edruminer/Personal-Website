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
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(errorCode + ": " + errorMessage);
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
      localStorage.setItem("userCredential", userCredential.user);
      alert("Signed in!");
      location.href="index.html";
      currentUser = userCredential.user;
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(errorCode + ": " + errorMessage);
    });
  }else{
    alert("Already signed in!");
  }
}

function deleteaccount() {
  if (confirm('Are you sure you want to delete your account?')) {
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      alert("Deleted!")
      localStorage.setItem("userCredential", null);
      currentUser = null;
    }).catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(errorCode + ": " + errorMessage);
    });
  } else {
    // Do nothing!
    console.log('Thing was not saved to the database.');
  }
}

function logout() {
  if (currentUser != null) {
    localStorage.setItem("userCredential", null);
    currentUser = null;
    alert("Logged out!");
  }else{
    alert("Not currently signed in!");
  }
}