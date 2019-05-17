var time = new Date();
var currentTime = time.getTime();
var bukurl = null;
var namaUser = null;

function addAction(){
  var checkedValue4 = null;
  var aksi = document.getElementsByName("aksi");
  var aksiLain = document.getElementById("showdis1").value;
  for (var n = 0; aksi[n]; n++) {
    if (aksi[n].checked) {
      checkedValue4 = aksi[n].value;
      if (checkedValue4 == "lainnya") {
        checkedValue4 = aksiLain;
      }
    }
  }

  var db = firebase.firestore();
  var user = firebase.auth().currentUser;

  db.collection("action").add({
    action: checkedValue4,
    nama: namaUser,
    uid: user.email,
    created_at: currentTime,
    panitia_id: user.uid
  }).then(function () {
    alert(namaUser + " " + checkedValue4);

  }).catch(function (error) {
    alert("Error : " + error);
  })

}

function bolehNgescan() {
  var video = document.createElement("video");
  var canvasElement = document.getElementById("canvas");
  var canvas = canvasElement.getContext("2d");
  var loadingMessage = document.getElementById("loadingMessage");
  var outputContainer = document.getElementById("output");
  var outputMessage = document.getElementById("outputMessage");
  var outputData = document.getElementById("outputData");
  var namaku = document.getElementById("namaku");
  var vegeku = document.getElementById("vegeku");
  var alergiku = document.getElementById("alergiku");
  var sarapansahur = document.getElementById("sarapansahur");
  var makansiang = document.getElementById("makansiang");
  var netdin = document.getElementById("netdin");

  function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }


  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}}).then(function (stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });


  function tick() {
    loadingMessage.innerText = "⌛ Loading video..."
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      loadingMessage.hidden = true;
      canvasElement.hidden = false;
      outputContainer.hidden = false;

      /*canvasElement.height = 350;
      canvasElement.width = 350;*/
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        var emailYgSeharusnya = code.data;
        emailYgSeharusnya.replace(" ", "").toLowerCase();
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
        outputMessage.hidden = true;
        outputData.parentElement.hidden = false;
        code.data
        outputData.innerText = code.data;
        var user = firebase.auth().currentUser;
        var email_id = user.email;
        var db = firebase.firestore();
        $("#modalafter").modal();
        db.collection("panitia")
          .where("email", "==", code.data)
          .get()
          .then(function (doc) {
            console.log(doc.size);
            if (doc.size > 0) {
              doc.forEach(function (doc) {
                if (doc) {
                  namaUser = doc.data().nama;
                  console.log("Dia panitia nih bosqu " + namaUser);
                  namaku.innerText = namaUser;
                  vegeku.style.display = "none";
                  alergiku.style.display = "none";
                }
              })
            } else {
              console.log("Nah yg ini user biasa bosqu " + code.data);
              db.collection("user")
                .where("email", "==", code.data)
                .get()
                .then(function (doc) {
                  if (doc.size > 0) {
                    console.log(doc.size);
                    doc.forEach(function (doc) {
                      if (doc) {
                        namaUser = doc.data().nama;
                        console.log(namaUser);
                        namaku.innerText = namaUser;
                        if (doc.data().vege) {
                          vegeku.innerText = "Vegetarian: Ya";
                        }
                        if (!doc.data().vege) {
                          vegeku.innerText = "Vegetarian: Tidak";
                        }

                        alergiku.innerText = "Alergi: " + doc.data().alergi;

                        if (doc.data().puasa) {
                          makansiang.style.display = "none"
                        }
                        if (!doc.data().puasa) {
                          sarapansahur.style.display = "none";
                        }

                        if (doc.data().net_dinner) {
                          netdin.style.display = "block";
                        }
                        if (!doc.data().net_dinner) {
                          netdin.style.display = "none";
                        }

                      } else {
                        console.log("Document not found");
                      }
                    })
                  } else {
                    console.log("document ga masuk");
                    document.getElementById("isapp").innerHTML = "Belum terdaftar";
                    document.getElementById("isiform_div").style.display = "block";
                  }
                }).catch(function (error) {
                console.log("Error getting document: ", error);
              });
            }
          }).catch(function (error) {
          console.log("Error getting document: ", error);
        });
      } else {
        outputMessage.hidden = false;
        outputData.parentElement.hidden = true;
      }
    }
    requestAnimationFrame(tick);
  }
}

