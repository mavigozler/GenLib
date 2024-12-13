"use strict";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function consoleColors(
	txt: string,
	fcolor: "red" | "green" | "yellow" | "blue" | "purple" | "cyan",
	options? : {
		bcolor?: "red" | "green" | "yellow" | "blue" | "purple" | "cyan",
		makeForeBright?: boolean;
		makeBackBright?: boolean;
		includeReset?: boolean;
	}
): string {
	let val: number = 0,
		str: string = "\u001b[1;";

	switch (fcolor) {
	case "red":
		val += 31;
		break;
	case "green":
		val += 32;
		break;
	case "yellow":
		val += 33;
		break;
	case "blue":
		val += 34;
		break;
	case "purple":
		val += 35;
		break;
	case "cyan":
		val += 36;
		break;
	}
	if (options && options.makeForeBright == true)
		val += 60;
	str += val + "m";
	if (options && options.bcolor) {
		val = 0;
		str += "\u001b[1;";
		switch (fcolor) {
		case "red":
			val += 41;
			break;
		case "green":
			val += 42;
			break;
		case "yellow":
			val += 43;
			break;
		case "blue":
			val += 44;
			break;
		case "purple":
			val += 45;
			break;
		case "cyan":
			val += 46;
			break;
		}
		if (options && options.makeBackBright == true)
			val += 60;
		str += val + "m";
	}
	str += txt;
	if (options && options.includeReset == true)
		str += "\u001b[0m";
	return str;
}