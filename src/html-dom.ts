"use strict";


export { getCheckedInput, setCheckedInput, removeChildren, replaceSpanText,
	quickMarkupToDocObjects, makeSelectList, createRadioNode
 };

 type voidFunction = () => void;
/**
 * @function getCheckedInput -- returns the value of a named HTML input object representing radio choices
 * @param {HtmlInputDomObject} inputObj -- the object representing selectabe
 *     input: radio, checkbox
 * @returns {primitive data type | array | null} -- usually numeric or string representing choice from radio input object
 */
function getCheckedInput(inputObj: HTMLInputElement | RadioNodeList): null | string | string[] {
	if ((inputObj as RadioNodeList).length) { // multiple checkbox
		const checked: string[] = [];

		for (const cbox of inputObj as RadioNodeList)  // this is a checkbox type
			if ((cbox as HTMLInputElement).checked == true)
				checked.push((cbox as HTMLInputElement).value);
		if (checked.length > 0) {
			if (checked.length == 1)
				return checked[0];
			return checked;
		}
		return null;
	} else if ((inputObj as HTMLInputElement).type == "radio")  // just one value
		return inputObj.value;
	return null;
}

/**
* @function setCheckedInput -- will set a radio object programmatically
* @param {HtmlRadioInputDomNode} inputObj   the INPUT DOM node that represents the set of radio values
* @param {primitive value} value -- can be numeric, string or null. Using 'null' effectively unsets/clears any
*        radio selection
& @returns boolean  true if value set/utilized, false otherwise
*/
function setCheckedInput(
	inputObj: HTMLInputElement | RadioNodeList,
	inputValue: string | null
): boolean {
	if ((inputObj as RadioNodeList).length && inputValue != null && Array.isArray(inputValue) == true) {  // a checked list
		if (inputValue.length && inputValue.length > 0) {
			for (const val of inputValue)
				for (const cbox of inputObj as RadioNodeList)
					if ((cbox as HTMLInputElement).value == val)
						(cbox as HTMLInputElement).checked = true;
		} else
			for (const cbox of inputObj as RadioNodeList)
				if ((cbox as HTMLInputElement).value == inputValue as string) {
					(cbox as HTMLInputElement).checked = true;
					return true;
				}
	} else if (inputValue != null) {
		inputObj.value = inputValue as string;
		return true;
	}
	return false;
}

function removeChildren(htmlElem: HTMLElement) {
	while (htmlElem.firstChild)
		htmlElem.removeChild(htmlElem.firstChild);
}


function makeSelectList(
	selAttribs: {[key: string]: string | voidFunction},
	optVals: string[],
	optText: string[],
	optAttribs: {[key: string]: string | voidFunction} | null
): HTMLSelectElement {
	let i,
		optionElem: HTMLOptionElement;
/*
	if (selAttribs != null && selAttribs instanceof Array == false)
		throw "makeSelectList(): attributes for <select> element must be string array";
	if (optVals != null && optVals instanceof Array == false)
		throw "makeSelectList(): values for <option> elements must be string array";
	if (optText instanceof Array == false)
		throw "makeSelectList(): text for options if present must be string array";
	if  (optVals.length > 1 && optVals.length != optText.length)
		throw "makeSelectList(): the values and text for <option> element must be equal"; */
	const selectElem = document.createElement("select");
	if (selAttribs)
		for (const property in selAttribs) {
			if (property != "change" && property != "click")
				selectElem.setAttribute(property, selAttribs[property] as string);
			else
				selectElem.addEventListener(property, selAttribs[property] as voidFunction);
		}

	if (optAttribs)
		for (i = 0; i < optText.length; i++) {
			optionElem = document.createElement("option");
			// optAttribs is array of strings, attribs for all options
			for (const property in optionElem) {
				if (property != "change" && property != "click")
					optionElem.setAttribute(property, optAttribs[property] as string);
				else
					optionElem.addEventListener(property, optAttribs[property] as voidFunction);
			}

			if (optVals) {
				if (optVals.length == 1)
					optionElem.value = optVals[0];
				else
					optionElem.value = optVals[i];
			}
			optionElem.appendChild(document.createTextNode(optText[i]));
			selectElem.appendChild(optionElem);
		}
	return selectElem;
}

function replaceSpanText(
	spanId: string, // id attrib of span to have text replaced
	spanElemMarkup: string,
	xmlDoc: Document,
	spanCount?: number, // number of spans to have content replace
				// id must be "id{num + 1}" format
): void {
	const newSpanElemContent: Node = quickMarkupToDocObjects(
		spanElemMarkup, xmlDoc
	) as Node;
	let spanElem: HTMLSpanElement | null;
	if (!spanCount) {
		if ((spanElem = xmlDoc.getElementById(spanId)) == null)
			return; // TODO   this must be an error condition set somewhere
		while (spanElem!.firstChild)
			spanElem.removeChild(spanElem!.firstChild);
		spanElem.appendChild(newSpanElemContent as Node);
		spanElem.style.display = "inline";
	} else // this is a special case of multiple span elements of same type
		for (let i = 0; i < spanCount; i++) {
			const newSpanElemContentClone = newSpanElemContent?.cloneNode(true);
			spanElem = xmlDoc.getElementById(`${spanId}${(i + 1)}`) as HTMLSpanElement;
			while (spanElem!.firstChild)
				spanElem!.removeChild(spanElem!.firstChild);
			spanElem!.appendChild(newSpanElemContentClone as Node);
		}
}