function ngecekMasukGa() {
  var qrcode = null;
  document.getElementById("isiform_div").style.display = "none";
  document.getElementById("qrcode").style.display = "none";

  firebase.auth().onAuthStateChanged(function (users) {
    if (users) {
      console.log("Udh masuk cuy");
      // User is signed in.

      document.getElementById("user_div").style.display = "flex";
      /*document.getElementById("login_div").style.display = "none";*/

      var user = firebase.auth().currentUser;
      var email_id = user.email;
      document.getElementById("welcome-user").innerHTML = email_id;
      var db = firebase.firestore();
      db.collection("panitia")
        .where("email", "==", email_id)
        .get()
        .then(function (doc) {
          console.log(doc.size);
          if (doc.size > 0) {
            doc.forEach(function (doc) {
              if (doc) {
                console.log("Dia panitia nih bosqu" + email_id);
                bolehNgescan();
                document.getElementById("isapp").innerHTML = "Panitia";
                qrcode = new QRCode(document.getElementById("qrcode"), {
                  width: 128,
                  height: 128,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.H
                });
                qrcode.makeCode(email_id);
                document.getElementById("qrcode").style.display = "flex";
                document.getElementById("btnscan").style.display = "inline-block";
              }
            })
          } else {
            console.log("Nah yg ini user biasa bosqu " + email_id);
            db.collection("user")
              .where("email", "==", email_id)
              .get()
              .then(function (doc) {
                console.log(doc.size);
                if (doc.size > 0) {
                  doc.forEach(function (doc) {
                    if (doc) {
                      console.log("test " + doc);
                      document.getElementById("isiform_div").style.display = "none";
                      var app = doc.data().approve;
                      if (app == true) {
                        console.log("jason");
                        document.getElementById("isapp").innerHTML = "Terdaftar";
                        qrcode = new QRCode(document.getElementById("qrcode"), {
                          width: 128,
                          height: 128,
                          colorDark: "#000000",
                          colorLight: "#ffffff",
                          correctLevel: QRCode.CorrectLevel.H
                        });
                        qrcode.makeCode(email_id);
                        document.getElementById("qrcode").style.display = "flex";
                      }
                      if (app == false) {
                        console.log("arrival");
                        document.getElementById("isapp").innerHTML = "Proses verifikasi";
                        document.getElementById("qrcode").style.display = "none";
                      }
                      return;
                      if (doc == null) {
                        console.log("ga ketemu bro");
                      }
                    } else {
                      console.log("Document not found");
                    }
                  })
                } else {
                  console.log("document ga masuk");
                  document.getElementById("isapp").innerHTML = "Belum terdaftar";
                  document.getElementById("isiform_div").style.display = "block";
                }

              }).catch(function (error) {
              console.log("Error getting document: ", error);
            });
          }
        }).catch(function (error) {
        console.log("Error getting document: ", error);
      });

    } else {
      // No user is signed in.

      /*document.getElementById("user_div").style.display = "none";*/
      document.getElementById("login_div").style.display = "flex";

    }
  });
}


function login() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  if (userPass === "") {
    alert("Password can not be empty");
    return;
  }

  if (userPass.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass)
    .then(function () {
      document.getElementById("login_div").style.display = "none";
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      //If user is not in the system create User
      firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).then(function () {
        document.getElementById("login_div").style.display = "none";
        document.getElementById("isiform_div").style.display = "flex";
        document.getElementById("isapp").innerHTML = "Belum terdaftar";
      })
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          window.alert("Error : " + errorMessage);
        });

    });

}

function logout() {
  firebase.auth().signOut();
  document.getElementById("user_div").style.display = "none";
  document.getElementById("qrcode").style.display = "none";
  document.getElementById("isiform_div").style.display = "none";
}

function addUser() {
  var namaLengkap = document.getElementById("namaLengkap").value;
  var check = null;
  var jk = document.getElementsByName("jk");
  for (var j = 0, length = jk.length; j < length; ++j) {
    if (jk[j].checked) {
      check = jk[j].value;
      break;
    }
  }
  var passport = document.getElementById("noPassport").value;
  /*var checkedValue = null;*/
  var statArray = [];
  var stat = document.getElementsByName("stat");
  for (var i = 0; i < stat.length; ++i) {
    if (stat[i].checked) {
      statArray.push(stat[i].value);
    }
  }

  var kota = document.getElementById("kota").value;
  var negara = document.getElementById("negara").value;
  var uni = document.getElementById("univ").value;
  var jurusan = document.getElementById("jurusan").value;
  var checkedValue1 = null;
  var puasa = document.getElementsByName("puasa");
  for (var k = 0; puasa[k]; k++) {
    if (puasa[0].checked) {
      checkedValue1 = true;
    } else {
      checkedValue1 = false;
    }
  }

  var checkedValue2 = null;
  var vege = document.getElementsByName("vege");
  for (var l = 0; vege[l]; l++) {
    if (vege[0].checked) {
      checkedValue2 = true;
    } else {
      checkedValue2 = false;
    }
  }

  var checkedValue3 = null;
  var alergiLain = document.getElementById("showdis").value;
  var alergi = document.getElementsByName("alergi");
  for (var m = 0; alergi[m]; m++) {
    if (alergi[m].checked) {
      checkedValue3 = alergi[m].value;
      if (checkedValue3 == "Lainnya") {
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
  /*alert(namaLengkap + " " + check + " " + passport + " " + statArray + " " + kota + " " + negara + " " + uni + " " + jurusan
    + " " + checkedValue1 + " " + checkedValue2 + " " + checkedValue3 + " " + nohp + " " + wechat + " " + wa + " " + bukurl);*/

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
  }).then(function () {
    alert("Data berhasil dikirim!");
    document.getElementById("isapp").innerHTML = "Proses verifikasi";
    document.getElementById("qrcode").style.display = "none";
    document.getElementById("isiform_div").style.display = "none";
  }).catch(function (error) {
    alert("Error : " + error);
  })
}

/*var bukti = document.getElementById("bukti");
bukti.onchange = uploadImg();*/

function uploadImg() {

  var storageRef = firebase.storage().ref();
  var buktiTransferRef = storageRef.child("/bukti_transfer/" + currentTime + ".jpg");
  var file = document.getElementById("bukti").files[0];
  if (!file) {
    alert("No file");
    return;
  }
  new Compressor(file, {
    quality: 0.2,
    success(result) {
      alert("compressed");
      var upload = buktiTransferRef.put(result);
      upload.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
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
      }, function (error) {
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
      }, function () {
        upload.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          bukurl = downloadURL;
        })
      })
    }
  })
}
