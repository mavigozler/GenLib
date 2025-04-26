"use strict";

export { getCheckedInput, setCheckedInput, removeChildren, replaceSpanText,
	quickMarkupToDocObjects, makeSelectList, createRadioNode, // renderTable,
	DataTable, replaceAllChildren
 };

type voidFunction = () => void;

//type renderTableHeaderObject = {
//	title: string;
//	style: string;
//};

/**
 * @function getCheckedInput -- returns the value of a named HTML input object representing radio choices
 * @param {HtmlInputDomObject} inputObj -- the object representing selectabe
 *     input: radio, checkbox
 * @returns {primitive data type | array | null} -- usually numeric or string representing choice from radio input object
 */
function getCheckedInput(inputObj: HTMLInputElement | RadioNodeList): null | string | string[] {
	if ((inputObj as RadioNodeList).length) { // multiple checkbox
		const checked: string[] = [];

		(inputObj as RadioNodeList).forEach((listNode) => {
			if ((listNode as HTMLInputElement).checked == true)
				checked.push((listNode as HTMLInputElement).value);
		})
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
				(inputObj as RadioNodeList).forEach((listItem) => {
					if ((listItem as HTMLInputElement).value == val)
					(listItem as HTMLInputElement).checked = true;
				});
		} else
			((inputObj as RadioNodeList).forEach((listItem) => {
				if ((listItem as HTMLInputElement).value == inputValue as string)
					(listItem as HTMLInputElement).checked = true;
			}));
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

function replaceAllChildren(node: HTMLElement, newMarkup: string) {
	removeChildren(node);
	node.innerHTML = newMarkup;
	return node;
}

/**
 * 
 * @param selAttribs -- object with key value pairs for attributes of the select element
 * @param optVals -- array of values for the option
 * @param optText -- array of text for the option
 * @param optAttribs -- object with key value pairs for attributes of the option element
 * @returns HTMlSelectElement
 */
function makeSelectList(
	selAttribs: {[key: string]: string | voidFunction},
	optVals: string[],
	optText: string[],
	optAttribs: {[key: string]: string | voidFunction} | null
): HTMLSelectElement {
	let i,
		optionElem: HTMLOptionElement;

	if (selAttribs != null && selAttribs instanceof Array == false)
		throw "makeSelectList(): attributes for <select> element must be string array";
	if (optVals != null && optVals instanceof Array == false)
		throw "makeSelectList(): values for <option> elements must be string array";
	if (optText instanceof Array == false)
		throw "makeSelectList(): text for options if present must be string array";
	if  (optVals.length > 1 && optVals.length != optText.length)
		throw "makeSelectList(): the values and text for <option> element must be equal"; 
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

/**
 * @function renderTable
 * @param params -- the following properties are set
 *      .headers: string[]  the text to be used in column headers
 *      .display: ((arg?: any) => string | {attrib: string; iValue: string}) []
 *               a function to execute to render what is displayed in table cell
 *          can be either a string or object of type {attrib: string; value: string;}
 *           attrib can be td attribs with format "id='<idval>';;class='<classval>';;..."
 *             use split(";;") to disjoin, then use split("=") to get name=value pairs
 *      .data: any[]  the data items as array to be supplied and executed
 *      .attach: the form node to attach the table to
 *      .options: string[]
 */
/*
function renderTable(params: {
		headers: (string | renderTableHeaderObject)[];
		display: ((arg?: unknown) => string |
			{
				attrib: string;
				iValue: string;
				wrapLink?: string; // this is href attribute value
			})[];
		data: unknown[];
		attach: HTMLDivElement;
		options: string[];
		title?: string;
		subtitle?: string;
	}): void {
		const ADD_COUNTER: number = 0x0001;
		let trNode: HTMLTableRowElement,
			tdNode: HTMLTableCellElement,
			caption: HTMLTableCaptionElement,
			paraElem: HTMLParagraphElement,
			value: string |
				{
					attrib: string;
					iValue: string;
					wrapLink?: string;
				},
			//cItem: { [key:string]: string;},
			options = 0x0000,
			headerTitle: string,
			counterColumn = -1,
			matches,
			counter = 0;

		if (params.options)
			for (const option of params.options)
				if ((matches = option.match(/addCounter\{(\d+)\}/)) != null) {
					options |= ADD_COUNTER;
					counterColumn = matches[1] ? parseInt(matches[1]) : 1;
					counter = 1;
				}

		const tblNode = document.createElement("table");
		tblNode.style.margin = "2em auto";
		if (params.title) {
			caption = document.createElement("caption");
			caption.appendChild(document.createTextNode(params.title));
			caption.style.color = "lime";
			caption.style.backgroundColor = "navy";
			caption.style.captionSide = "top";
			caption.style.fontSize = "125%";
			caption.style.fontWeight = "bold";
			caption.style.paddingLeft = "2em";

			tblNode.appendChild(caption);
			if (params.subtitle) {
				paraElem = document.createElement("p");
				caption.appendChild(paraElem);
				paraElem.style.fontSize = "83%";
				paraElem.style.color = "yellow";
				paraElem.style.fontWeight = "normal";
				paraElem.appendChild(document.createTextNode(params.subtitle));
			}
		}
		params.attach.appendChild(tblNode);
		tblNode.style.width = "auto";	
		trNode = document.createElement("tr");
		tblNode.appendChild(trNode);
		for (let i = 0; i < params.headers.length; i++) {
		if ((options & ADD_COUNTER) != 0 && i == counterColumn - 1) {
			tdNode = document.createElement("th");
			trNode.appendChild(tdNode);
			tdNode.appendChild(document.createTextNode("#"));
		}
		tdNode = document.createElement("th");
		trNode.appendChild(tdNode);
		if (typeof params.headers[i] == "string")
			headerTitle = params.headers[i] as string;
		else {
			headerTitle = (params.headers[i] as renderTableHeaderObject).title;
			tdNode.setAttribute("style", (params.headers[i] as renderTableHeaderObject).style);
		}
		tdNode.appendChild(document.createTextNode(headerTitle));
	}
	if (params.data.length == 0) {
		trNode = document.createElement("tr");
		tblNode.appendChild(trNode);
		tdNode = document.createElement("td");
		trNode.appendChild(tdNode);
		tdNode.setAttribute("colspan", params.headers.length.toString() + 1);
		tdNode.appendChild(document.createTextNode("No items were marked for display in the table"));
		tdNode.style.fontWeight = "bold";
		tdNode.style.fontSize = "150%";
		tdNode.style.color = "red";
		return;
	}
	for (const item of params.data) {
		trNode = document.createElement("tr");
		tblNode.appendChild(trNode);
		for (let i = 0; i < params.display.length; i++) {
			if ((options & ADD_COUNTER) != 0 && i == counterColumn - 1) {
				// this creates a left-size row column counter as an option
				tdNode = document.createElement("th");
				trNode.appendChild(tdNode);
				tdNode.appendChild(document.createTextNode(counter.toString()));
				counter++;
			}
			tdNode = document.createElement("td");
			trNode.appendChild(tdNode);
			// process the display functions
			value = params.display[i](item);
			if (typeof value == "string") {
				if (value.search(/\$\$/) >= 0)
					setCellValue(item, value, null);
				else
					tdNode.appendChild(document.createTextNode(value));
			} else {
				// value is object
				if (typeof value.iValue == "string") {
					if (value.iValue.search(/\$\$/) >= 0)
						setCellValue(item, value.iValue, value.wrapLink!);
					else
						tdNode.appendChild(document.createTextNode(value.iValue));
				} if (value.attrib.length > 0) {
					let attribName: string,
						attribVal: string;

					const attribs = value.attrib.split(";;");
					for (const attrib of attribs) {
						[ attribName, attribVal ] = attrib.split("=");
						switch (attribName) {
						case "class":
							tdNode.className = attribVal;
							break;
						case "id":
							tdNode.id = attribVal;
							break;
						case "style":
							tdNode.setAttribute("style", attribVal);
							break;
						}
					}
				}
			}
		}
	}

	function setCellValue(
		item: unknown, 
		value: string, 
		wrapLink: string | null
	) {
		//  for "$$<object properties>"
		let //index: string[],
			//part: string | undefined,
			vars: RegExpMatchArray | null;
		const varsVals: string[] = [];

			// extract the property string from any larger string
		if ((vars = value.match(/\$\$[A-Za-z0-9]+/g)) != null)
			for (const var$ of vars)
				varsVals.push((item as string)[var$.substring(2)]);
		if (vars != null)
			for (let i = 0; i < vars?.length; i++)
				value = value.replace(vars[i], varsVals[i]);

	  if ((index = (value).split(".")).length > 1) {
		  cItem = item[index.shift() as string];
		  while (typeof (part = index.shift()) !== "undefined")
			  value = cItem[part];
	  } else
		  value = item[value]; 
		if (wrapLink && wrapLink.length > 0) {
			const anchor = document.createElement("a");
			anchor.href = wrapLink;
			anchor.target = "_blank";
			anchor.appendChild(document.createTextNode(value));
			tdNode.appendChild(anchor);
		} else
			tdNode.appendChild(document.createTextNode(value));
	} 
}
*/

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
		} else if (inTag == true && typeof workingElem !== "undefined") {
			const attribPair = item.split("=");
			workingElem.setAttribute(attribPair[0], attribPair[1]);
		} else if (elemLevel > 0)
			workingElem?.appendChild(doc.createTextNode(item));
		else
			docFrag.appendChild(doc.createTextNode(item));
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
};

