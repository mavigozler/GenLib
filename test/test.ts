"use strict";


const markup = "CH<sub>3</sub>COOH";

function quickMarkupToDocObjects(markup: string): string[]  {
	const markupRE = /\s*(<(\w+)(\s+(\w+="[^"]+")+)*>)|([^<]+)|(<\/\w+>)/gm;
	const parsedMarkup = RegExp(markupRE).exec(markup);
	const filteredParseMarkup = parsedMarkup!.filter((item, index, array) => {
		// Remove undefined elements and elements that are not strings
		if (item === undefined || typeof item !== "string")
			return false;
		// Remove duplicate string elements
		return index === array.indexOf(item);
	});
	return filteredParseMarkup;
}

quickMarkupToDocObjects(markup);