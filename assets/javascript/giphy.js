// Game object
let demo = {
	// Properties
	buttonArr: ["dog", "cat", "rabbit", "hamster", "cow"],
	currentButton: "",
	giphyObj: {},
	randomArr: [],
	
	// Methods
	init: function(data){
		for (let i = 0; i < demo.buttonArr.length; i++) {
			demo.addButton(demo.buttonArr[i]);
		}
		for (let i = 0; i < 100; i++) {
			demo.randomArr[i] = i;
		}
	},

	addButton: function(item){
		$("#buttons").append("<button class='btn btn-primary btn-giphy small_margin' data-item=" + item + ">" + item + "</button>");
	},

	showGif: function(index){
		// Create div for gif with proper still and animate sources
		let template = "<div class='large_margin'>" + 
			"<p>Rating: " + (demo.giphyObj.data[index].rating.toUpperCase() || "unknown") + "<br/>" + 
			"<img src='" + demo.giphyObj.data[index].images.fixed_height_still.url + "' " + 
				"data-still='" + demo.giphyObj.data[index].images.fixed_height_still.url + "' " +
				"data-animate='" + demo.giphyObj.data[index].images.fixed_height.url + "' " +
				"data-state='still' " +
				"class='gif-pause'>"
			"</div>";

		// Append the new div
		$("#gifs").append(template);
	},

	randomizeGifOrder: function(){
		let j, temp;
		for (let i = 0; i < 99; i++) {
			j = Math.floor(Math.random() * (100 - i)) + i;
			temp = demo.randomArr[i];
			demo.randomArr[i] = demo.randomArr[j];
			demo.randomArr[j] = temp;
		}
	}
};

$(function() {
	// Creates new buttons
	$("#add_button").on("click", function(event){
		let btnText = $("#button_text").val().trim();

		if (btnText != "" && demo.buttonArr.indexOf(btnText) == -1) {
			demo.buttonArr.push(btnText);
			demo.addButton(btnText);
			$("#button_text").val("");
		}
	});

	// Allows new button creation on enter
	$("#button_text").keypress(function(event) {
		if (event.which == 13) {
			$("#add_button").click();
		}
	});

	// Diplays gifs according to button search term
	$(document.body).on('click', '.btn-giphy', function(event){
		$("#gifs").empty();

		if (demo.currentButton != $(this).data("item")){
			
			demo.currentButton = $(this).data("item");
			demo.clickCount = 0;
			demo.randomizeGifOrder();

			$.ajax({
	            url: "https://api.giphy.com/v1/gifs/search",
	            method: 'GET',
	            data: {
	            	q: demo.currentButton,
	            	api_key: "dc6zaTOxFJmzC",
	            	limit: "100"
	            }
	        })
	        .done(function(response) {
	        	demo.giphyObj = response;

	        	for (let i = demo.clickCount; i < demo.clickCount + 10; i++) {
		    		demo.showGif(demo.randomArr[i]);
		    	}
	        });

		} else {
			demo.clickCount += 10;
			if (demo.clickCount == 100) {
				demo.clickCount = 0;
				demo.randomizeGifOrder();
			}

			for (let i = demo.clickCount; i < demo.clickCount + 10; i++) {
	    		demo.showGif(demo.randomArr[i]);
	    	}
		}
	});

	// Pause function for gifs
	$(document.body).on('click', '.gif-pause', function(event){
		if ($(this).data("state") == "still"){
			$(this).attr("src", $(this).data("animate"));
			$(this).data("state", "animate");
		} else {
			$(this).attr("src", $(this).data("still"));
			$(this).data("state", "still");
		}
	});

	demo.init();
});