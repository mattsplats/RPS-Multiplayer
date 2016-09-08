// Initialize Firebase
var config = {
    apiKey: "AIzaSyCaujo8Z57oFB1qlN1Ljvyo669yREpDICA",
    authDomain: "my-firebase-project-28ec7.firebaseapp.com",
    databaseURL: "https://my-firebase-project-28ec7.firebaseio.com",
    storageBucket: "",
};
firebase.initializeApp(config);

// Executes on every update to Firebase data
firebase.database().ref("players").on("value", function(snapshot) {
	let p1active = snapshot.child("1/name").exists();
	let p2active = snapshot.child("2/name").exists();

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
		game.player1Name = snapshot.child("1/name").val();
		$("#name_p1").html(snapshot.child("1/name").val());
		$("#count_p1").html("Wins: " + snapshot.child("1/wins").val() + " Losses: " + snapshot.child("1/losses").val()).removeClass("invis");
	}

	if (p2active) {
		game.player2Name = snapshot.child("2/name").val();
		$("#name_p2").html(snapshot.child("2/name").val());
		$("#count_p2").html("Wins: " + snapshot.child("2/wins").val() + " Losses: " + snapshot.child("2/losses").val()).removeClass("invis");
	}

	if (p1active && p2active && !game.playersReady) {
		game.playersReady = true;
		game.init();
	}

	if (snapshot.child("1/choice").exists()) { game.playerTurn(2); }
	if (snapshot.child("winner").exists()) { game.showWinner(); }

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
	player1Name: "",
	player2Name: "",
	playersReady: false,
	rpsArr: ["Rock", "Paper", "Scissors"],
	started: false,
	
	// Methods
	init: function(data){
		game.playerTurn(1);
	},

	playerTurn : function(player){
		if (sessionStorage.getItem("player") == player) {
			$(".rps-p" + player).removeClass("invis");
			$("#game_status").html("<h4>It's your turn!<h4>");
		} else {
			let otherPlayerName = sessionStorage.getItem("player") == 1 ? game.player2Name : game.player1Name;

			$(".rps-p" + sessionStorage.getItem("player")).addClass("invis");
			$("#game_status").html("<h4>Waiting for " + otherPlayerName + " to choose.</h4>");
		}
	},

	// playerWaiting: function(player){
	// 	if (sessionStorage.getItem("player") == player) {
	// 		let otherPlayerName = player == 1 ? game.player2Name : game.player1Name;

	// 		$(".rps-p" + player).addClass("invis");
	// 		$("#game_status").html("<h4>Waiting for " + otherPlayerName + " to choose.</h4>");
	// 	}
	// },

	getWinner: function(player2Choice){
		firebase.database().ref("players").once("value").then(function(snapshot){
			if (snapshot.child("1/choice").val() == player2Choice) {
				firebase.database().ref("players/winner").set("0");

			} else if ((snapshot.child("1/choice").val() == "rock" && player2Choice == "scissors") || 
				(snapshot.child("1/choice").val() == "paper" && player2Choice == "rock") || 
				(snapshot.child("1/choice").val() == "scissors" && player2Choice == "paper")) {

				firebase.database().ref("players/1/wins").transaction(function(currentWins) { return currentWins + 1; });
				firebase.database().ref("players/2/losses").transaction(function(currentLosses) { return currentLosses + 1; });

				firebase.database().ref("players/winner").set("1");

			} else {
				firebase.database().ref("players/2/wins").transaction(function(currentWins) { return currentWins + 1; });
				firebase.database().ref("players/1/losses").transaction(function(currentLosses) { return currentLosses + 1; });

				firebase.database().ref("players/winner").set("2");
			}
		});
	},

	showWinner: function(){
		firebase.database().ref("players").once("value").then(function(snapshot){
			switch (snapshot.child("winner").val()) {
				case "0": $("#winner").html("<h2>It's a tie!</h2>"); break;
				case "1": $("#winner").html("<h2>" + snapshot.child("1/name").val() + " wins!</h2>"); break;
				case "2": $("#winner").html("<h2>" + snapshot.child("2/name").val() + " wins!</h2>"); break;
			}
		});

		setTimeout(resetGame, 2000);

		function resetGame(){
			$("#winner").html("");
			firebase.database().ref("players/1/choice").remove();
			firebase.database().ref("players/winner").remove();
			game.init();
		}
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
		if (game.playersReady) {
			firebase.database().ref("players").once("value").then(function(snapshot) {
				let playerNum = sessionStorage.getItem("player");
				let playerName = snapshot.child(playerNum + "/name").val();
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

	// Picks rock/paper/scissors choice for player 1
	$(".rps-p1").on("click", function(event){
		firebase.database().ref("players/1/choice").set($(this).data("choice"));
	});

	// Picks rock/paper/scissors choice for player 2
	$(".rps-p2").on("click", function(event){
		game.getWinner($(this).data("choice"));
	});
});