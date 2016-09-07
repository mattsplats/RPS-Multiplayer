// Game object
let game = {
	// Button enablers
	attackButtonEnabled: false,
	pickCharEnabled: false,
	pickDefenderEnabled: false,

	// Sound effect settings
	currentSfx: false,
	sfxOn: true,
	
	// Character vars
	characterArray: [],
	currentAttackPower: 0,
	defender: {},
	enemiesDefeated: 0,
	player: {},
	
	// Methods
	initialize: function(data) {
		// Store sheets data in local array
		this.characterArray = data;

		// Update character names and stats, convert all attack values to int
		for (let i = 0; i < data.length; i++) {
			$("#name_" + i).html(data[i].name);
			$("#hp_" + i).html(data[i].HP);
			this.characterArray[i].attack = parseInt(this.characterArray[i].attack);
		}

		// Ready to pick a player character
		this.pickCharEnabled = true;
	}
};

$(function() {
	// Load music on start
	$("#music").trigger("load");
	$("#music").prop("volume", 0.05);
	$("#music").trigger("play");

	// Character portraits
	$(".char-box").on("click", function(event){
		// 1st stage: no player character chosen
		if (game.pickCharEnabled) {
			
			// Store player stats (uses jQuery .extend to copy by value)
			let playerRef = game.characterArray[$(this).attr("value")];
			game.player = $.extend(true, {}, playerRef);
			game.currentAttackPower = game.player.attack;

			// Move all characters to enemies div, change background and border colors
			$(".char-box").appendTo($("#enemies"));
			$(".char-box").css({"background-color": "red", "border-color": "white"});

			// Move this character to player div, change background and border colors
			$(this).appendTo($("#player"));
			$(this).css({"background-color": "white", "border-color": "green"});

			// Enable picking the enemy to fight
			game.pickDefenderEnabled = true;

			// Disable picking again
			game.pickCharEnabled = false;

		} // 2nd stage: player chosen, pick an enemy to fight
		else if (game.pickDefenderEnabled) {
			
			// Store enemy (defender) stats (uses jQuery .extend to copy by value)
			let defenderRef = game.characterArray[$(this).attr("value")];
			game.defender = $.extend(true, {}, defenderRef);

			// Move this character to defender div, change background and text colors, remove existing battle text
			$(this).prependTo($("#defender"));
			$(this).css("background-color", "black");
			$("div", this).css("color", "white");
			$("#battle_text").empty();

			// Enable attacking
			game.attackButtonEnabled = true;

			// Disable picking again
			game.pickDefenderEnabled = false;
		}
	});

	// Attack button
	$("#attack").on("click", function(event){
		if (game.attackButtonEnabled) {

			// Reduce defender HP by currentAttackPower, update defender visible HP
			game.defender.HP -= game.currentAttackPower;
			$("#hp_" + game.defender.index).html(game.defender.HP);
			
			// If defender dead: hide defender, show appropriate text, increment enemiesDefeated 
			if (game.defender.HP <= 0) {
				$("#char_" + game.defender.index).css("visibility", "hidden");
				$("#battle_text").html("You have defeated " + game.defender.name + "!  You can choose to fight another enemy.");
				game.enemiesDefeated++;
				
				// If all enemies defeated: show appropriate text, show restart button
				if (game.enemiesDefeated > 2) {
					$("#battle_text").html("You Won!! GAME OVER!!");
					$("#restart").css("visibility", "visible");
				} else { // Else: disable attacking, enable picking new defender
					game.attackButtonEnabled = false;
					game.pickDefenderEnabled = true;
				}
			} else {

				// Reduce player HP by defender.counter, prevent player HP showing less than 0 (it looks bad!), update player visible HP
				game.player.HP -= game.defender.counter;
				if (game.player.HP <= 0) { game.player.HP = 0; }
				$("#hp_" + game.player.index).html(game.player.HP);

				// If player dead: show appropriate text, show restart button, disable attacking
				if (game.player.HP <= 0) {
					$("#battle_text").html("You have been defeated ... GAME OVER!");
					$("#restart").css("visibility", "visible");
					game.attackButtonEnabled = false;
				} // Else: Display both damage values
				else {
					$("#battle_text").html("You attacked " + game.defender.name + " for " + game.currentAttackPower + " damage.");
					$("#battle_text").append("<br/>" + game.defender.name + " attacked you back for " + game.defender.counter + " damage.");
				}
			}

			// Add base attack power to currentAttackPower
			game.currentAttackPower += game.player.attack;
			
		} else if (!game.attackButtonEnabled && game.pickDefenderEnabled){
			$("#battle_text").html("Nothing to attack.");
		}
	});

	// Restart button
	$("#restart").on("click", function(event){
		// Hide restart button after pressing
		$("#restart").css("visibility", "hidden");

		// Move all character divs back to choose_char (in original order)
		for (let i = 0; i < game.characterArray.length; i++) {
			$("#char_" + i).appendTo("#choose_char");
		}

		// Reset all character css values
		$(".char-box").css({"background-color": "white",
			"border-color": "green",
			"visibility": "visible"});
		$(".char-text").css("color", "black");

		// Reset all characters' HP to default
		for (let i = 0; i < game.characterArray.length; i++) {
			$("#hp_" + i).html(game.characterArray[i].HP);
		}

		// Clear battle text
		$("#battle_text").empty();

		// Reset game to starting state
		game.enemiesDefeated = 0;
		game.attackButtonEnabled = false;
		game.pickCharEnabled = true;
		game.pickDefenderEnabled = false;
	});

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
	// });
});