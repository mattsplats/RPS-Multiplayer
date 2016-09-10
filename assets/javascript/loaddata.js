// Immediately sets lower music volume, if music is present
if (document.getElementById("music")) { document.getElementById("music").volume = 0.05; }

// Selects correct Sheet for this page
function pickSheet() {
	switch (document.title) {
		case "Portfolio: Hangman Game": return "https://docs.google.com/spreadsheets/d/1t91WBYfhh9FKVT2IRz8G_1cx8G1EkyfFQlk-AMPFwcQ/pubhtml";
		case "Portfolio: RPG Game": return "https://docs.google.com/spreadsheets/d/1EPiay7SHpXI9I8G0IBa3zopHllaSjkMsuOn56e6Ejsw/pubhtml";
		case "Portfolio: Trivia Game": return "https://docs.google.com/spreadsheets/d/1AUuyeJsK2XWLMXTRtyX2FB0kFU81dPRZX0fTC_7IgnM/pubhtml";
	}
}

// Pulls in Google sheets data, calls startGame once data is ready
Tabletop.init(
	{
		key: pickSheet(),
		callback: startGame,
		simpleSheet: true
	});

// Initializes game
function startGame(data) {
	game.initialize(data);
}