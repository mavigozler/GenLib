/* eslint-disable @typescript-eslint/no-unused-vars */

/************************************************************
  dom-xml.js documentation is at the bottom of this document

  This script file incorporates wrappers to the
  DOMParser() and XMLSerializer() objects

**************************************************************/

/********************** WARNING *************************
   Any document including 'dom-xml.js' script file must
   also include the 'css.js' script file!
 ********************************************************/
/*
if (typeof Node == "undefined") {
	let Node = new Object();
		// NodeType
	Node.ELEMENT_NODE                   = 1;
	Node.ATTRIBUTE_NODE                 = 2;
	Node.TEXT_NODE                      = 3;
	Node.CDATA_SECTION_NODE             = 4;
	Node.ENTITY_REFERENCE_NODE          = 5;
	Node.ENTITY_NODE                    = 6;
	Node.PROCESSING_INSTRUCTION_NODE    = 7;
	Node.COMMENT_NODE                   = 8;
	Node.DOCUMENT_NODE                  = 9;
	Node.DOCUMENT_TYPE_NODE             = 10;
	Node.DOCUMENT_FRAGMENT_NODE         = 11;
	Node.NOTATION_NODE                  = 12;
/*
		readonly attribute DOMString        nodeName;
		         attribute DOMString        nodeValue;
		                                      // raises(DOMException) on setting
		                                      // raises(DOMException) on retrieval
		readonly attribute unsigned short   nodeType;
		readonly attribute Node             parentNode;
		readonly attribute NodeList         childNodes;
		readonly attribute Node             firstChild;
		readonly attribute Node             lastChild;
		readonly attribute Node             previousSibling;
		readonly attribute Node             nextSibling;
		readonly attribute NamedNodeMap     attributes;
		// Modified in DOM Level 2:
		readonly attribute Document         ownerDocument;
		Node               insertBefore(in Node newChild,
		                                in Node refChild)
		                                      raises(DOMException);
		Node               replaceChild(in Node newChild,
		                                in Node oldChild)
		                                      raises(DOMException);
		Node               removeChild(in Node oldChild)
		                                      raises(DOMException);
		Node               appendChild(in Node newChild)
		                                      raises(DOMException);
		boolean            hasChildNodes();
		Node               cloneNode(in boolean deep);
		// Modified in DOM Level 2:
		void               normalize();
		// Introduced in DOM Level 2:
		boolean            isSupported(in DOMString feature,
		                               in DOMString version);
		// Introduced in DOM Level 2:
		readonly attribute DOMString        namespaceURI;
		// Introduced in DOM Level 2:
		         attribute DOMString        prefix;
		                                      // raises(DOMException) on setting

		// Introduced in DOM Level 2:
		readonly attribute DOMString        localName;
		// Introduced in DOM Level 2:
		boolean            hasAttributes();

}
*/

/***************************************************************************
             DOM Level 1 Conformance
****************************************************************************/

/* Valid XML name determinations

htmlDomData.combiningChar ::= [#x0300-#x0345] | [#x0360-#x0361] | [#x0483-#x0486] |
    [#x0591-#x05A1] | [#x05A3-#x05B9] | [#x05BB-#x05BD] | #x05BF |
	 [#x05C1-#x05C2] | #x05C4 | [#x064B-#x0652] | #x0670 | [#x06D6-#x06DC] |
	 [#x06DD-#x06DF] | [#x06E0-#x06E4] | [#x06E7-#x06E8] | [#x06EA-#x06ED] |
	 [#x0901-#x0903] | #x093C | [#x093E-#x094C] | #x094D | [#x0951-#x0954] |
	 [#x0962-#x0963] | [#x0981-#x0983] | #x09BC | #x09BE | #x09BF |
	 [#x09C0-#x09C4] | [#x09C7-#x09C8] | [#x09CB-#x09CD] | #x09D7 |
	 [#x09E2-#x09E3] | #x0A02 | #x0A3C | #x0A3E | #x0A3F | [#x0A40-#x0A42] |
	 [#x0A47-#x0A48] | [#x0A4B-#x0A4D] | [#x0A70-#x0A71] | [#x0A81-#x0A83] |
	 #x0ABC | [#x0ABE-#x0AC5] | [#x0AC7-#x0AC9] | [#x0ACB-#x0ACD] |
	 [#x0B01-#x0B03] | #x0B3C | [#x0B3E-#x0B43] | [#x0B47-#x0B48] |
	 [#x0B4B-#x0B4D] | [#x0B56-#x0B57] | [#x0B82-#x0B83] | [#x0BBE-#x0BC2] |
	 [#x0BC6-#x0BC8] | [#x0BCA-#x0BCD] | #x0BD7 | [#x0C01-#x0C03] |
	 [#x0C3E-#x0C44] | [#x0C46-#x0C48] | [#x0C4A-#x0C4D] | [#x0C55-#x0C56] |
	 [#x0C82-#x0C83] | [#x0CBE-#x0CC4] | [#x0CC6-#x0CC8] | [#x0CCA-#x0CCD] |
	 [#x0CD5-#x0CD6] | [#x0D02-#x0D03] | [#x0D3E-#x0D43] | [#x0D46-#x0D48] |
	 [#x0D4A-#x0D4D] | #x0D57 | #x0E31 | [#x0E34-#x0E3A] | [#x0E47-#x0E4E] |
	 #x0EB1 | [#x0EB4-#x0EB9] | [#x0EBB-#x0EBC] | [#x0EC8-#x0ECD] |
	 [#x0F18-#x0F19] | #x0F35 | #x0F37 | #x0F39 | #x0F3E | #x0F3F |
	 [#x0F71-#x0F84] | [#x0F86-#x0F8B] | [#x0F90-#x0F95] | #x0F97 |
	 [#x0F99-#x0FAD] | [#x0FB1-#x0FB7] | #x0FB9 | [#x20D0-#x20DC] |
	 #x20E1 | [#x302A-#x302F] | #x3099 | #x309A

Digit ::= [#x0030-#x0039] | [#x0660-#x0669] | [#x06F0-#x06F9] |
	[#x0966-#x096F] | [#x09E6-#x09EF] | [#x0A66-#x0A6F] | [#x0AE6-#x0AEF] |
	[#x0B66-#x0B6F] | [#x0BE7-#x0BEF] | [#x0C66-#x0C6F] | [#x0CE6-#x0CEF] |
	[#x0D66-#x0D6F] | [#x0E50-#x0E59] | [#x0ED0-#x0ED9] | [#x0F20-#x0F29]

Extender ::= #x00B7 | #x02D0 | #x02D1 | #x0387 | #x0640 |
	#x0E46 | #x0EC6 | #x3005 | [#x3031-#x3035] | [#x309D-#x309E] |
	[#x30FC-#x30FE]
*/

// eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
let htmlDomData: any = {

	combiningChar : [
		["\u0300", "\u0345"],  ["\u0360", "\u0361"], ["\u0483", "\u0486"],
		["\u0591", "\u05A1"], ["\u05A3", "\u05B9"], ["\u05BB", "\u05BD"], "\u05BF",
		["\u05C1", "\u05C2"], "\u05C4", ["\u064B", "\u0652"], "\u0670", ["\u06D6", "\u06DC"],
		["\u06DD", "\u06DF"], ["\u06E0", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"],
		["\u0901", "\u0903"], "\u093C", ["\u093E", "\u094C"], "\u094D", ["\u0951", "\u0954"],
		["\u0962", "\u0963"], ["\u0981", "\u0983"], "\u09BC", "\u09BE", "\u09BF",
		["\u09C0", "\u09C4"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CD"], "\u09D7",
		["\u09E2", "\u09E3"], "\u0A02", "\u0A3C", "\u0A3E", "\u0A3F", ["\u0A40", "\u0A42"],
		["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], ["\u0A70", "\u0A71"], ["\u0A81", "\u0A83"],
		"\u0ABC", ["\u0ABE", "\u0AC5"], ["\u0AC7", "\u0AC9"], ["\u0ACB", "\u0ACD"],
		["\u0B01", "\u0B03"], "\u0B3C", ["\u0B3E", "\u0B43"], ["\u0B47", "\u0B48"],
		["\u0B4B", "\u0B4D"], ["\u0B56", "\u0B57"], ["\u0B82", "\u0B83"], ["\u0BBE", "\u0BC2"],
		["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCD"], "\u0BD7", ["\u0C01", "\u0C03"],
		["\u0C3E", "\u0C44"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"],
		["\u0C82", "\u0C83"], ["\u0CBE", "\u0CC4"], ["\u0CC6", "\u0CC8"], ["\u0CCA", "\u0CCD"],
		["\u0CD5", "\u0CD6"], ["\u0D02", "\u0D03"], ["\u0D3E", "\u0D43"], ["\u0D46", "\u0D48"],
		["\u0D4A", "\u0D4D"], "\u0D57", "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"],
		"\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"],
		["\u0F18", "\u0F19"], "\u0F35", "\u0F37", "\u0F39", "\u0F3E", "\u0F3F",
		["\u0F71", "\u0F84"], ["\u0F86", "\u0F8B"], ["\u0F90", "\u0F95"], "\u0F97",
		["\u0F99", "\u0FAD"], ["\u0FB1", "\u0FB7"], "\u0FB9", ["\u20D0", "\u20DC"],
		"\u20E1", ["\u302A", "\u302F"], "\u3099", "\u309A"
	],

	digit :  [
		["\u0030", "\u0039"], ["\u0660", "\u0669"], ["\u06F0", "\u06F9"],
		["\u0966", "\u096F"], ["\u09E6", "\u09EF"], ["\u0A66", "\u0A6F"], ["\u0AE6", "\u0AEF"],
		["\u0B66", "\u0B6F"], ["\u0BE7", "\u0BEF"], ["\u0C66", "\u0C6F"], ["\u0CE6", "\u0CEF"],
		["\u0D66", "\u0D6F"], ["\u0E50", "\u0E59"], ["\u0ED0", "\u0ED9"], ["\u0F20", "\u0F29"]
	],

	extender : [
		"\u00B7", "\u02D0", "\u02D1", "\u0387", "\u0640",
		"\u0E46", "\u0EC6", "\u3005", ["\u3031", "\u3035"], ["\u309D", "\u309E"],
		["\u30FC", "\u30FE"]
	],

	elementClasses : {
		fontstyle : [ "tt", "i", "b", "big", "small", "u", "s", "strike" ],
		phrase : [ "em", "strong", "dfn", "code", "samp", "kbd", "var", "cite", "abbr", "acronym" ],
		special : [ "a", "img", "object", "br", "script", "map", "q",
			"sub", "sup", "span", "bdo", "applet", "font", "basefont", "iframe" ],
		formctrl : [ "input", "select", "textarea", "label", "button" ],
		heading : [ "h1", "h2", "h3", "h4", "h5", "h6" ],
		list : [ "ul", "ol" ]
	},
	/* tag status of elements */
	nonEtagoElements : [ "input", "br", "img", "hr", "col", "frame",
		"meta", "link", "param", "base", "basefont", "area", "isindex" ],

	requiredEtagoElements : {
		a: [ "a" , "area", "applet", "address", "abbr", "acronym" ],
		b: [ "b", "button", "body", "blockquote", "big", "bdo" ],
		c: [ "center", "caption", "cite", "code" ],
		d: [ "div", "dfn", "dl", "del", "dir" ],
		e: [ "em" ],
		f: [ "form", "font", "fieldset" ],
		i: [ "i", "iframe", "ins", "inindex" ],
		k: [ "kbd" ],
		l: [ "label", "legend" ],
		m: [ "map", "menu" ],
		n: [ "noscript", "noframes" ],
		o: [ "ol", "optgroup", "object" ],
		p: [ "pre" ],
		q: [ "q" ],
		s: [ "span", "strong", "sub", "sup", "script", "select", "style",
			"small", "samp", "strike", "s" ],
		t: [ "table" , "textarea", "title", "tt" ],
		u: [ "ul", "u" ],
		v: [ "var" ]
	},

	deprecatedElements : [
		"applet", "basefont", "center", "dir", "font", "isindex", "menu",
		"u", "s", "strike"
	],

	looseStandardElements : [
		"applet", "basefont", "center", "dir", "font", "iframe", "isindex",
		"menu",	"u", "s", "strike"
	],

	optionalEtagoElements : [ "p", "tr", "td" , "th", "li",
		"colgroup" , "option", "dd", "dt", "thead", "tfoot" ],

	impliedElements : [ "tbody", "head", "html" ],

	charEntities :
		[  "nbsp"  , "\u00a0",    "cent"  , "\u00a2",   "sect"  , "\u00a7",
			"uml"  ,  "\u00a8",    "copy"  , "\u00a9",   "deg"   , "\u00b0",
			"plusmn", "\u00b1",    "micro" , "\u00b5",   "frac14", "\u00bc",
			"frac12", "\u00bd",    "frac34", "\u00be",   "times" , "\u00d7",
			"divide", "\u00f7",    "bull"  , "\u2022",   "prime" , "\u2032",
			"larr"  , "\u2190",    "rarr"  , "\u2192",   "sum"   , "\u2211",
			"minus" , "\u2212",    "radic" , "\u221a",   "infin" , "\u221e",
			"ne"    , "\u2260",    "le"    , "\u2264",   "ge"    , "\u2265",
			"quot"  , "\u0022",    "amp"   , "\u0026",   "lt"    , "\u003c",
			"gt"    , "\u003e",    "mdash" , "\u2014",   "lsquo" , "\u2018",
			"rsquo" , "\u2019",    "ldquo" , "\u201c",   "rdquo" , "\u201d",
			"euro"  , "\u20ac",    "permil", "\u2030",   "uuml",   "\u00fc",
			"Uuml"  , "\u00dc",    "Ouml",   "\u00d6",   "ouml",   "\u00f6",
			"ntilde", "\u00f1",    "eacute", "\u00e9",   "oacute", "\u00f3",
			"ccedil", "\u00e7",	  "Ccedil", "\u00c7",   "Alpha",  "\u0391",
			"alpha",  "\u03b1",    "beta",   "\u03b2",   "gamma",  "\u03b3",
			"delta",  "\u03b4",	  "epsilon","\u03b5",   "zeta",   "\u03b6",
			"eta",    "\u03b7",    "theta",  "\u03b8",   "iota",   "\u03b9",
			"kappa",  "\u03ba",    "lambda", "\u03bb",   "mu",     "\u03bc",
			"nu",     "\u03bd",    "xi",     "\u03be",   "omicron","\u03bf",
			"pi",     "\u03c0",    "rho",    "\u03c1",   "sigmaf", "\u03c2",
			"sigma",  "\u03c3",    "tau",    "\u03c4",   "upsilon","\u03c5"
		]
};

// htmlDomData.requiredEtagoElements.h = htmlDomData.elementClasses.heading;

const hddInline = htmlDomData.elementClasses.inline = [
	htmlDomData.elementClasses.phrase,
	htmlDomData.elementClasses.special,
	htmlDomData.elementClasses.fontstyle,
	htmlDomData.elementClasses.formctrl
];

const hddBlock = htmlDomData.elementClasses.block = [
	htmlDomData.elementClasses.heading,
	htmlDomData.elementClasses.list,
	"p", "pre", "dl", "div", "noscript", "blockquote", "form", "hr", "table",
	"fieldset", "address", "center", "noframes"
];

/* For each element, there are two arrays:  the first array shows the permitted
elements, and the second are elements that are absolutely forbidden */
htmlDomData.legalContainingElements = {
	a: { a: [ hddInline ], address: [ hddInline ],
		applet: [ hddBlock, hddInline, "param" ] },
	b: { b: [ hddInline ], body: [ hddBlock, "script" ],
		blockquote: [ hddBlock, hddInline ], button: [ hddBlock, hddInline ] },
	c: { caption: [ hddInline ], colgroup: [ "col" ],
		center: [ hddBlock, hddInline ] },
	d: { div: [ hddBlock, hddInline ], dl: [ "dt", "dd" ], dt: [ hddInline ],
		dd: [ hddBlock, hddInline ] },
	f: { form: [ hddBlock, hddInline ], fieldset: [ "legend", hddBlock, hddInline ],
		font: [ hddInline ] },
	h: { h1: [ hddInline ], h2: [ hddInline ], h3: [ hddInline ], h4: [ hddInline ],
		h5: [ hddInline ], h6: [ hddInline ] },
	i: { i: [ hddInline ] },
	l: { li: [ hddBlock, hddInline ], label: [ hddInline ], legend: [ hddInline ] },
	m: { map: [ hddBlock, "area" ] },
	n: { noscript: [ hddBlock ] },
	o: { ol: [ "li" ], object: [ hddInline, hddBlock, "param" ],
		optgroup: [ "option" ] },
	p: { p: [ hddInline ], pre: [ hddInline ] },
	q: { q: [ hddInline ] },
	s: { sub: [ hddInline ],  sup: [ hddInline ], span: [ hddInline ],
		select: [ "optgroup", "option" ] },
	t: { table: [ "tr", "caption", "col", "colgroup", "thead", "tfoot", "tbody" ],
		tr: [ "th", "td" ], th: [ hddBlock, hddInline ], td: [ hddBlock, hddInline ],
		tbody: [ "tr" ], thead: [ "tr" ], tfoot: [ "tr" ] },
	u: { ul: [ "li" ] }
};


function convertCharEntityToUnicode(
	charEntityAsString: string,
	option?: boolean
): string | null {
	let i, // loop index
		matches,  // array returned from match() method call
		matched,  // string being the matched part
		count;  // count of items in htmlDomData.charEntities arrays
	if (typeof charEntityAsString !== "string")
		return null;
	if (typeof option !== "undefined" && option === false) { // perform the opposite conversion
		if ((matches = (charEntityAsString.trim()).match(/(\\u\x{4})/)) !== null) {
			matched = matches[1];
			count = htmlDomData.charEntities.length;
			for (i = 0; i < count; i += 2)
				if (matched === htmlDomData.charEntities[i + 1])
					return "&" + htmlDomData.charEntities[i] + ";";
			matched = parseInt(matched, 16);
			return "&#" + matched.toString(10) + ";";
		}
	} else {
		if ((matches = (charEntityAsString.trim()).match(/&#(\d{2,4});/)) !== null) {
			matched = parseInt(matches[1], 10);
			matched = matched.toString(16);
			while (matched.length < 4)
				matched = "0" + matched;
			return "\\u" + matched;
		}	else if ((matches = ((charEntityAsString.trim()).match(/&(\w{2,8});/))) !== null) {
			matched = matches[1];
			count = htmlDomData.charEntities.length;
			for (i = 0; i < count; i += 2)
				if (matched === htmlDomData.charEntities[i])
					return htmlDomData.charEntities[i + 1];
		}
	}
	return null;
}

function convertUnicodeToCharEntity(unicodeCharAsString: string) {
	return convertCharEntityToUnicode(unicodeCharAsString, false);
}

function convertAllCharEntityToUnicode(stringWithCharEntities: string): string {
	const charEntityRE = /(&#\d{2,4};|&\w{2,8};)/;
	let matched, // returned array of match() method
		newString = "";
	while ((matched = charEntityRE.exec(stringWithCharEntities)) !== null) {
		newString += stringWithCharEntities.substr(0, matched.index);
		newString += convertCharEntityToUnicode(matched[1]);
		stringWithCharEntities = stringWithCharEntities.substr(
			matched.index + matched[0].length);
	}
	return newString + stringWithCharEntities;
}

/* this taken from  Snook (2007) Accelerated DOM Scripting with Ajax,
   APIs, and Libraries,  Apress  */
function getElementsByClassName(node: HTMLElement, className: string) {
	const classNodes = [],
		classFilter = new RegExp("(^| )" + className + "( |$)"),
		allDocNodes = node.getElementsByTagName("*");
	let i, j;
	for (i = 0, j = allDocNodes.length; i < j; i++)
		if (classFilter.test(allDocNodes[i].className))
			classNodes.push(allDocNodes[i]);
	return classNodes;
}

function extensiveNameCharCheck(theChar: string) {
	const validChars = [ htmlDomData.combiningChar, htmlDomData.Digit, htmlDomData.Extender ];
	let i, j;
	for (i = 0; i < validChars.length; i++)
		for (j = 0; j < validChars[i].length; j++)
			if (validChars[i][j] instanceof Array)
				if (theChar >= validChars[i][j][0] && theChar <= validChars[i][j][1])
					return true;
				else if (theChar === validChars[i][j])
					return true;
	return false;
}

/* valid NameChar ::== Letter | Digit | '.' | '-' | '_' | ':' |
    htmlDomData.combiningChar | Extender
 valid Name ::== (Letter | '_' | ':')(NameChar)*
*/

function validDOMattribute (attributeName: string) {
	const startPoint = attributeName;
	let posn;
	if (attributeName.search(/[A-Za-z0-9_:]/) !== 0) // 1st char test
		return false;
	while ((posn = startPoint.search(/[A-Za-z0-9_:\-.]/)) > 0)
		if (extensiveNameCharCheck(startPoint.charAt(posn)) === false)
			return false;
	return true;
}


function validDOMattributeValue (attributeValueName: string) {
	const startPoint = attributeValueName;
	let posn;
	while ((posn = startPoint.search(/[A-Za-z0-9_:\-.]/)) > 0)
		if (extensiveNameCharCheck(startPoint.charAt(posn)) === false)
			return false;
	return true;
}

const
	ELEMENT_NODE					= 1,
	ATTRIBUTE_NODE					= 2,
	TEXT_NODE						= 3,
	CDATA_SECTION_NODE			= 4,
	ENTITY_REFERENCE_NODE		= 5,
	ENTITY_NODE						= 6,
	PROCESSING_INSTRUCTION_NODE	= 7,
	COMMENT_NODE						= 8,
	DOCUMENT_NODE					= 9,
	DOCUMENT_TYPE_NODE				= 10,
	DOCUMENT_FRAGMENT_NODE		= 11,
	NOTATION_NODE					= 12;

/*
if (typeof(Node) == "undefined")
{
	var Node = function () {
		this.ELEMENT_NODE						= 1;
		this.ATTRIBUTE_NODE					= 2;
		this.TEXT_NODE							= 3;
		this.CDATA_SECTION_NODE				= 4;
		this.ENTITY_REFERENCE_NODE			= 5;
		this.ENTITY_NODE						= 6;
		this.PROCESSING_INSTRUCTION_NODE	= 7;
		this.COMMENT_NODE						= 8;
		this.DOCUMENT_NODE					= 9;
		this.DOCUMENT_TYPE_NODE				= 10;
		this.DOCUMENT_FRAGMENT_NODE		= 11;
		this.NOTATION_NODE					= 12;
	};
}
*/

/* this method extension tries to find if an element node or an
   element id are part of the parent (ancestral chain) of the node
	of interest.
	The 2nd arg can be of two types:
	--- a string which represents the value of the 'id' attribute of an ancestor node
	--- an actual element node, which will be compared to the ancestral node
*/

// info provded by ChatGPT v3.5
// Check if document.createDocumentFragment is not already a function
if (typeof document.createDocumentFragment !== "function") {
	// Define it as a function
	Object.defineProperty(document, "createDocumentFragment", {
		value: () => {
			try {
				return document.createDocumentFragment();
			} catch (error) {
				return document.createElement("div");
			}
		},
		writable: true,
		configurable: true
	});
}

/* A highly recursive function that joins arrays of strings.
   This function is essentially a static function for the
	isContentForbidden() and isContainedBy() public functions
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getArrayOfStrings(obj: any): string[] | string | null {
	if (typeof obj === "undefined" || obj === null)
		return null;
	if (typeof obj === "string")
		return obj;
	if (typeof obj !== "object")
		return String(obj);
	let levelArray: string[] = [];
	for (const prop in obj)
		if (typeof obj[prop] === "object")
			levelArray = levelArray.concat(getArrayOfStrings(obj[prop]) as string[]);
		else
			levelArray.push(obj[prop]);
	return levelArray;
}

function removeChildren(node: HTMLElement): HTMLElement {
	while (node.firstChild)
		node.removeChild(node.firstChild);
	return node;
}

function replaceAllChildren(node: HTMLElement, newMarkup: string) {
	removeChildren(node);
	node.innerHTML = newMarkup;
	return node;
}

function placeMarkupHere(markup: string) { // by Martin Honnen
	const ns = "http://www.w3.org/1999/xhtml";
	try {
		const scripts = document.getElementsByTagNameNS(ns, "script");
		const lastScript = scripts[scripts.length - 1];
		//lastScript.parentNode.appendChild(buildDocFrag._build(markup));
		buildDocFrag._build(markup, lastScript.parentNode as Node, ns);
	} catch (error) {
		const scripts = document.getElementsByTagName("script");
		const lastScript = scripts[scripts.length - 1];
		//lastScript.parentNode.appendChild(buildDocFrag._build(markup));
		buildDocFrag._build(markup, lastScript.parentNode as Node, ns);
	}
}
/*
function nodeTreeSearch(
	node: HTMLElement,
	childString: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	childType: any
) {
	let searchRE,
		retval = null,
		root,   // starting point for tree walking
		whatToShow,  //
		nodeFilter = null,  // how to filter the node
		expandReferences = false,  // parameter in createTreeWalker
		treeWalker, // standard W3C DOM object for tree walking
		thisNode,
		cnode;  // child node in looping
	if (node == null || childString == null ||
				(childType != ELEMENT_NODE && childType != TEXT_NODE &&
				childType != COMMENT_NODE))
		return null;
	retval = null;
	if (childType == TEXT_NODE || childType == COMMENT_NODE)
		searchRE = new RegExp(childString);
	if (document.implementation.hasFeature("Traversal", "2.0") == true) {
		root = node;
		whatToShow = NodeFilter.SHOW_ALL;
		nodeFilter = null;
		expandReferences = false;
		treeWalker = document.createTreeWalker(root, whatToShow,
         nodeFilter, expandReferences);
    	for (thisNode = treeWalker.nextNode(); thisNode != null;
    						thisNode = thisNode.nextNode())
			if (thisNode.nodeName.search(searchRE) >= 0)
				return thisNode;
		return undefined;
	}
	for (cnode = node.firstChild; cnode != null; cnode = cnode.nextSibling) {
		switch (childType) {
		case ELEMENT_NODE:
			if (cnode.nodeName.toLowerCase() == childString.toLowerCase())
				return cnode;
			break;
		case TEXT_NODE:
		case COMMENT_NODE:
			if (cnode.data && cnode.data.search(searchRE) >= 0)
				return cnode;
			break;
		}
		if (cnode.hasChildNodes() == true &&
				(retval = nodeTreeSearch(cnode, childString, childType)) != null)
			break;
	}
	return retval;
}


function walkDocFindNodes(contentTag, nodeType) {
	if (typeof(contentTag) != "string" && contentTag instanceof RegExp == false)
		return null;
	if (nodeType != ELEMENT_NODE && nodeType != COMMENT_NODE)
		return null;
	var contentTagRE;
	if (typeof(contentTag) == "string")
		contentTagRE = new RegExp(contentTag);
	else
		contentTagRE = contentTag;
	var domPosn = 0;
	var collectedDomNodes = [];
	function domNodeRecord(node, position) {
		this.domNode = node;
		this.position = position;
	}
	function scanTree(node) {
		for (node = node.firstChild; node != null;  node = node.nextSibling, domPosn++) {
			if (node.nodeType == nodeType &&
						(contentTag == "*" || (nodeType == ELEMENT_NODE &&
							node.nodeName.toLowerCase().search(contentTagRE) >= 0) ||
						(nodeType == COMMENT_NODE && node.data.search(contentTagRE) >= 0)))
				collectedDomNodes.push(new domNodeRecord(node, domPosn));
			if (node.hasChildNodes() == true)
				scanTree(node);
		}
	}
	scanTree(document);
	return collectedDomNodes;
}
*/

function innerHtmlAsString(
	containingElem: HTMLElement,
	htmlStringObj: { content: string; }
) {
	// nodeType = 1 is an ELEMENT_NODE, = 11 is DOCUMENT_FRAGMENT_NODE
	let i,
		attr,
		attrval,
		node,
		tagNameLowerCase,
		firstLetter,
		len;

	//	if (arguments.length == 1) {
	//		if (!containingElem.nodeType || (containingElem.nodeType != 1 && containingElem.nodeType != 11))
	//			return null;  // to get innerHTML, must be element or docfrag
	//		strobj = HTML_string;
	//	} else { // recursion
	const strobj = htmlStringObj;
	strobj.content += "<" + containingElem.tagName;
	for (i = 0; i < containingElem.attributes.length; i++) {
		attr = containingElem.attributes[i];
		strobj.content += " " + attr.name + "=\"" + attr.value + "\"";
	}
	strobj.content += ">";
	//	}
	for (node = containingElem.firstChild; node !== null; node = node.nextSibling) {
		if (node.nodeType == 1) // another element
			innerHtmlAsString(node as HTMLElement, strobj);
		else if (node.nodeType == 3) // text node
			strobj.content += node.textContent;
	}
	if (arguments.length > 1) {
		tagNameLowerCase = containingElem.tagName.toLowerCase();
		firstLetter = tagNameLowerCase.charAt(0);
		len = htmlDomData.requiredEtagoElements[firstLetter].length;
		for (i = 0; i < len; i++)
			if (htmlDomData.requiredEtagoElements[firstLetter][i] === tagNameLowerCase) {
				strobj.content += "</" + containingElem.tagName + ">";
				break;
			}
		return null;
	}
	return strobj.content;
}


/* DOM Level 1 functions enable the following:

1. A constructor function is defined for object Node defined by DOM Level 1.
   It includes the constants for node types as defined by DOM 1.
	It also defines the DOM 1 methods .getNodeType() and getNodeName().

2. Node.isAncestralNode() is a method to determine if a node exists in
   a chain of ancestors (parents of parents).  The method checks that the
	current node is a legitimate DOM node and then moves up the parent chain
	to find the target node.

	Node.isAncestralNode(ancestorIDorNode)
	Arg #1:  one of two types, either a string, in which case it represents
	a case-insensitive string to an 'id' attribute to a DOM node, or
	it is an object, representing the DOM node itself
	Returns a boolean, true or false, which is true if the node is identified
	as an ancestor, and false in all other cases, even if an error argument
	is used.

3. Node.removeChildren() is the method never defined but is essentially
   a .removeChild() for all children.

4. An attempt is made to make use of document.createDocumentFragment()
   and if an error is thrown, to return it as DIV element

5. isContentForbidden() is a function that determines whether an
   HTML element can be contained within another HTML element.
	isContentForbidden(container, content) has two string arguments:
	Arg #1 is the tag/element that contains
	Arg #2 is the tag/element that is contained
	Return value is true if arg #2 can be contained by arg #1
	This function is a support function for buildDocFrag._build() which
	takes a string or strings of HTML text and renders them as an HTML
	document fragment.

6. isContainedBy() is a negative of isContentForbidden() question,
   so returns false if latter function returns true.

7. innerHtmlAsString() is supposed to render a document fragment
   tree as a string of valid HTML text.  This should then be possible
	to reconstruct the DOM object tree with a reverse function.
	innerHtmlAsString(containingElem, markupStringObj) takes 1 or 2 arguments.
	Arg #1 is required and is the node which is the root of the fragment tree.
	Arg #2 is optional and is a String object type which is the receptacle
	for the string to be constructed.  If arg #2 is not supplied, a
	String object will be created within the function and returned.
	Return values are the string object containing valid HTML text for
	no errors or exceptions, or the 'null' value if there are errors
	during argument checking or elswhere.

8. buildDocFrag._build() takes a string and parses it for HTML tags, and
   creates a document fragment upon which it builds the tree.
	Invalid HTML is ignored during parsing, and the tree is built only
	upon valid HTML.
	buildDocFrag._build(markupString) only takes 1 argument of type 'string'
	which contains the valid HTML.
	The return value is the root of the document fragment tree.  A 'null'
	return value is possible only if the single argument is not of type
	'string'.  A zero length string actually returns the document fragment
	itself.

9.  function nodeTreeSearch(node, childString, childType)
This function is used to search either content or a nodeName or tag
within a parent node.  The 1st arg 'node' is the parent node.
2nd arg 'childString' is either a string inside a text node or
the tag name of a child element.  If childString is a string inside
text node, then 3rd arg 'childType' should be specifed as TEXT_NODE.
If childString is a tag name for a child element, then childType
should be specified as ELEMENT_NODE.

This function returns one of the following:
 (i) if childString is a tag name and childType is ELEMENT_NODE,
   the node representing the FIRST occurrence of an element node with
	the identified tag name is returned; the calling function might
	continue to look for additional children through standard DOM functions
	(document.getElementsByTagName);  if no node with the tag name
	is found in a search of the descendant tree, then null is returned
 (ii) if childString is a string inside a text node and childType
	is TEXT_NODE, then the text node is returned that contains the
	string being the first occurrence of the string passed.  Note
	that case dependence is strict here.  If no text node containing the
	string is found, null is returned
 (iii) in all other situations, including faulty or errant argument
   passing/construction, a null is returned
 */



/***************************************************************************
             DOM Level 2 Conformance
****************************************************************************

Document Tree Traversal

A 'node iterator' traverses the document nodes in the order they
were presented in a document without any notion of a tree (document hierarchy).
It moves forwards and backwards, but not up and down.  Node iterators
should be used for looking at the content of a selected node.
Iterators return a list of member nodes in a sequential order.

A 'tree walker' maintains the subtree hierarchy and allows navigation
of the tree.  It is best used for manipulating structure around
selected nodes.

Node filters can be associated with iterators or walkers to examine
a node and determine if it should appear in the logical view.

*/

//////////////////////////////////////////////////////////////////////////////
// NodeFilter
//
/*
if (typeof NodeFilter !== "function") {
	// this is a constructor
	var NodeFilter = function (filterFunction) { // make constructor
		this.SHOW_ALL							= 0xffffffff;
		this.SHOW_ELEMENT						= 0x00000001;
		this.SHOW_ATTRIBUTE					= 0x00000002;
		this.SHOW_TEXT							= 0x00000004;
		this.SHOW_CDATA_SECTION				= 0x00000008;
		this.SHOW_ENTITY_REFERENCE			= 0x00000010;
		this.SHOW_ENTITY						= 0x00000020;
		this.SHOW_PROCESSING_INSTRUCTION	= 0x00000040;
		this.SHOW_COMMENT						= 0x00000080;
		this.SHOW_DOCUMENT					= 0x00000100;
		this.SHOW_DOCUMENT_TYPE				= 0x00000200;
		this.SHOW_DOCUMENT_FRAGMENT		= 0x00000400;
		this.SHOW_NOTATION					= 0x00000800;

		this.FILTER_ACCEPT   = 1;
		this.FILTER_REJECT   = 2;
		this.FILTER_SKIP     = 3;
		this.acceptNode = null;
		if (typeof filterFunction === "function")
			this.acceptNode = filterFunction;
	};

   NodeFilter.prototype.acceptNode = function ( n ) {
   	return NodeFilter.FILTER_ACCEPT;
   };

   // this funtion uses the whatToShow bit mask and checks the current
   // node type to see if will be accepted
   NodeFilter._acceptNode = function ( n, whatToShow ) {
   	if ( whatToShow == NodeFilter.SHOW_ALL )
   		return NodeFilter.FILTER_ACCEPT;

   	var bitMask;
   	switch ( n.nodeType ) {

   		case 1:
   			bitMask = NodeFilter.SHOW_ELEMENT;
   			break;
   		case 2:
   			bitMask = NodeFilter.SHOW_ATTRIBUTE
   			break;
   		case 3:
   			bitMask = NodeFilter.SHOW_TEXT;
   			break;
   		case 4:
   			bitMask = NodeFilter.SHOW_CDATA_SECTION;
   			break;
   		case 5:
   			bitMask = NodeFilter.SHOW_ENTITY_REFERENCE;
   			break;
   		case 6:
   			bitMask = NodeFilter.SHOW_ENTITY;
   			break;
   		case 7:
   			bitMask = NodeFilter.SHOW_PROCESSING_INSTRUCTION;
   			break;
   		case 8:
   			bitMask = NodeFilter.SHOW_COMMENT;
   			break;
   		case 9:
   			bitMask = NodeFilter.SHOW_DOCUMENT;
   			break;
   		case 10:
   			bitMask = NodeFilter.SHOW_DOCUMENT_TYPE;
   			break;
   		case 11:
   			bitMask = NodeFilter.SHOW_DOCUMENT_FRAGMENT;
   			break;
   		case 12:
   			bitMask = NodeFilter.SHOW_NOTATION;
   			break;
   	}

   	return (bitMask & whatToShow) != 0 ?
   			NodeFilter.FILTER_ACCEPT :
   			NodeFilter.FILTER_SKIP;
   };
}



if (typeof document.createNodeIterator === "undefined") {
	document.createNodeIterator = function (
			root,
			whatToShow,
			filter,
			entityReferenceExpansion) {
		this.root = root;
		this.whatToShow = whatToShow;
		this.filter = filter;
		this.expandEntityReferences = entityReferenceExpansion;
		this.nextNode = function () {
		};
		this.previousNode = function () {
		};
		return (this);
	};
}
*/

/* returns an array ("list") of child nodes of the specified type found
in search order of the given parent node */
/*
function makeListChildNodesThisType(parentNode, childNodeType) {
	if (typeof parentNode === "undefined" || parentNode === null ||
					typeof childNodeType !== "object")
		return null;
	var childnodes, childNode;
	childNodeType = childNodeType.toLowerCase();
	childnodes = new Array();
	childNode = nodeTreeSearch(parentNode, childNodeType, Node.ELEMENT_NODE);
	childnodes.push(childNode);
	for (childNode = childNode.nextSibling; childNode != null;
			childNode = childNode.nextSibling)
		if (childNode.nodeName.toLowerCase() == childNodeType)
			childnodes.push(childNode);
	return childnodes;
}
*/

/*
if ( typeof document.implementation == "undefined" ||
		(typeof document.createTreeWalker == "undefined" &&
		document.implementation.hasFeature("Traversal", "2.0" ) == false )
) {
	// TreeWalker
	//

	TreeWalker = function ( root, whatToShow, filter, expandEntityReferences ) {
		if (typeof(root) == "undefined" || typeof(root.nodeType) == "undefined" ||
						root.nodeType != ELEMENT_NODE)
			throw "parameter 1 (root) is undefined, or is not a DOM node of ELEMENT type";
		this.root = root;
		this.currentNode = root;
		if (typeof(whatToShow) != "number")
			throw "parameter 2 (whatToShow) is not an integer/numeric type";
		this.whatToShow = whatToShow;
		this.filter = filter;
		this.expandEntityReferences = expandEntityReferences;	// not taken into account
	};

	document.createTreeWalker = function ( root, whatToShow, filter, expandEntityReferences ) {
		return new TreeWalker( root, whatToShow, filter, expandEntityReferences );
	};

	TreeWalker.prototype.parentNode = function() {
		var n = this.currentNode.parentNode;
		// loop until a node is found
		while ( n != this.root && n != null && !this._isAccepted( n ) )
			n = n.parentNode;
		if ( n != null )
			this.currentNode = n;
		return n;
	};

	TreeWalker.prototype.firstChild = function() {
		var n = this.currentNode.firstChild;
		// loop until a node is found
		while ( n != null && !this._isAccepted( n ) )
			n = n.nextSibling;
		if ( n != null )
			this.currentNode = n;
		return n;
	};

	TreeWalker.prototype.lastChild = function() {
		var n = this.currentNode.lastChild;
		// loop until a node is found
		while ( n != null && !this._isAccepted( n ) )
			n = n.previousSibling;
		if ( n != null )
			this.currentNode = n;
		return n;
	};

	TreeWalker.prototype.nextSibling = function() {
		var n = this.currentNode.nextSibling;
		// loop until a node is found
		while ( n != null && !this._isAccepted( n ) )
			n = n.nextSibling;
		if ( n != null )
			this.currentNode = n;
		return n;
	};

	TreeWalker.prototype.previosuSibling = function() {
		var n = this.currentNode.previousSibling;
		// loop until a node is found
		while ( n != null && !this._isAccepted( n ) )
			n = n.previousSibling;
		if ( n != null )
			this.currentNode = n;
		return n;
	};

	TreeWalker.prototype.nextNode = function() {
		var n = this.currentNode;
		var isPartOfSubTree = this._getNodeContains( this.root, this.currentNode );
		var insideRoot, nodeFilterConstant = NodeFilter.FILTER_ACCEPT;
		do {
			n = this._getNodeAfter( n, nodeFilterConstant );
			nodeFilterConstant = this._acceptNode( n );
			insideRoot = !isPartOfSubTree || this._getNodeContains( this.root, n );
		} while ( n != null && insideRoot && nodeFilterConstant != NodeFilter.FILTER_ACCEPT );

		if ( n != null && insideRoot )
			this.currentNode = n;
		else if ( !insideRoot )
			return null;
		return n;
	};

	TreeWalker.prototype.previousNode = function() {
		var n = this.currentNode;
		var isPartOfSubTree = this._getNodeContains( this.root, this.currentNode );
		var insideRoot, nodeFilterConstant = NodeFilter.FILTER_ACCEPT;
		do {
			n = this._getNodeBefore( n, nodeFilterConstant );
			nodeFilterConstant = this._acceptNode( n );
			insideRoot = !isPartOfSubTree || this._getNodeContains( this.root, n );
		} while ( n != null && insideRoot && nodeFilterConstant != NodeFilter.FILTER_ACCEPT );

		if ( n != null && insideRoot )
			this.currentNode = n;
		else if ( !insideRoot )
			return null;
		return n;
	};

	// private methods

	// checks whatToShow and filter to decide whether to accept node or not
	TreeWalker.prototype._isAccepted = function ( n ) {
		return this._acceptNode( n ) == NodeFilter.FILTER_ACCEPT;
	};

	// checks whatToShow and filter to decide whether to reject node or not
	TreeWalker.prototype._isRejected = function ( n ) {
		if ( this.filter != null )
			return this.filter.acceptNode( n ) == NodeFilter.FILTER_REJECT;
		return false;
	};

	// first checks the whatToShow and then the filter
	TreeWalker.prototype._acceptNode = function ( n ) {
		if ( n == null )
			return NodeFilter.FILTER_REJECT;
		var whatToShowAccepted = NodeFilter._acceptNode( n, this.whatToShow );
		if ( whatToShowAccepted != NodeFilter.FILTER_ACCEPT )
			return whatToShowAccepted;
		if ( this.filter != null )
			return this.filter.acceptNode( n );
		return NodeFilter.FILTER_ACCEPT;
	};

	// returns node after. Takes the filter into account in case of a reject
	TreeWalker.prototype._getNodeAfter = function (node, nodeFilterConstant) {
		if (typeof(node) == "undefined" || node == null)
			return (null);
		else if (node.hasChildNodes() == true &&
							nodeFilterConstant != NodeFilter.FILTER_REJECT )
			return (node.firstChild);
		else if (node.nextSibling != null)
			return (node.nextSibling);
		else
		{
			var tmp = node;
			while (true)
			{
				if (tmp == null)
					return (null);
				else if (tmp.nextSibling != null)
					return (tmp.nextSibling);
				else
					tmp = tmp.parentNode;
			}
		}
		return (null);
	};

	TreeWalker.prototype._getNodeBefore = function( n, nodeFilterConstant ) {
		if ( n == null )
			return null;
		if ( n.previousSibling != null )
			return this._getLastDescendant( n.previousSibling, nodeFilterConstant );
		else
			return n.parentNode;
	};

	// returns node after. Takes the filter into account in case of a reject
	TreeWalker.prototype._getLastDescendant = function ( n, nodeFilterConstant ) {
		if ( n.hasChildNodes() && !nodeFilterConstant != NodeFilter.FILTER_REJECT )
			return this._getLastDescendant( n.lastChild );
		else
			return n;
	};

	TreeWalker.prototype._getNodeContains = function ( p, c ) {
		if ( c == null )
			return false;
		else if ( p == c )
			return true;
		else
			return this._getNodeContains( p, c.parentNode );
	};


}// close if statement
*/


/*******************************************************************************
  My old HTML Parser
 *******************************************************************************/

type Etago = {
	etago: boolean;
	tag: string;
	tagName: string;
}

const buildDocFrag = {

	isContentForbidden : (
		containingElement: HTMLElement,
		containedElement: HTMLElement,
		isContainedByCalling: boolean
	): boolean => {
		// for any problems, content is forbidden (returns 'true')
		// the containing element must be defined, and its contained element found to
		//    to return false
		if (!containingElement || !containedElement)
			if (isContainedByCalling === true)
				return false;
			else
				return true;
		// get the array of elements that can be legally contained by elements starting with 1st letter
		// containable elements will be: { a: [ string ], address: [ string ]}
		const containableElements = htmlDomData.legalContainingElements[containingElement.nodeName.charAt(0)];
		if (typeof containableElements === "undefined")
			return (isContainedByCalling === true) ? false: true;
		// now use the full node name to get the array of containable names
		const elementsArray = containableElements[containingElement.nodeName];
		if (elementsArray == null) // now get array of container's containing elements
			return isContainedByCalling === true ? false: true;
		let containableElementslist = []; // this empty array for naming containable elements
		for (const item of elementsArray)
			containableElementslist = containableElements.concat(getArrayOfStrings(item));
		for (const item of containableElements)
			if (containedElement === item)
				return (isContainedByCalling === true) ? true: false;
		return (isContainedByCalling === true) ? false: true;
	},

	isContainedBy : function (containingElement: HTMLElement, containedElement: HTMLElement) {
		return this.isContentForbidden(containingElement, containedElement, true);
	},

	/* verifies whether string elemStr is a legal HTML element tag name
	   no option argument:  checks if any string is HTML element
		option = 0:  just checks if it is element (default for undefined argument)
		option = 1:  checks if element is a "container" element, i.e.
		   whether the element can have content (text, containing elements)
			Use function isContainerElement()!  Do not call verifyElem() directly!
		option = 2:  checks of the element has an optional end tag element
			Use function isOptionalEndTagElement()!  Do not call verifyElem() directly!
		option = 3:  asks if the element is forbidden from having an etago
	*/
	verifyElem : (elemStr: string, option?: number) => {
		const
			requiredEtagoElements = htmlDomData.requiredEtagoElements,
			optionalEtagoElements = htmlDomData.optionalEtagoElements,
			nonEtagoElements = htmlDomData.nonEtagoElements,
			impliedElements = htmlDomData.impliedElements;
		let i, j, x;
		if (typeof option !== "number")
			option = 0;  // just set it as a default for undefined or problem situations
		for (const item of optionalEtagoElements)
			if (elemStr === item)
				return true;
		if (option === 2)  /* for checking if element is optional end tag type */
			return false;
		if ((j = requiredEtagoElements[x = elemStr.charAt(0)].length) > 0)
			for (i = 0; i < j; i++)
				if (elemStr.toLowerCase() === requiredEtagoElements[x][i])
					return true;
		for (const item of impliedElements)
			if (elemStr === item)
				return true;
		if (option === 1)
			return false;
		for (const item of nonEtagoElements.length)
			if (elemStr === item)
				return true;
		return false;
	},

	isContainerElement : function (elemStr: string) {
		return this.verifyElem(elemStr, 1);
	},

	isOptionalEndTagElement : function (elemStr: string) {
		return this.verifyElem(elemStr, 2);
	},

	isNonEtagoElement : function (elemStr: string) {
		const nonEtagoElements = htmlDomData.nonEtagoElements;
		let i;
		for (i = 0; i < nonEtagoElements.length; i++)
			if (elemStr == nonEtagoElements[i])
				return true;
		return false;
	},

	/*
	function setCharacterEntities(htmlString) {
		var re, results,
			charEntities = htmlDomData.charEntities;
		for (var i = 0; i < charEntities.length; i += 2) {
			re = new RegExp("&" + charEntities[i] + ";", "g");
			htmlString = htmlString.replace(re, charEntities[i + 1]);
		}
		return htmlString;
	}
	*/
	TABLE_SET      : 0x01,
	THEAD_EXPLICIT : 0x02,
	THEAD_IMPLICIT : 0x04,
	TBODY_EXPLICIT : 0x08,
	TBODY_IMPLICIT : 0x10,
	TFOOT_EXPLICIT : 0x20,
	TFOOT_IMPLICIT : 0x40,
	IN_CELL        : 0x80,
	TABLE_SECTIONS : 0x02 | 0x04 | 0x08 | 0x10 | 0x20 | 0x40,
	/* this.THEAD_EXPLICIT | this.THEAD_IMPLICIT | this.TBODY_EXPLICIT |
		this.TBODY_IMPLICIT | this.TFOOT_EXPLICIT | this.TFOOT_IMPLICIT */

	setElementAttribute : (
		elemNode: HTMLElement,
		attributeName: string,
		attributeValue: string
	) => {
		const attrNode = document.createAttribute(attributeName);

		if (elemNode === null || elemNode.nodeType !== ELEMENT_NODE)
			return null;
		if (typeof(attributeName) !== "string" || typeof(attributeValue) !== "string")
			return null;
		attrNode.value = attributeValue;
		elemNode.setAttributeNode(attrNode);
		return elemNode;
	},

	isEventHandlerAttribute : (attribName: string) => {
		if (attribName.search(/^on/) >= 0)
			return true;
		return false;
	},

	// constructor to create end tage
	/*
	Etago (tagName: string) {
		if (typeof(tagName) != "string")
			throw new Error ("etago object construction requires string-type argument");
		const tagNameMatches = tagName.match(/<?\/?(\w+)>?/);
		if (tagNameMatches != null)
			tagName = tagName[1];
		this.etago = true;
		this.tag = this.tagName = tagName.trim();
	},*/

	setEventHandlerAttribute : (
		elemNode: HTMLElement,
		attribName: string,
		attribValue: () => void
	) => {
		const handlerTypes: RegExpMatchArray = attribName.match(/^o?n?(\w+)/)!;
		if (!handlerTypes[1])
			return false;
		const handlerType = handlerTypes[1];
		elemNode.addEventListener(handlerType, attribValue, false);
		return true;
	},

	addElementAttribute : function (
		elemNode: HTMLElement,
		attribName: string,
		attribValue: string
	) {
		if (typeof elemNode !== "object" || typeof elemNode.nodeType === "undefined" ||
					elemNode.nodeType !== ELEMENT_NODE || typeof attribName !== "string" ||
					typeof attribValue !== "string")
			return false;
		try {
			elemNode.setAttribute(attribName, attribValue);
			if (elemNode.getAttribute(attribName) !== attribValue)
				elemNode.setAttribute(attribName, attribValue);
		} catch (exception) {
			throw "\nunrecoverable error with elemNode[attribName] = attribValue;" +
				"\nelemNode.toString()-> " + elemNode.toString() +
				"\nattribName.toString()-> " + attribName.toString() +
				"\nattribValue.toString()-> " + attribValue.toString();
		}
		return true;
	},

	Etago : (tagName: string) => {
		if (typeof tagName !== "string")
			throw new Error("etago object construction requires string-type argument");
		const tagNameMatches = tagName.match(/<?\/?(\w+)>?/);
		if (tagNameMatches != null)
			tagName = tagNameMatches[1]; // Use tagNameMatches[1] instead of tagName[1]
		return Object.create({
			etago: true,
			tag: tagName,
			tagName: tagName
		});
	},

	parseElementNode : function (
		elementAsString: string,
		namespace: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		doctype: any
	) {
		const addElementAttribute = this.addElementAttribute,
			tag = elementAsString.match(/\s*(\w+)\s*\/?>?/);
		let elemNode: Element,
			attribPair: string[],
			attribValMatches: RegExpMatchArray | null;

		if (tag === null || this.verifyElem(tag[1]) === false)
			return null;
		if (doctype === "xhtml" && tag[0].search(/\s*\w+\s*\/>/) >= 0 && htmlDomData.isNonEtagoElement(tag[1]) === false)
			return null;
		if (namespace) {
			if ((elemNode = document.createElementNS(namespace, tag[1])) === null)
				return null;
		} else if ((elemNode = document.createElement(tag[1])) === null)
			return null;
		const attribsArray = elementAsString.match(/\w+="[^"]*"/g);
		if (attribsArray)
			for (const attribItem of attribsArray) {
				if (typeof(attribItem) != "string" || attribItem.length == 0)
					continue;
				attribPair = attribItem.split("=");
				attribPair[1] = attribPair[1].replace(/[\n\r\t\f]*/g, "");
				if ((attribValMatches = attribPair[1].match(/^"(.*)"$/)) != null)
					attribPair[1] = attribPair[1][1];
				if (attribPair.length == 2) {
					//			if (this.isEventHandlerAttribute(attribPair[0]) === true)
					//			this.setEventHandlerAttribute(elemNode as HTMLElement, attribPair[0], attribPair[1]);
					//else
					if (attribPair[0] == "style") {
						// if (cssParser(elemNode, attribPair[1]) == false)
						//	return null;
					//} else
						addElementAttribute(elemNode as HTMLElement, attribPair[0], attribPair[1]);
					} else
					//			elemNode[attribPair[0]] = attribPair[0];
						addElementAttribute(elemNode as HTMLElement, attribPair[0], attribPair[0]);
				}
			}
		return elemNode;
	},



	_build : function (
		markupString: string,
		parentNode: Node,
		namespace: string
	) {
		// changed arg type check from != "string" to just being defined
		const headElem: HTMLHeadElement = document.getElementsByTagName("head")[0], // in case needed for link,style
			markupNodes: HTMLElement[] = [],   // array of DOM node objects representing HTML structure
			elementStack: HTMLElement[] = [],  // push-pop array of DOM element objects for maintaining the DOM/HTML hierarchy
			tokenizingStringStart = "@@##=",  // used to convert \r,\t,\n,\f characters to prevent processing
			tokenizingStringEnd = "=!!",  // used for handling \r,\t,\n,\f characters for processing
			charactersToTokenize = [
				/\n/g, "n", "\n", /\t/g, "t", "\t",
				/\r/g, "r", "\r", /\f/g, "f", "\f"
			],
			// regular expression to find HTML comments
			HtmlCommentRE = /<![ \r\n\t]*(--([^-]|[\r\n]|-[^-])*--[ \r\n\t]*)>/g,
			startTagREstring = "<\\w+>|^<\\w+\\s|<\\w+" + tokenizingStringStart + "[ntrf]" + tokenizingStringEnd,
			XHTML = 0,
			HTML = 1;  // CONSTANTS

		let i, j,  // generalized loop counter/index

			currentMarkupNode: HTMLElement, // the DOM object being analyzed for placement
			currentMarkupNodeIndex: number,  // current position of the markupNodes array pointer
			elementStackIndex: number, // current position of the elementStack array pointer
			revisedMarkupString: string, // the edited parameter markupString where all whitespace
			// is removed so that only one space character exists before parsing
			docFrag: DocumentFragment,      // documentFragment node on which to hang DOM nodes
			//documentNode = null, // needed if script contains document.getElementBy..() method calls
			markupElements: string[],   // array of strings representing HTLML element markup
			markupElements2: string[] = [],  // used to concat strings
			doctype: number,     //  indicates whether doctype is XHMTL or HTML
			doctypeString: string,  // the string used in Node creation with a namespace parameter
			element: string,  // string representing the tag for HTML element
			currentParent: DocumentFragment,  // used for appendChild() method calls after determining valid children
			stackElementTag: string,   // the string representing a currently manipulate HTML element
			parentTag: string, //
			nodeName: string, // container for tag of a node
			node: HTMLElement,  // holder for a DOM object
			currentParentNodeName: string, // container for tag of a parent node
			styleString: string, // used in stylesheet processing
			styleSheet: HTMLStyleElement,  // DOM node that is a style sheet
			allContentText: boolean = false, // used to concat strings that may be part of large text node
			scriptDocFrag: DocumentFragment; // document fragments returned from processing SCRIPT elements

		if (typeof markupString == "undefined")
			return null;
		//		if (typeof markupString != "string")
		//  markupString = markupString.toString();
		doctype = HTML;
		doctypeString = "html";
		if (namespace && namespace.search(/xhtml/) >= 0) {
			doctype = XHTML;
			doctypeString = "xhtml";
		}
		if (typeof parentNode == "undefined")
			docFrag = document.createDocumentFragment();
		else
			docFrag = parentNode as DocumentFragment;
		// eliminate HTML comment markup

		revisedMarkupString = markupString.replace(HtmlCommentRE, "");
		// change all whitespace to tokens, and trim leading space
		for (i = 0; i < charactersToTokenize.length; i += 3)
			revisedMarkupString = revisedMarkupString.replace(charactersToTokenize[i],
				tokenizingStringStart + charactersToTokenize[i + 1] + tokenizingStringEnd);
		// split markup string to array of elements and containers
		markupElements = revisedMarkupString.split(/</g);
		// restore the '<' character
		for (i = 1; i < markupElements.length; i++)
			markupElements[i] = "<" + markupElements[i];
		// now split on '>' and restore
		for (i = 1; i < markupElements.length; i++) {
			const elementPair = markupElements[i].split(/>/g);
			for (j = 0; j < elementPair.length - 1; j++)
				elementPair[j] = elementPair[j] + ">";
			markupElements2 = markupElements2.concat(elementPair);
		}
		markupElements2.unshift(markupElements[0]);
		markupElements = markupElements2;

		// inner function used by _build() only
		function removeTokenizingStrings(content: string) {
			let i,
				token,
				reObj;
			if (content.search(tokenizingStringStart) >= 0) // saving time
				for (i = 1; i < charactersToTokenize.length; i += 3) {
					token = tokenizingStringStart + charactersToTokenize[i] + tokenizingStringEnd;
					reObj = new RegExp(token, "g");
					content = content.replace(reObj, charactersToTokenize[i + 1]);
				}
			return content;
		}

		// this loop creates an array (markupNodes) of DOM objects based on identified
		// tags in the order in which they are encountered
		const startTagRE = new RegExp(startTagREstring);
		for (i = 0, j = ""; i < markupElements.length; i++)
			if (markupElements[i].search(/^<\/\w+>$/) == 0) { // etago
				if (markupElements[i].search(/<\/script>/) == 0) {
					j = removeTokenizingStrings(j);
					if (j.search(/document\.getElements?By/) >= 0) {
						for (node = parentNode as HTMLElement; node && node != null; node = node.parentNode as HTMLElement)
							;
							// if (node == document)
							//	break;
						/*
						if (node != document)
							throw new Error("++ Document fragment contains SCRIPT element\n\twhich " +
								"makes call to a method requiring access to original document tree" +
								"\n++ Pass a node as argument #2 which is child of OR identical to document node"); */
					}
					//	markupNodes.push(document.createTextNode(
					//						convertAllCharEntityToUnicode(j)));
					j = "";
					allContentText = false;
					markupNodes.push(this.Etago("script"));
				} else if (allContentText == true) {
					j += markupElements[i];  // should actually be a parsing error, according to spec
				} else {
					markupElements[i] = removeTokenizingStrings(markupElements[i]);
					markupNodes.push(this.Etago(markupElements[i].substring(2)));
				}
			} else if (startTagRE.test(markupElements[i]) == true && allContentText == false) {
				if (markupElements[i].search(/<script /) >= 0)
					allContentText = true;
				markupElements[i] = removeTokenizingStrings(markupElements[i]);
				markupNodes.push(this.parseElementNode(markupElements[i], namespace, doctypeString) as HTMLElement);
			} else if (allContentText == false) {
				markupElements[i] = removeTokenizingStrings(markupElements[i]);
				// we might need a whitespace converter at this line
				//markupNodes.push(document.createTextNode(
				//						convertAllCharEntityToUnicode(markupElements[i])));
			} else
				j += markupElements[i];

		// now that nodes are identifued (DOM objects created)
		// each node is evaluated as being a child (or not) of the preceding node
		// done in this for loop below
		currentParent = docFrag;
		elementStackIndex = 0;
		if ((i = parentNode) != null)
			do {
				elementStackIndex = elementStack.unshift(
					htmlDomData. i.nodeName.toLowerCase()
				);
			}	while ((i = i.parentNode) != null && i != document.body && i.nodeType == 1);
		for (currentMarkupNodeIndex = 0;
			currentMarkupNodeIndex < markupNodes.length;
			currentMarkupNodeIndex++) {
		/* processsing block for markup identified as ETAGO
			1. try to find its match in the element stack using do-while loop
	  		2. okay to pop off stack if elements have optional end tags or element has no etago
			3. if no match is found, throw an error
	  		4. make the current parent the parent of the current parent node
		*/
			if ((currentMarkupNode = markupNodes[currentMarkupNodeIndex]) == null)
				throw new Error("A null node was found at index " + currentMarkupNodeIndex +
					" of the markupNodes array");
			if (currentMarkupNode.etago) {
				do {  // loop keeps popping to match the etago
					stackElementTag = elementStack.pop();  // pop the element stack but keep the tag
					elementStackIndex--;   // adjust the elementStack pointer accordingly
					currentParent = currentParent.parentNode;
				} while (stackElementTag !== currentMarkupNode.tag &&
						(this.isOptionalEndTagElement(stackElementTag) === true ||
							this.isNonEtagoElement(stackElementTag) === true) && elementStackIndex > 0);
				// if the etago does not match the starting tag, something is wrong! throw error
				if (stackElementTag !== currentMarkupNode.tag)
					throw new Error("ELEMENT block:  Error in HTML coding\n" +
								"etago for '" + currentMarkupNode.tag +
								"' does not match start tag " + "'" + stackElementTag +
								"\nMarkup Node Index = " + currentMarkupNodeIndex);
					/*
						throw alert("ELEMENT block:  Error in HTML coding\n" +
								"etago for '" + markupNodes[i].tag +
								"' does not match start tag " + "'" + tag + "'\n" +
								"argument 'markupString':\n" + markupString); */

				/* processsing block for markup identified as HTML element
					1. get its node name and that of the current parent (strings)
					2. can the current parent as an HTML element contain this element?
					  * if no,
					     a) find the current parent in the element stack and pop it
					     b) set a new current parent, and test it as a containing element
					     c) use the while loop until a legal parent is found, then proceed to the 'if yes'
					  * if yes
					    a) add the node to the element stack, and make it the current parent
					*/
			} else if (currentMarkupNode.nodeType === ELEMENT_NODE) {
				// this is the start of an element!  it will be called 'found element' below
				// the loop below determines how the found element relates to its parent node
				nodeName = currentMarkupNode.nodeName.toLowerCase();
				if (nodeName == "script") {
				/**************
	   			This code works
					if (currentMarkupNode.type == "text/javascript")
						currentMarkupNode.textContent =
									markupNodes[currentMarkupNodeIndex + 1].data;
					document.body.appendChild(currentMarkupNode);
	***************/
					this.evaluateJavaScriptElementCode(
						markupNodes[++currentMarkupNodeIndex].textContent as string, currentParent);
					currentMarkupNode = markupNodes[++currentMarkupNodeIndex];
					if (!(currentMarkupNode as Etago).etago && currentMarkupNode.tag != "script")
						throw new Error("SCRIPT element block:  Error in HTML coding\n" +
								"'script' etago expected\nMarkup Node Index =" + currentMarkupNodeIndex);
					continue;
				}	else if (nodeName == "style") {
	//  this requires special treatment as an internal stylesheet
					styleString = "";
					do {
						currentMarkupNode = markupNodes[++currentMarkupNodeIndex];
						if (currentMarkupNode.nodeType == TEXT_NODE)
							styleString += currentMarkupNode.data;
					} while (typeof currentMarkupNode.etago == "undefined" &&
										currentMarkupNode.tagName != "style");
					styleString = styleString.replace(/\n/, "", "gm");
					if ((styleSheet = createStyleSheet(styleString)) == null)
						throw new Error("Error in stylesheet creation during HTML parsing" +
								"\nMarkup Node Index = " + currentMarkupNodeIndex);
	//				headElem.appendChild(styleSheet);
					continue;
				} else if (nodeName == "link") { // process immediately
					headElem.appendChild(currentMarkupNode);
				} else {
					currentParentNodeName = currentParent.nodeName.toLowerCase();
					while (currentParent.nodeType === ELEMENT_NODE &&
									this.isContainedBy(currentParentNodeName, nodeName) === false) {
						// the current parent is forbidden from containing the found element
						// i.e., the found element cannot be a child of the current parent
						parentTag = elementStack[elementStackIndex - 1];
						if (this.isOptionalEndTagElement(parentTag) === true ||
										this.isNonEtagoElement(parentTag) === true) {
							// it is determined that the parent cannot contain the found element
							// but the element stack can only be popped
							elementStack.pop();
							elementStackIndex--;
							currentParent = currentParent.parentNode;
							currentParentNodeName = currentParent.nodeName.toLowerCase();
						} else { // parent end tag must be found and was not:  Error in HTML markup!
							throw new Error("ELEMENT block:  Error in HTML coding\n" +
								"'" + nodeName + "' can never be contained by '" + parentTag + "'");
						}
					}
					currentParent.appendChild(currentMarkupNode);
				}
				// the found element (and its created node) can be added to the parent now
				// and it becomes the parent but only if it is an etago element
				if (this.isNonEtagoElement(nodeName) === false) {
					currentParent = currentMarkupNode;
					elementStack.push(nodeName);
					elementStackIndex++;
				}
				/* processsing block for markup identified as Text for a text node
					markup is already a text node...append it to the current parent but only
	   			if the parent can contain text!!
				*/
			} else if (currentMarkupNode.nodeType == TEXT_NODE && currentMarkupNode.data.length > 0)
				currentParent.appendChild(currentMarkupNode);
		}
		if (parentNode != null)
			return currentParent;
		return docFrag;  // the tree has been created and is returned
	},

	/*
	adjustOffsets : function (positionArray: any, offset: number) {
		const newPositions = [];
		let i;
		for (i = 0; i < positionArray.length; i++)
			if (positionArray[i] >= offset)
				newPositions.push(positionArray[i] - offset);
		return newPositions;
	},*/

	evaluateJavaScriptElementCode : function (scriptTextContent: string, currentParent: DocumentFragment) {
		this.scriptContextCurrentParent = currentParent;
		// first join all strings that are concatenated
		const parsedText = [],
			CODE = 0,
			STRING = 1,
			topLevelEval = eval,
			anonFunctions = [],
			namedFunctions = [],
			commentRE = /\/\/[^\n\r]*[\n\r]|\/\*[^(*/)]*\*\/|\/\/.*$/g;

		let i: number,
			j: string | number,
			b1: number,
			b2: number,
			subArray: string[] = [],
			nest: number = 0,
			len: number,
			startFunc: number = 0,
			endFunc: number = 0,
			startBraces: number[],
			endBraces: number[],
			patternPositions: number[],
			count: unknown,
			code: string,
			namedFuncCode: string,
			globalLevelCode: string,
			fragmentScriptText: string[],
			processedText: string,
			inQuote = false,
			scriptText: string,
			funcParts: RegExpMatchArray;
		// strip all commented text: replace with single space character
		scriptText = scriptTextContent.replace(commentRE, " ");
		// unify all strings joined with concatenation operate '+'
		scriptText = scriptText.replace(/'[\s\n]*\+[\s\n]*'|"[\s\n]*\+[\s\n]*"/g, "");
		// tokenize all quote single quote (') chars with unlikely char combo: ~@#!~
		//	 then split the strings on the quotes
		//	 but DO NOT TOKENIZE backslashed quotes inside strings! */
		scriptText = scriptText.replace(/([^\\])'/g, "$1'~!@#~@#!~");
		fragmentScriptText = scriptText.split(/'~!@#/);
		// this loops replaces the tokens in split strings with the single (') quote chars
		for (i = 0; i < fragmentScriptText.length; i++) {
			if (inQuote == false) {
				fragmentScriptText[i] = fragmentScriptText[i].replace(/~@#!~/g, "'");
				inQuote = true;
			} else {
				fragmentScriptText[i] = fragmentScriptText[i].replace(/~@#!~/g, "");
				fragmentScriptText[i - 1] += "'";
				inQuote = false;
			}
		}
		// now loop through the array of strings and token the double quote (") chars
		//	 then split those strings, then turn array of strings at 2nd level into
		//	 array of strings at 1st level */
		for (i = 0; i < fragmentScriptText.length; i++) {
			processedText = fragmentScriptText[i].replace(/([^\\])""/g, "$1#@_!!_@#<!<!");
			processedText = processedText.replace(/([^\\])"/g, "$1!_@#<!<!");
			//		processedText = fragmentScriptText[i].replace(/([^\\])"/g, "$1\"~!@#~@#!~");
			subArray = subArray.concat(processedText.split(/<!<!/g));
		}
		fragmentScriptText = subArray;
		// go through every array element and replace tokens with double quote chars
		//	 create new array of objects (parsedText) and label strings as STRING
		//	 and everything outside of quote chars as CODE */
		for (i = 0, inQuote = false; i < fragmentScriptText.length; i++) {
			if (fragmentScriptText[i].search(/#@_!!_@#/) >= 0)
				fragmentScriptText[i] = fragmentScriptText[i].replace(/#@_!!_@#/g, "\"\"");
			else {
				if (inQuote == false) {
					fragmentScriptText[i] = fragmentScriptText[i].replace(/!_@#/g, "");
					inQuote = true;
				} else {
					fragmentScriptText[i] = "\"" + fragmentScriptText[i];
					fragmentScriptText[i] = fragmentScriptText[i].replace(/!_@#/g, "\"");
					inQuote = false;
				}
			}
		}
		// at this point, all fragments should be contained in quotes if strings
		// or contained in non-quoted text if code (not-string) blocks
		for (i = 0, j = ""; i < fragmentScriptText.length; i++)
			if (j == "") {  // no active string now
				// this block will take care of all fragments that have been contained in quotes
				if (fragmentScriptText[i].charAt(0) == "'" || fragmentScriptText[i].charAt(0) == "\"") {
					j = fragmentScriptText[i].charAt(0);
					if (j == fragmentScriptText[i].charAt(fragmentScriptText[i].length - 1)) {
						parsedText.push( { text : fragmentScriptText[i], type : STRING } );
						j = "";
					}
				} else
					parsedText.push( { text : fragmentScriptText[i], type : CODE } );
			} else {  // there is active string across fragments for some reason
				fragmentScriptText[i - 1] += fragmentScriptText[i];
				fragmentScriptText.splice(i--, 1);
				if (j == fragmentScriptText[i].charAt(fragmentScriptText[i].length - 1)) {
					parsedText.push( { text : fragmentScriptText[i], type : STRING } );
					j = "";  // process the end of the string
				}
			}
		if (j != "")
			parsedText.push( { text : fragmentScriptText[i - 1], type : STRING } );

		//loop through all parsedText CODE blocks and identify string patterns
		//and process them in an inner loop
		//patterns are / function /, /document.write/
		//== named functions must be taken out of the CODE text and pushed as
		//	parsedText elements as NAMED FUNCTIONS
		//== document.write() calls are renamed to a special handler
		//== for function blocks, consecutive parsedText elements may need concatting */

		function processCodeBlocks() {
			while (b1 < startBraces.length || b2 < endBraces.length)
				if (b1 < startBraces.length && b2 < endBraces.length) {
					if (startBraces[b1] < endBraces[b2]) {
						b1++;
						nest++;
					} else if (--nest == 0) {
						endFunc = endBraces[b2++];
						return;
					}
				} else if (b1 < startBraces.length) {
					while (b1 < startBraces.length) {
						b1++;
						nest++;
					}
				} else {
					while (b2 < endBraces.length) {
						if (--nest == 0) {
							endFunc = endBraces[b2++];
							return;
						}
						b2++;
					}
				}
		}

		for (i = 0, namedFuncCode = globalLevelCode = ""; i < parsedText.length; i++)
			if (parsedText[i].type == CODE) {
				code = parsedText[i].text;
				endBraces = this.findMultiplePatternPositions(code, /\}/);
				startBraces = this.findMultiplePatternPositions(code, /\{/);
				b1 = b2 = 0;
				if (namedFuncCode.length > 0) {
					processCodeBlocks();
					if (nest == 0) {
						namedFunctions.push(namedFuncCode + code.slice(startFunc, endFunc + 1));
						namedFuncCode = "";
						code = code.substring(0, startFunc) + code.substring(endFunc + 1);
					}	else {
						namedFuncCode += code.substr(startFunc);
						continue;
					}
				}
				patternPositions = this.findMultiplePatternPositions(code, / function /);
				for (j = 0; j < patternPositions.length; j++) {
					// use a brace parsing algorithm to isolate the function block
					for (b1 = 0; patternPositions[j] > startBraces[b1]; b1++)
						; // find the starting brace
					startFunc = patternPositions[j];
					nest = 0;
					processCodeBlocks();
					if (nest == 0) {
						namedFuncCode = code.slice(startFunc, endFunc + 1);
						code = code.substring(0, startFunc - 1) + code.substring(endFunc + 1);
						len = startBraces.length;
						startBraces = adjustOffsets(startBraces, endFunc + 1 - startFunc);
						b1 -= len - startBraces.length;
						len = endBraces.length;
						endBraces = adjustOffsets(endBraces, endFunc + 1 - startFunc);
						b2 -= len - endBraces.length;
						len = patternPositions.length;
						patternPositions = adjustOffsets(patternPositions, endFunc + 1 - startFunc);
						j -= len - patternPositions.length;
						namedFunctions.push(namedFuncCode.replace(/document.write/g,
							"buildDocFrag.docWriteProcessor"));
						namedFuncCode = "";
					} else {
						namedFuncCode = code.substr(startFunc);
						code = code.substr(0, startFunc - 1);
					}
				}
				// replace document.write() calls with processing handler
				globalLevelCode += code.replace(/document.write/g, "buildDocFrag.docWriteProcessor");
			} else { // must be a string
				if (namedFuncCode.length > 0)
					namedFuncCode += parsedText[i].text;
				else
					globalLevelCode += parsedText[i].text;
			}
		// Finally wrap all global level namedFuncCode into anonymous functions, and call them in
		// document order
		code = "";
		for (i = 0; i < namedFunctions.length; i++) {
			funcParts = namedFunctions[i].match(/function\s+(\w+)\s*\(\s*(\w+)\s*,+\s*(\w+)\s*\)\s*(\{.*\})/) as RegExpMatchArray;
			code = "var " + funcParts[1] + " = new Function (";
			for (j = 2; j < funcParts.length - 1; j++) {
				code += "\"" + funcParts[j] + "\"";
				if (j < funcParts.length - 2)
					code += ", ";
			}
			code += ", \"" + funcParts[j] + "\")";
			topLevelEval(code);
		}
		console.log("\nvalue of 'code':\n" + code +
					"\n\nvalue of 'globalLevelCode':\n" + globalLevelCode);
		topLevelEval(globalLevelCode);
		if (this.documentWritesMarkup.length > 0) {
			this._build(this.documentWritesMarkup, this.scriptContextCurrentParent);
			this.documentWritesMarkup = "";
		}
	},

	scriptContextCurrentParent : DocumentFragment,

	documentWritesMarkup : "",

	docWriteProcessor : function (markUp: string) {
		buildDocFrag.documentWritesMarkup += markUp;
	},

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	findMultiplePatternPositions : function (query: string, pattern: RegExp): number[] {
		const positions: number[] = [];
		let result: RegExpExecArray;
		//		if (typeof pattern != "string") {
		//			pattern = pattern.toString();
		//			if (pattern.charAt(0) == pattern.charAt(pattern.length - 1))
		//				pattern = pattern.substring(1, pattern.length - 1);
		//		}
		const patternRE: RegExp = new RegExp(pattern, "g");
		while ((result = patternRE.exec(query) as RegExpExecArray) instanceof Object == true)
			positions.push(result.index);
		return positions;
	},

	extractCommentNodes : function (markup: string) {
		const comments = [];  // array for storing HTML comments found in document
		let	commentsIndex = 0,  // comment enumerator
			commentsIndexString,  // the numerical index value as a string
			comment, // holder for a found comment
			commentSearchString,  // used to create a string looking for HTML comments
			startPosn, endPosn; // position indexes when looking for comments
		// pull out HTML comments but keep their position in document order
		commentSearchString = markup.replace(/[\n\t\r\f]/g, " ");
		while ((startPosn = commentSearchString.search(/<!--/)) >= 0) {
			if ((endPosn = (commentSearchString.substr(startPosn + 1)).search(/-->/)) < 0)
				throw new Error("Unterminated comment in the HTML text");
			comment = (commentSearchString.substr(4, endPosn - 3)).trim();
			commentsIndexString = commentsIndex.toString();
			while (commentsIndexString.length < 4)
				commentsIndexString = "0" + commentsIndexString;
			commentsIndex++;
			markup.replace(comment, commentsIndexString);
			comments.push(comment);
			commentSearchString = commentSearchString.substr(endPosn);
		}
		return comments;
	}
};

