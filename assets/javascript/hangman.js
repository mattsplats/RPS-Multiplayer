var game = {
	// Variables
	activeWordList: [],
	currentImage: "",
	currentSfx: false,
	guessesRemaining: 10,
	lettersGuessed: "",
	staticWordList: [],
	sfxOn: true,
	winCount: 0,
	wordObject: {},
	wordStatus: "",

	// Methods
	checkGuess: function(guess) {
		// Only check guess if input is a letter (uses a regular expression)
		if (/[A-Z]/.test(guess)) {

			// Correct guess?
			if (this.wordObject.word.indexOf(guess) > -1) {
				this.correctGuess(guess);
			} else {
				this.wrongGuess(guess);
			}

			this.updateText();
		}
	},

	correctGuess: function(guess) {
		// Replace all letters that =guess in wordStatus with correct letter
		for (var i = 0; i < this.wordObject.word.length; i++) {
			if (this.wordObject.word.charAt(i) == guess) {
				this.wordStatus = this.wordStatus.substr(0, i) + guess + this.wordStatus.substr(i + 1);
			}
		}

		// Word complete?
		if (this.wordStatus == this.wordObject.word) {
			this.winCount++;
			this.updateImage();
			this.playSound("win");
			this.newWord();
		}
	},

	wrongGuess: function(guess) {
		// Ignore if the guess has already been made
		if (this.lettersGuessed.indexOf(guess) == -1) {
			var letterSpan;  // Used to add individual letters with strikethrough (and not a single line through all of them)

			// Add guess to lettersGuessed variable
			this.lettersGuessed += guess;

			// If lettersGuessed has 1 or more guesses, add trailing space as a separate (non-strikethrough) span
			// Else, remove existing space
			if (this.lettersGuessed.length > 1){
				var spaceSpan = document.createElement("span");
				spaceSpan.innerHTML = "&nbsp;&nbsp;";
				document.getElementById("lettersGuessed").appendChild(spaceSpan);
			} else {
				document.getElementById("lettersGuessed").innerHTML = "";
			}

			// Add guess (as a strikethrough span) to lettersGuessed div
			letterSpan = document.createElement("span");
			letterSpan.innerHTML = guess;
			letterSpan.setAttribute("class", "strikethrough");
			document.getElementById("lettersGuessed").appendChild(letterSpan);

			// Out of guesses?
			this.guessesRemaining--;
			if (this.guessesRemaining < 1) {
				this.updateImage();
				this.playSound("lose");
				document.getElementById("wordStatus").innerHTML = this.wordObject.word;
				this.newWord();
			} else {
				this.playSound("wrong");
			}
		}
	},

	playSound: function(outcome) {
		// Only play sounds if this.sfxOn is true
		if (this.sfxOn) {
			var effectList;
			var interrupt = true;

			// Set sound src based on outcome, interrupt if win/lose game sound
			if (outcome == "wrong") {
				effectList = ["assets/sfx/wrong_1.mp3", "assets/sfx/wrong_2.mp3", "assets/sfx/wrong_3.mp3"];
				interrupt = false;
			} else if (outcome == "lose") {
			    effectList = ["assets/sfx/fail_1.mp3", "assets/sfx/fail_2.mp3", "assets/sfx/fail_3.mp3"];
			} else {
				effectList = [this.wordObject.sfx || "assets/sfx/droids.mp3"];
			}

			// Pauses a sound effect for wrong letter (outcome == "wrong") so win/lose game sound can be heard
			if (interrupt) {
				if (this.currentSfx) { this.currentSfx.pause(); }
			}

			// Does not play sound effect for wrong letter if sound effect is already in progress
			if (!interrupt && this.currentSfx && !this.currentSfx.ended) {}
			else {
				// Choose sound effect at random from effectList and play it
				this.currentSoundEffect = new Audio(effectList[Math.floor(Math.random() * effectList.length)]);
				this.currentSfx = document.createElement('audio');
				this.currentSfx.src = effectList[Math.floor(Math.random() * effectList.length)];
				this.currentSfx.play();
			}
		}
	},

	updateText: function() {
		// Update all text fields (except lettersGuessed div, handled by wrongGuess)
		document.getElementById("winCount").innerHTML = this.winCount;
		document.getElementById("wordStatus").innerHTML = this.wordStatus;
		document.getElementById("guessesRemaining").innerHTML = this.guessesRemaining;
	},

	updateImage: function() {
		// Update currentImage (if wordObject.image == null, use default image)
		this.currentImage = this.wordObject.image || "assets/images/hangman/logo.png";

		// Trigger page reflow to re-run image animation (see https://css-tricks.com/restart-css-animation/)
		var image = document.getElementById("currentImage");
		var newImage = image.cloneNode(true);
		image.parentNode.replaceChild(newImage, image);
		newImage.src = this.currentImage;
	},

	newWord: function() {
		var newWordIndex;

		// If active list is empty, refill
		if (this.activeWordList.length < 1) {
			var emptyOffset = 0;  // Prevents a null object in the array

			// Copies elements of staticWordList to activeWordList
			for (var i = 0; i < this.staticWordList.length; i++) {

				// Prevents current word(Object) from being added to the new activeWordList (so it is not repeated)
				if (this.staticWordList[i].word != this.wordObject.word) {
					this.activeWordList[i - emptyOffset] = this.staticWordList[i];

					// Make sure all words are in upper case, even if Google Sheets values are not
					this.activeWordList[i - emptyOffset].word = this.activeWordList[i - emptyOffset].word.toUpperCase();

					// Add proper directory reference to all audio files
					if (this.activeWordList[i - emptyOffset].sfx) {
						this.activeWordList[i - emptyOffset].sfx = "assets/sfx/" + this.activeWordList[i - emptyOffset].sfx;
					}
				} else {
					emptyOffset++;
				}
			}
		}

		// Choose new word at random from active list
		newWordIndex = Math.floor(Math.random() * this.activeWordList.length);
		this.wordObject = this.activeWordList[newWordIndex];

		// Remove new word(Object) from active list
		this.activeWordList.splice(newWordIndex, 1);

		// Reset guessesRemaining, lettersGuessed, wordStatus
		this.guessesRemaining = 10;
		this.lettersGuessed = "";
		document.getElementById("lettersGuessed").innerHTML = "&nbsp;";
		this.wordStatus = this.wordObject.word.replace(/[A-Z]/g, "_");
	},

	initialize: function(data) {
		this.staticWordList = data;
		this.newWord();
		this.updateText();
	}
};

// Parse user input
document.onkeyup = function(event){
	var guess = String.fromCharCode(event.keyCode).toUpperCase();
	game.checkGuess(guess);
}

// Music toggle button
document.getElementById("musicToggle").onclick = function(event){
	var music = document.getElementById("music");

	// Play if paused, pause if playing
	if (music.paused) {
		music.play();
		document.getElementById("musicPlaying").innerHTML = "Playing";
	} else {
		music.pause();
		document.getElementById("musicPlaying").innerHTML = "Paused";
	}
}

// Sfx toggle button
document.getElementById("sfxToggle").onclick = function(event){

	// Toggle sound effects on/off
	if (game.sfxOn) {
		game.sfxOn = false;
		document.getElementById("sfxOn").innerHTML = "Off";
	} else {
		game.sfxOn = true;
		document.getElementById("sfxOn").innerHTML = "On";
	}
}