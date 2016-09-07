// Game object
let game = {
	// "Static" vars
	questionArr: [],

	// Game state vars
	wins: 0,
	losses: 0,
	unanswered: 0,

	// Sound effect settings
	currentSfx: false,
	sfxOn: true,
	
	// Methods
	initialize: function(data) {
		// Store sheets data in local array
		game.questionArr = data;

		// Stop the loading text, start a new game (true for the first game)
		game.loadingScreen("done");
		game.newGame(true);
	},

	// Animates the loading ... until the Google Sheets data is loaded
	loadingScreen: function(status) {
		if (typeof this.interval == "undefined") { this.interval = setInterval(animate, 200); }
		if (status == "done") { clearInterval(this.interval); }

		function animate() {
			if (typeof animate.count == "undefined") { animate.count = 0; }

			if (animate.count < 3) {
				$("#game h2").append(" .");
				animate.count++;
			} else {
				$("#game h2").html("Loading");
				animate.count = 0;
			}
		}
	},

	newGame: function(firstTime) {
		// Resets win/loss/unanswered totals on new game
		game.wins = game.losses = game.unanswered = 0;
		
		// Display the start button when game is first loaded, "Play again?" every other time
		if (firstTime) {
			$("#game").html("<br/><br/><br/>");
			$("<button>").addClass("btn btn-lg").text("Start").attr("id","start").appendTo("#game");
		} else {
			$("<button>").addClass("btn btn-lg").text("Play again?").attr("id","start").appendTo("#game");
		}

		// Shrink large logo, clear game text, show the first question
		$("#start").on("click", function(event){
			$("#logo").css("width", "200px")
			$("#game_title").empty();
			game.showQuestion(0);
		});
	},

	showQuestion: function(questionNum) {
		let currQ = game.questionArr[questionNum];  // Current question object
		let timer = setInterval(countdown, 1000);   // Countdown timer
		let secondsLeft = 30;
		let gameHtml = "";

		// Display the text and buttons for the current question
		gameHtml += "<h4>Time Remaining: <span id='timer'>30</span> Seconds</h4><br/>"
		gameHtml += "<h3>" + currQ.quesText + "</h3><br/>"
		gameHtml += "<button id='ans_A' class='btn btn-primary btn-large bottom-margin answer' value='a'>" + currQ.ansA + "</button><br/>"
		gameHtml += "<button id='ans_B' class='btn btn-primary btn-large bottom-margin answer' value='b'>" + currQ.ansB + "</button><br/>"
		gameHtml += "<button id='ans_C' class='btn btn-primary btn-large bottom-margin answer' value='c'>" + currQ.ansC + "</button><br/>"
		gameHtml += "<button id='ans_D' class='btn btn-primary btn-large bottom-margin answer' value='d'>" + currQ.ansD + "</button><br/>"
		$("#game").html(gameHtml);

		// Click handler for buttons
		$(".answer").on("click", function(event) {
			// Stop countdown timer
			clearInterval(timer);

			
			if ($(this).val() == currQ.corrAns) { endQuestion("correct"); }
			else { endQuestion("wrong"); }
		});

		// Countdown timer callback function
		function countdown() {
			secondsLeft--;
			$("#timer").html(secondsLeft);
			if (secondsLeft < 1) {
				clearInterval(timer);
				endQuestion("timeUp");
			}
		}

		function endQuestion(outcome) {
			$("#game").empty();
			// $("#game").html("<h4>Time Remaining: <span id='timer'>" + secondsLeft + "</span> Seconds</h4>");

			// Display proper text depending on correct/wrong/no answer
			switch (outcome) {
				case "correct":
					$("#game").append("<h3>Correct!</h3><br/>");
					game.wins++;
					break;
				case "wrong":
					$("#game").append("<h3>Nope!</h3>");
					$("#game").append("<h4>The correct answer was: <strong>" + rightAns() + "</strong></h4><br/>");
					game.losses++;
					break;
				default:
					$("#game").append("<h3>Time's Up!</h3>");
					$("#game").append("<h4>The correct answer was: <strong>" + rightAns() + "</strong></h4><br/>");
					game.unanswered++;
					break;
			}

			// Show the image associated with the current question
			$("#game").append("<img style='height: 280px;' src='" + currQ.image + "'><br/><br/>");

			// Show the additional info text for the current question (if any)
			$("#game").append("<h4>" + currQ.info + "</h4>")

			// Wait 6 sec until showing the next question
			setTimeout(nextQuestion, 6000);

			// Returns the correct answer for display
			function rightAns() {
				switch (currQ.corrAns) {
					case "a": return currQ.ansA;
					case "b": return currQ.ansB;
					case "c": return currQ.ansC;
					case "d": return currQ.ansD;
				}
			}
		}
		
		function nextQuestion() {
			// If this is the last question, end the game
			questionNum++;
			if (questionNum == game.questionArr.length) { endGame(); }
			else { game.showQuestion(questionNum); }
		}

		function endGame() {
			$("#game").html("<h3>All done! Here's how you did:</h3><br/>");
			$("#game").append("<h4>Correct answers: " + game.wins + "<h4/>");
			$("#game").append("<h4>Incorrect answers: " + game.losses + "<h4/>");
			$("#game").append("<h4>Unanswered: " + game.unanswered + "<h4/><br/>");

			// Show the play again button (false for play again instead of start)
			game.newGame(false);
		}
	}
};

$(function() {
	// Load music on start
	$("#music").trigger("load");
	$("#music").prop("volume", 0.05);
	$("#music").trigger("play");

	// Start the loading animation
	game.loadingScreen("loading");

    // Music toggle button
	$("#music_toggle").on("click", function(event){
		// Play if paused, pause if playing
		if ($("#music").prop("paused")) {
			$("#music").trigger("play");
			$("#music_text").html("Playing");
		} else {
			$("#music").trigger("pause");
			$("#music_text").html("Paused");
		}
	});

	// Sfx toggle button
	// $("#sfx_toggle").on("click", function(event){
	// 	if (game.sfxOn) {
	// 		game.sfxOn = false;
	// 		$("#sfx_text").html("Off");
	// 	} else {
	// 		game.sfxOn = true;
	// 		$("#sfx_text").html("On");
	// 	}
});