class DataTable {
	type: string;	// "tableObject"
	tbody: HTMLTableSectionElement;
	thead: HTMLTableSectionElement;

	constructor() {
		this.type = "tableObject";
		this.tbody = document.createElement("tbody");
		this.thead = document.createElement("thead");
	}

	getNode(which: "tbody" | "thead"): HTMLTableSectionElement | null {
		return which == "tbody" ? this.tbody : which == "thead" ? this.thead : null;
	}

	getDOMnode(): HTMLTableElement {
		const tableNode = document.createElement("table");
		tableNode.appendChild(this.thead);
		tableNode.appendChild(this.tbody);
		return tableNode;
	}

	getRowCount(tbody: HTMLTableSectionElement): number {
		return tbody.rows.length;
	}
	
	getRowDOMNode(tbody: HTMLTableSectionElement, row: number): HTMLTableRowElement {
		return tbody.rows[row];
	}

	appendRow(attributes: string[], tbody: HTMLTableSectionElement): number {
		const row = tbody.insertRow();
		for (const attrib of attributes) {
			const [name, value] = attrib.split("=");
			row.setAttribute(name, value);
		}
		return tbody.rows.length - 1;
	}

	deleteRow(tbody: HTMLTableSectionElement, row: HTMLTableRowElement): void {
		tbody.removeChild(row);
	}

	getCellDOMNode(section: HTMLTableSectionElement, row: number, cell: number): HTMLTableCellElement {
		return section.rows[row].cells[cell];
	}

	setCellContent(
		row: number, 
		cell: number, 
		content: string | Node, 
		isHTML: boolean, 
		section: HTMLTableSectionElement
	): void {
		const cellNode = section.rows[row].cells[cell];
		if (isHTML)
			cellNode.innerHTML = content as string;
		else
			cellNode.appendChild(content as Node);
	}

	addTableSection(section: string): void {
		const tableSection = document.createElement(section) as HTMLTableSectionElement;
		if (section == "thead")
			this.thead = tableSection;
		else
			this.tbody = tableSection;
	}

	appendCell(
		row: number, 
		cellType: number, 
		attributes: string[], 
		section: HTMLTableSectionElement
	): number {
		const cell = section.rows[row].insertCell(cellType);
		for (const attrib of attributes) {
			const [name, value] = attrib.split("=");
			cell.setAttribute(name, value);
		}
		return section.rows[row].cells.length - 1;
	}
}	