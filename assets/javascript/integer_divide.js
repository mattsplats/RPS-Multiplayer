function myFunction() {
	x = parseInt(document.getElementById("x").value);
	y = parseInt(document.getElementById("y").value);

	document.getElementById("output").innerHTML = divide(x, y);
}

function divide(x, y) {
	// Exception handling
	if (isNaN(x) || isNaN(y)) { return "Error: Please enter numbers" }
	if (y == 0) { return "Error: Cannot divide by 0!"; }

	// Break execution for boundary cases
	if (x == y) { return "1 remainder 0" }
	if (x < y && x >= 0 && y >= 0) { return "0 remainder " + x; }
	if (x > y && x <= 0 && y <= 0) { return "0 remainder " + x; }

	// Result and its accumulator
	var quotient = 0;
	var add_to_quotient;

	// Value for divisor (y) padded with trailing zeros
	var y_padded;

	// Loop counter
	var subtract_count;

	// Sign handling: adds sign to result if (x is negative XOR y is negative) is true (one or the other ints is negative, but not both)
	var sign = "";
	if (!(x < 0) != !(y < 0)) { sign = "-"; }

	// Makes sure all values are positive prior to main loop
	x = Math.abs(x);
	y = Math.abs(y);

	// Main loop: pad y, subtract until y_padded > x, add counts to quotient, repeat until y > x
	while (x >= y)
	{
		add_to_quotient = "";
		y_padded = y.toString();
		subtract_count = 0;

		// Pad y_padded with trailing zeros up to one less length than x
		// Add padding zeros to quotient accumulator
		while (y_padded.toString().length < (x.toString().length - 1)) {
			y_padded += "0";
			add_to_quotient += "0";
		}

		// Subtract y_padded from x until y_padded > x
		y_padded = parseInt(y_padded);
		while (x >= y_padded) {
			x -= y_padded;
			subtract_count++;
		}

		// Add total subtractions to quotient accumulator
		add_to_quotient = subtract_count.toString() + add_to_quotient;

		// Add accumulator to quotient
		quotient += parseInt(add_to_quotient);
	}

	// Return result
	return sign + quotient + " remainder " + x;
}