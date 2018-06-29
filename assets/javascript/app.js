var config = {
    apiKey: "AIzaSyDPhDCrc-kTb8GCNJCzqT8ysK00OM_dbJA",
    authDomain: "trainscheduler-1ebeb.firebaseapp.com",
    databaseURL: "https://trainscheduler-1ebeb.firebaseio.com",
    projectId: "trainscheduler-1ebeb",
    storageBucket: "",
    messagingSenderId: "538400275586"
};
firebase.initializeApp(config);

var database = firebase.database();

// starting values
var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = 0;
var currentTime = moment();
var index = 0;
var trainIDs = [];

// Show current time
var datetime = null,
date = null;

var update = function () {
  date = moment(new Date())
  datetime.html(date.format('dddd, MMMM Do YYYY, h:mm:ss a'));
};

$(document).ready(function(){
  datetime = $('#current-status')
  update();
  setInterval(update, 1000);
});


// on click capture
$("#add-train").on("click", function() {

  // getting values from text boxes
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrainTime = $("#train-time").val().trim();
  frequency = $("#frequency").val().trim();
  
  // math help and momentJS help via a google search...
  // initial time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");

  // difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

  // remainder
  var tRemainder = diffTime % frequency;

  // maaaaath
  var minutesAway = frequency - tRemainder;

  // more maaaath
  var nextTrain = moment().add(minutesAway, "minutes");

  // Arrival time
  var nextArrival = moment(nextTrain).format("hh:mm a");

  var nextArrivalUpdate = function() {
    date = moment(new Date())
    datetime.html(date.format('hh:mm a'));
  }

  // push handler
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    minutesAway: minutesAway,
    nextArrival: nextArrival,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
  

  // empty inputs
  $("#train-name").val("");
  $("#destination").val("");
  $("#train-time").val("");
  $("#frequency").val("");
  
  // no refreshing
  return false; 
});


// This will only show the 15 latest entries
  database.ref().orderByChild("dateAdded").limitToLast(15).on("child_added", function(snapshot) {



  // show in the html
  $("#new-train").append("<tr><td>" + snapshot.val().trainName + "</td>" +
    "<td>" + snapshot.val().destination + "</td>" + 
    "<td>" + "Every " + snapshot.val().frequency + " mins" + "</td>" + 
    "<td>" + snapshot.val().nextArrival + "</td>" +
    "<td>" + snapshot.val().minutesAway + " mins until arrival" + "</td>" +
    "</td></tr>");

  index++;

  // handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  //pushes trains to an array
  database.ref().once('value', function(dataSnapshot){ 
    var trainIndex = 0;

      dataSnapshot.forEach(
          function(childSnapshot) {
              trainIDs[trainIndex++] = childSnapshot.key();
          }
      );
  });

  console.log(trainIDs);
