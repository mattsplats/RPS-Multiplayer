// Initialize Firebase
var config = {
    apiKey: "AIzaSyCaujo8Z57oFB1qlN1Ljvyo669yREpDICA",
    authDomain: "my-firebase-project-28ec7.firebaseapp.com",
    databaseURL: "https://my-firebase-project-28ec7.firebaseio.com",
    storageBucket: "",
};
firebase.initializeApp(config);

// Executes on every update to players data
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
		game.playerTurn(1);
	}

	// Progress game as each choice is made (choice 2 calls getWinner(), and then players/winner exists which calls showWinner())
	if (snapshot.child("1/choice").exists()) { game.playerTurn(2); }
	if (snapshot.child("winner").exists()) { game.showWinner(); }

	// If neither player is connected (new game), clear chat
	if (!p1active && !p2active) {
		firebase.database().ref("chat").remove();
	}

	// Log errors to console
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});


// Executes on deletions from players data
firebase.database().ref("players").on("child_removed", function(snapshot) {
	// If player disconnects, update game text, clear chat, show disconnected message, reset game state
	// Condition: if the removed object has a key of "name"
	if (snapshot.val().name) {
		let otherPlayer = game.player == 1 ? 2 : 1;

		// If the current player has not been assigned, then look at win/loss visibility
		if (!game.player) { otherPlayer = $("#count_p1").css("visibility") == "hidden" ? 2 : 1; }

		// Update all game text (if needed)
		$("#name_p" + otherPlayer).html("Waiting for Player " + otherPlayer);
		$("#count_p" + otherPlayer).addClass("invis");
		if ($("#game_status").html() != "") { $("#game_status").html("<h4>Waiting for other player to join.<h4>"); }
		$(".rps-p" + game.player).addClass("invis");

		// Delete chat log (new player incoming)
		firebase.database().ref("chat").remove();

		// Show disconnect message
		$("#chat").append("<span>Player " + otherPlayer + " has disconnected.</span><br/>");

		// Reset game state (not ready to play)
		game.playersReady = false;
	}

	// Log errors to console
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});


// If chats are added
firebase.database().ref("chat").on("child_added", function(snapshot) {
	// Places text with color based on whether it came from this player or the other player
	const textColor = game.player == snapshot.val().player ? "purple" : "green";
	$("#chat").append("<span style='color: " + textColor + "'>" + snapshot.val().text + "</span><br/>");
	
	// Scrolls chat window down automatically with each input
	let chat = document.getElementById("chat");
	chat.scrollTop = chat.scrollHeight;

	$("#chat_input").val("");

// Log errors to console
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
	// Sets up text and buttons for current player's turn
	playerTurn : function(player){
		if (game.player == player) {
			// if it's your turn, show selection buttons and indicate it's your turn
			$("#game_status").html("<h4>It's your turn!<h4>");
			$(".rps-p" + game.player).removeClass("invis");
		} else {
			// If not your turn, hide selection buttons and indicate other player is choosing
			const otherPlayerName = game.player == 1 ? game.player2Name : game.player1Name;

			$("#game_status").html("<h4>Waiting for " + otherPlayerName + " to choose.</h4>");
			$(".rps-p" + game.player).addClass("invis");
		}
	},

	// Determines and stores game winner
	getWinner: function(player2Choice){
		firebase.database().ref("players").once("value").then(function(snapshot){
			// On tie
			if (snapshot.child("1/choice").val() == player2Choice) {
				// Set winner to 0 (tie game)
				firebase.database().ref("players/winner").set("0");

			} // On player 1 win
			else if ((snapshot.child("1/choice").val() == "rock" && player2Choice == "scissors") || 
				(snapshot.child("1/choice").val() == "paper" && player2Choice == "rock") || 
				(snapshot.child("1/choice").val() == "scissors" && player2Choice == "paper")) {

				// Add to player 1 wins and player 2 losses
				firebase.database().ref("players/1/wins").transaction(function(currentWins) { return currentWins + 1; });
				firebase.database().ref("players/2/losses").transaction(function(currentLosses) { return currentLosses + 1; });

				// Set winner to 1 (player 1)
				firebase.database().ref("players/winner").set("1");

			} // On player 2 win
			else {
				// Add to player 2 wins and player 1 losses
				firebase.database().ref("players/2/wins").transaction(function(currentWins) { return currentWins + 1; });
				firebase.database().ref("players/1/losses").transaction(function(currentLosses) { return currentLosses + 1; });

				// Set winner to 2 (player 2)
				firebase.database().ref("players/winner").set("2");
			}
		});
	},

	// Shows game winner and starts next game
	showWinner: function(){
		firebase.database().ref("players").once("value").then(function(snapshot){
			// Show text on page depending on win/loss/tie
			switch (snapshot.child("winner").val()) {
				case "0": $("#winner").html("<h2>It's a tie!</h2>"); break;
				case "1": $("#winner").html("<h2>" + snapshot.child("1/name").val() + " wins!</h2>"); break;
				case "2": $("#winner").html("<h2>" + snapshot.child("2/name").val() + " wins!</h2>"); break;
			}

			// Remove previous game data if still present
			if (snapshot.child("1/choice").exists()) { firebase.database().ref("players/1/choice").remove(); }
			if (snapshot.child("winner").exists()) { firebase.database().ref("players/winner").remove(); }
		
			setTimeout(resetGame, 2000);

			// Start game over
			function resetGame(){
				$("#winner").html("");
				game.playerTurn(1);
			}
		});
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

// Remove player data on disconnect
$(window).on("beforeunload", function(event){
	firebase.database().ref("players/" + game.player).remove();
});