function createRadioNode(
	formName: string,
	inputText: string,
	parentElem?: HTMLElement
): HTMLSpanElement | void {
	const containingSpan: HTMLSpanElement = document.createElement("span");
	containingSpan.className = "radio-elem";
	const inputElem: HTMLInputElement = document.createElement("input");
	containingSpan.appendChild(inputElem);
	inputElem.type = "radio";
	inputElem.name = formName;
	containingSpan.appendChild(document.createTextNode(inputText));
	if (!parentElem)
		return containingSpan;
	parentElem.appendChild(containingSpan);
}

// not as tested as it should be yet on very complex markup
function quickMarkupToDocObjects(markup: string, doc: Document): DocumentFragment | null {
	const markupRE = /\s*(<(\w+)(\s+(\w+="[^"]+")+)*>)|([^<]+)|(<\/\w+>)/gm,
		markupStack: string[] = [],  // standard push pop stuff
		docFrag: DocumentFragment = doc.createDocumentFragment();

	let inTag: boolean = false,
		elemLevel = 0;
	let workingElem: HTMLElement = docFrag as Node as HTMLLIElement;
	const parsedMarkup = convertCharacterEntities(markup).match(markupRE);
	for (const item of parsedMarkup!)
		if (item.charAt(0) == "<") {
			const elemWord = item.match(/<\/?(\w+)/)![1];
			if (item.charAt(1) != "/") {
				markupStack.push(elemWord);
				if (item.search(/>$/) < 0)
					inTag = true;
				const newElement = doc.createElement(elemWord);
				workingElem.appendChild(newElement);
				workingElem = newElement;
				elemLevel++;
			} else { // inElement == true, so should be etago
				if (elemWord !== markupStack.pop())
					return null;
				workingElem = workingElem.parentNode as HTMLElement;
				elemLevel--;
			}
		} else if (inTag == true) { // attr
			if (typeof workingElem !== "undefined") {
				const attribPair = item.split("=");
				workingElem.setAttribute(attribPair[0], attribPair[1]);
			}
		} else { // inTag == false
			if (elemLevel > 0)
				workingElem?.appendChild(doc.createTextNode(item));
			else
				docFrag.appendChild(doc.createTextNode(item));
		}
	return docFrag;
}

function convertCharacterEntities(markup: string): string {
	if (typeof markup == "number")
		markup = (markup as number).toString();
	if (markup.search(/&(\w+);/) < 0)
		return markup;
	return markup.replace(/&(\w+);/g, (match, entity) => {
		return charEntities[entity] !== undefined ? charEntities[entity] : match;
	});
}

const charEntities: {[key: string]: string;} = {
	"nbsp":   "\u00a0",  "cent":    "\u00a2", "sect":   "\u00a7", "uml":    "\u00a8",
	"copy":   "\u00a9",  "deg":     "\u00b0", "plusmn": "\u00b1", "micro":   "\u00b5",
	"frac14": "\u00bc",  "frac12":  "\u00bd", "frac34": "\u00be", "times":   "\u00d7",
	"divide": "\u00f7",  "bull":    "\u2022", "prime":  "\u2032", "larr":    "\u2190",
	"rarr":   "\u2192",  "sum":     "\u2211", "minus":  "\u2212", "radic":   "\u221a",
	"infin":  "\u221e",  "ne":      "\u2260", "le":     "\u2264", "ge":      "\u2265",
	"quot":   "\u0022",  "amp":     "\u0026", "lt":     "\u003c", "gt":      "\u003e",
	"mdash":  "\u2014",  "lsquo":   "\u2018", "rsquo":  "\u2019", "ldquo":   "\u201c",
	"rdquo":  "\u201d",  "euro":    "\u20ac", "permil": "\u2030", "uuml":    "\u00fc",
	"Uuml":   "\u00dc",  "Ouml":    "\u00d6", "ouml":   "\u00f6", "ntilde":  "\u00f1",
	"eacute": "\u00e9",  "oacute":  "\u00f3", "ccedil": "\u00e7", "Ccedil":  "\u00c7",
	"Alpha":  "\u0391",  "alpha":   "\u03b1", "beta":   "\u03b2", "gamma":   "\u03b3",
	"delta":  "\u03b4",  "epsilon": "\u03b5", "zeta":   "\u03b6", "eta":     "\u03b7",
	"theta":  "\u03b8",  "iota":    "\u03b9", "kappa":  "\u03ba", "lambda":  "\u03bb",
	"mu":     "\u03bc",  "nu":      "\u03bd", "xi":     "\u03be", "omicron": "\u03bf",
	"pi":     "\u03c0",  "rho":     "\u03c1", "sigmaf": "\u03c2", "sigma":   "\u03c3",
	"tau":    "\u03c4",  "upsilon": "\u03c5"
}