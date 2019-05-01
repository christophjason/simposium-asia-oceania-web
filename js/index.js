var time = new Date();
var currentTime = time.getTime();
var bukurl = null;

function ngecekMasukGa(){
  var qrcode = null;
  document.getElementById("isiform_div").style.display = "none";
  document.getElementById("qrcode").style.display = "none";

  firebase.auth().onAuthStateChanged(function(users) {
    if (users) {
      console.log("Udh masuk cuy")
      // User is signed in.

      document.getElementById("user_div").style.display = "flex";
      /*document.getElementById("login_div").style.display = "none";*/

      var user = firebase.auth().currentUser;
      var email_id = user.email;
      var userid = user.uid;
      document.getElementById("welcome-user").innerHTML = email_id;
      var db = firebase.firestore();
      db.collection("user")
        .where("uid", "==", userid)
        .get()
        .then(function(doc){
          if(doc.size > 0){
            doc.forEach(function(doc){
              if(doc){
                console.log("test " + doc);
                document.getElementById("isiform_div").style.display="none";
                var app = doc.data().approve;
                if(app == true){
                  console.log("jason");
                  document.getElementById("isapp").innerHTML = "Terdaftar";
                  qrcode = new QRCode(document.getElementById("qrcode"), {
                    width: 128,
                    height: 128,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                  });
                  qrcode.makeCode(userid);
                  document.getElementById("qrcode").style.display="flex";
                } if(app == false) {
                  console.log("arrival");
                  document.getElementById("isapp").innerHTML = "Proses verifikasi";
                  document.getElementById("qrcode").style.display="none";
                }
                return;
                if(doc == null){
                  console.log("ga ketemu bro");
                }
              } else {
                console.log("Document not found");
              }
            })
          } else {
            console.log("document ga masuk");
            document.getElementById("isapp").innerHTML = "Belum terdaftar";
            document.getElementById("isiform_div").style.display="block";
          }

        }).catch(function(error){
        console.log("Error getting document: ",error);
      });

    } else {
      // No user is signed in.

      /*document.getElementById("user_div").style.display = "none";*/
      document.getElementById("login_div").style.display = "flex";

    }
  });
}


function login(){

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  if (userPass === ""){
    alert("Password can not be empty");
    return;
  }

  if(userPass.length < 6){
    alert("Password must be at least 6 characters");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass)
    .then(function () {
      document.getElementById("login_div").style.display="none";
    })
    .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    //If user is not in the system create User
    firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).then(function(){
      document.getElementById("login_div").style.display="none";
      document.getElementById("isiform_div").style.display="flex";
      document.getElementById("isapp").innerHTML = "Belum terdaftar";
    })
      .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      window.alert("Error : " + errorMessage);
    });

  });

}

function logout(){
  firebase.auth().signOut();
  document.getElementById("user_div").style.display = "none";
  document.getElementById("qrcode").style.display="none";
  document.getElementById("isiform_div").style.display="none";
}

function addUser(){
  var namaLengkap = document.getElementById("namaLengkap").value;
  var check = null;
  var jk = document.getElementsByName("jk");
  for(var j = 0, length = jk.length; j<length; ++j){
    if(jk[j].checked){
      check = jk[j].value;
      break;
    }
  }
  var passport = document.getElementById("noPassport").value;
  /*var checkedValue = null;*/
  var statArray = [];
  var stat = document.getElementsByName("stat");
  for(var i = 0;i < stat.length; ++i){
    if(stat[i].checked){
      statArray.push(stat[i].value);
    }
  }

  var kota = document.getElementById("kota").value;
  var negara = document.getElementById("negara").value;
  var uni = document.getElementById("univ").value;
  var jurusan = document.getElementById("jurusan").value;
  var checkedValue1 = null;
  var puasa = document.getElementsByName("puasa");
  for(var k = 0; puasa[k]; k++){
    if(puasa[0].checked){
      checkedValue1 = true;
    } else {
      checkedValue1 = false;
    }
  }

  var checkedValue2 = null;
  var vege = document.getElementsByName("vege");
  for(var l = 0; vege[l]; l++){
    if(vege[0].checked){
      checkedValue2 = true;
    } else {
      checkedValue2 = false;
    }
  }

  var checkedValue3 = null;
  var alergiLain = document.getElementById("showdis").value;
  var alergi = document.getElementsByName("alergi");
  for(var m = 0; alergi[m]; m++){
    if(alergi[m].checked){
      checkedValue3 = alergi[m].value;
      if(checkedValue3 == "Lainnya"){
        checkedValue3 = alergiLain;
      }
    }
  }

  var nohp = document.getElementById("nohp").value;
  var wechat = document.getElementById("wechat").value;
  var wa = document.getElementById("wa").value;
  var bukti = document.getElementById("bukti");
  console.log("50%");

  var db = firebase.firestore();
  var user = firebase.auth().currentUser;
  alert(namaLengkap+" "+check+" "+passport+" "+statArray+" "+kota+" "+negara+" "+uni+" "+jurusan
    +" "+checkedValue1+" "+checkedValue2+" "+checkedValue3+" "+nohp+" "+wechat+" "+wa+" "+bukurl);

  db.collection("user").add({
    nama: namaLengkap,
    gender: check,
    no_passport: passport,
    status: statArray,
    kota: kota,
    negara: negara,
    universitas: uni,
    jurusan: jurusan,
    puasa: checkedValue1,
    vege: checkedValue2,
    alergi: checkedValue3,
    nohp: nohp,
    wechat: wechat,
    whatsapp: wa,
    bukti_url: bukurl,
    approve: false,
    created_at: currentTime,
    uid: user.uid
  }).then(function(){
    alert("Data berhasil dikirim!");
    document.getElementById("isapp").innerHTML = "Proses verifikasi";
    document.getElementById("qrcode").style.display="none";
    document.getElementById("isiform_div").style.display="none";
  }).catch(function(error){
    alert("Error : "+ error);
  })
}

/*var bukti = document.getElementById("bukti");
bukti.onchange = uploadImg();*/

function uploadImg(){

  var storageRef = firebase.storage().ref();
  var buktiTransferRef = storageRef.child("/bukti_transfer/" + currentTime + ".jpg");
  var file = document.getElementById("bukti").files[0];
  if(!file){
    alert("No file");
    return;
  }
  new Compressor(file, {
    quality: 0.2,
    success(result){
      alert("compressed");
      var upload = buktiTransferRef.put(result);
      upload.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot){
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function(error){
        switch (error.code) {
          case 'storage/unauthorized':
            alert("User unauthorized");
            break;

          case 'storage/canceled':
            alert("User cancelled the operation");
            break;

          case 'storage/unknown':
            alert("Unknown error occurred, inspect error.serverResponse");
            break;
        }
      }, function(){
        upload.snapshot.ref.getDownloadURL().then(function(downloadURL){
          bukurl = downloadURL;
        })
      })
    }
  })
}
