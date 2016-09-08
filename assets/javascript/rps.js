// Initialize Firebase
var config = {
    apiKey: "AIzaSyCaujo8Z57oFB1qlN1Ljvyo669yREpDICA",
    authDomain: "my-firebase-project-28ec7.firebaseapp.com",
    databaseURL: "https://my-firebase-project-28ec7.firebaseio.com",
    storageBucket: "",
};
firebase.initializeApp(config);

// Executes on every update to Firebase data
firebase.database().ref().on("value", function(snapshot) {
	let p1active = snapshot.child("players/1/name").exists();
	let p2active = snapshot.child("players/2/name").exists();

	if (!game.started) {
		if (!sessionStorage.getItem("player")) {
			 if (!p1active) {
				sessionStorage.setItem("player", 1);
			} else if (!p2active) {
				sessionStorage.setItem("player", 2);
			} else {
				$("#test").html("<h3>Sorry, game is full!</h3>");
			}
		} else if (sessionStorage.getItem("player") == 1) {
			p1active = false;
		} else {
			p2active = false;
		}
	}

	game.started = true;

	if (p1active) {
		$("#name_p1" ).html(snapshot.child("players/1/name").val());
		$("#count_p1").html("Wins: " + snapshot.child("players/1/wins").val() + " Losses: " + snapshot.child("players/1/losses").val()).addClass("vis");
	}

	if (p2active) {
		$("#name_p2" ).html(snapshot.child("players/2/name").val());
		$("#count_p2").html("Wins: " + snapshot.child("players/2/wins").val() + " Losses: " + snapshot.child("players/2/losses").val()).addClass("vis");
	}

	if ((p1active && sessionStorage.getItem("player") == 1) || (p2active && sessionStorage.getItem("player") == 2)) {
		game.chatEnabled = true;
	}

	// If any errors are experienced, log them to console. 
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});

// If chats are added
firebase.database().ref("chat").on("child_added", function(snapshot) {
	$("#chat").append(snapshot.val());
	$("#chat_input").val("");

// If any errors are experienced, log them to console. 
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});

// Game object
let game = {
	// Properties
	chatEnabled: false,
	rpsArr: ["Rock", "Paper", "Scissors"],
	started: false,
	
	// Methods
	init: function(data){
		
	}
};

$(function() {
	// Sets player name/wins/losses and shows player win/loss count
	$("#submit").on("click", function(event){
		const player = sessionStorage.getItem("player") || 0;
		const name = $("#name").val().trim();
		let loc = "players/" + player;

		if (player != 0 && name != "") {
			firebase.database().ref(loc + "/name").set(name);
			firebase.database().ref(loc + "/wins").set(0);
			firebase.database().ref(loc + "/losses").set(0);

			$("#name_button").html("<h4>Hi " + name + "! You are Player " + player + "</h4>");
			$("#name_p" + player).html(name);
		}
	});

	// Allows name entry on enter
	$("#name").keypress(function(event) {
		if (event.which == 13) {
			$("#submit").click();
		}
	});

	// Adds text to chat
	$("#chat_send").on("click", function(event){
		if (game.chatEnabled) {
			firebase.database().ref().once("value").then(function(snapshot) {
				let playerNum = sessionStorage.getItem("player");
				let playerName = snapshot.child("players/" + playerNum + "/name").val();
				let textColor = playerNum == 1 ? "green" : "purple";

				firebase.database().ref("chat").push("<span style='color: " + textColor + ";'>" + playerName + ": " + $("#chat_input").val().trim() + "</span><br/>");
			});
		}
	});

	// Allows chat entry on enter
	$("#chat_input").keypress(function(event) {
		if (event.which == 13) {
			$("#chat_send").click();
		}
	});

	// game.init();
});