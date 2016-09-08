// Initialize Firebase
var config = {
    apiKey: "AIzaSyCaujo8Z57oFB1qlN1Ljvyo669yREpDICA",
    authDomain: "my-firebase-project-28ec7.firebaseapp.com",
    databaseURL: "https://my-firebase-project-28ec7.firebaseio.com",
    storageBucket: "",
};
firebase.initializeApp(config);

// Executes on every update to player data
firebase.database().ref("players").on("value", function(snapshot) {
	let p1active = snapshot.child("1/name").exists();
	let p2active = snapshot.child("2/name").exists();

	// If Player 1 is present, update & show text
	if (p1active) {
		game.player1Name = snapshot.child("1/name").val();
		$("#name_p1").html(snapshot.child("1/name").val());
		$("#count_p1").html("Wins: " + snapshot.child("1/wins").val() + " Losses: " + snapshot.child("1/losses").val()).removeClass("invis");
	}

	// If Player 2 is present, update & show text
	if (p2active) {
		game.player2Name = snapshot.child("2/name").val();
		$("#name_p2").html(snapshot.child("2/name").val());
		$("#count_p2").html("Wins: " + snapshot.child("2/wins").val() + " Losses: " + snapshot.child("2/losses").val()).removeClass("invis");
	}

	// If both players present and game has not already been started, start game
	if (p1active && p2active && !game.playersReady) {
		game.playersReady = true;
		game.init();
	}

	// Progress game as each choice is made (choice 2 calls getWinner(), and then players/winner exists which calls showWinner())
	if (snapshot.child("1/choice").exists()) { game.playerTurn(2); }
	if (snapshot.child("winner").exists()) { game.showWinner(); }

	// If player disconnects, reset game state, update game text, clear chat, show disconnected message
	// Condition: playersReady is true and one or more players is not connected
	if ((!p1active || !p2active) && game.playersReady) {

		// Only trigger disconnect event for player that is still connected
		if ((p1active && game.player == 1) || (p2active && game.player == 2)) {
			const otherPlayer = game.player == 1 ? 2 : 1;

			game.playersReady = false;

			$("#name_p" + otherPlayer).html("Waiting for Player " + otherPlayer);
			$("#count_p" + otherPlayer).addClass("invis");
			$("#game_status").html("<h4>Waiting for other player to join.<h4>");
			$(".rps-p" + game.player).addClass("invis");

			firebase.database().ref("chat").remove();

			$("#chat").append("<span>Player " + otherPlayer + " has disconnected.</span><br/>");
		}
	}

	// If neither player is connected (new game), clear chat
	if (!p1active && !p2active) {
		firebase.database().ref("chat").remove();
	}

	// If any errors are experienced, log them to console. 
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});

// If chats are added
firebase.database().ref("chat").on("child_added", function(snapshot) {
	// Places text with color based on whether it came from this player or the other player
	const textColor = game.player == snapshot.val().player ? "green" : "purple";
	$("#chat").append("<span style='color: " + textColor + "'>" + snapshot.val().text + "</span><br/>");
	
	// Scrolls chat window down automatically with each input
	let chat = document.getElementById("chat");
	chat.scrollTop = chat.scrollHeight;

	$("#chat_input").val("");

// If any errors are experienced, log them to console. 
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});

// Game object
let game = {
	// Properties
	player: undefined,  // Number of this player
	player1Name: undefined,
	player2Name: undefined,
	playersReady: false,  // Guard for starting game
	
	// Methods
	init: function(){
		game.playerTurn(1);
	},

	disconnect: function(){
		firebase.database().ref("players/" + game.player).remove();
	},

	playerTurn : function(player){
		if (game.player == player) {
			$("#game_status").html("<h4>It's your turn!<h4>");
			$(".rps-p" + game.player).removeClass("invis");
		} else {
			const otherPlayerName = game.player == 1 ? game.player2Name : game.player1Name;

			$("#game_status").html("<h4>Waiting for " + otherPlayerName + " to choose.</h4>");
			$(".rps-p" + game.player).addClass("invis");
		}
	},

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
	// Chooses player 1/2, set player name/wins/losses
	$("#submit").on("click", function(event){
		firebase.database().ref("players").once("value").then(function(snapshot){
			if (!snapshot.child("1/name").exists()) {
				game.player = 1;
			} else if (!snapshot.child("2/name").exists()) {
				game.player = 2;
			} else {
				$("#name_button").html("<h3>Sorry, game is full!</h3>");
			}

			const playerName = $("#name").val().trim();
			const loc = "players/" + game.player;

			// Only create player in database if player slot was available and a valid name was entered
			if (game.player && playerName != "") {
				firebase.database().ref(loc).set({
					name: playerName,
					wins: 0,
					losses: 0
				});

				$("#name_button").html("<h4>Hi " + playerName + "! You are Player " + game.player + "</h4>");

				// Only show if you are player 1 and you are not connecting to an existing game (there is no player 2)
				if (game.player == 1 && !snapshot.child("2/name").exists()) { $("#game_status").html("<h4>Waiting for other player to join.<h4>"); }
			}
		});
	});
	// Allows name entry on enter
	$("#name").keypress(function(event) {
		if (event.which == 13) {
			$("#submit").click();
		}
	});

	// Adds text to chat (only when both players are present)
	$("#chat_send").on("click", function(event){
		if (game.playersReady && $("#chat_input").val().trim() != "") {
			const playerName = game.player == 1 ? game.player1Name : game.player2Name;
			
			firebase.database().ref("chat").push({
				text: playerName + ": " + $("#chat_input").val().trim(),
				player: game.player
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

$(window).on("beforeunload", function(event){
	game.disconnect();
});