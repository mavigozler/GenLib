
/***********************************************************************

Library functions:

All of these are objects within the Libgen object!
Use "Libgen.<object>" to reference

  ParseUrl() -- constructor which takes URL string and returns object for manipulation
  DocumentLinksListGenerator() - constructor with methods to generate
     a list of URLs for a document's links
  isValidFloat()  -- returns true if the string represents a valid float value
  isWithinFloatError() -- returns true if two float values are within
      the possible error of equal float values
  getRandom() -- retrieves a random value from within a range (min -> max number limit)
      or from a 'set' (as an array) of elements
  WeightedArrayElementSelector() -- can be used to select from a set of choices like
     getRandom(), but with weights placed on the possibilities so that equal random selection
     does not happen
  getCheckedRadioValue() -- returns the text value of checked option of radio control
  setCheckedRadioValue()
  getSigDigits() -- returns an integer corresponding to the number of
      significant digits
  setSigDigits() -- returns a string of the value with the correct
      number of significant digits and rounded
  htmlToPlain() -- removes HTML tags and tries to make formatted text file
		ordered_list() -- a support function for htmlToPlain()
		unordered_list() -- a support function for htmlToPlain()
		enumerate_list_item() -- a support function for htmlToPlain()
  obj2source() -- converts object properties and methods to something
     usable in source code
  filterFormEnterKey() -- stops a form from submitting when ENTER/RETURN
    key is pressed


 ***********************************************************************/

const Libgen = {
	/* constructor for what?? */
	ParseUrl : function (urlString: string) {
		const urlRegex = /(\w+):\/\/([\w.]+):?(\d+)\/(\w+)\??()#?()/;

		if (typeof urlString !== "string")
			throw null;
		//                1=protocol   2=host 3=port   4=pathname 5=
		this.matchedRegex = urlString.match(urlRegex);
		this.protocol = this.matchedRegex[1];
		this.hash = this.anchor;
	},

	DocumentLinksListGenerator : function (docObj) {
		var i;
		if (docObj instanceof Document == false)
			throw Exception("argument must be DOM document object");
		this.DomDoc = docObj;
		this.links = docObj.links;
		this.text = 0;
		this.UL = 1;
		this.OLarabic = this.OL = 2;
		this.OLlowerRoman = 3;
		this.OLlowerAlpha = 4;
		this.generateList = function (listType, asLinks) {
			var listNode, listItemNode, node;
			if (typeof asLinks == "undefined")
				asLinks = false;
			if (listType == this.UL)
				listNode = this.DomDoc.createElement("ul");
			else {
				listNode = this.DomDoc.createElement("ol");
				if (listType == this.OLlowerRoman)
					listNode.style.listStyleType = "lower-roman";
				else if (listType == this.OLlowerAlpha)
					listNode.style.listStyleType = "lower-alpha";
			}
			for (i = 0; i < this.links.length; i++) {
				if (listType != this.text) {
					listItemNode = this.DomDoc.createElement("li");
					if (asLinks == true) {
						node = this.DomDoc.createElement("a");
						node.setAttribute("href", this.links[i]);
						node.appendChild(this.DomDoc.createTextNode(this.links[i]));
						listItemNode.appendChild(node);
					} else
						listItemNode.appendChild(this.DomDoc.createTextNode(
							this.links[i]));
					listNode.appendChild(listItemNode);
				}
			}
			return listNode;
		};
	},


	/* This is a constructor WeightedArrayElementSelector
	*/
	WeightedArrayElementSelector : function (choicesArray, weightValuesArray) {
		// Calculate cumulative sum of weights (should be done only once)
		this.choicesArray = typeof(choicesArray) == "undefined" ? choicesArray : new Array(choicesArray);
		this.weightValuesArray = new Array(weightValuesArray);
		// arrays must be sorted from low to high in the weighted values array
		this.sortedMappedArray = new Array();
		var i, mappedArrayElem;
		for (i = 0; i < weightValuesArray.length; i++) {
			mappedArrayElem = {};
			mappedArrayElem.weightValue = weightValuesArray[i];
			if (typeof(choicesArray) != "undefined")
				mappedArrayElem.choice = choicesArray[i];
			this.sortedMappedArray.push(mappedArrayElem);
		}

		this.sortedMappedArray.sort(function(elem1, elem2) {
				return (elem1.weightValue - elem2.weightValue);
			}
		);

		this.cumsum = new Array();
		this.cumsum[0] = this.sortedMappedArray[0].weightValue;

		for (i = 1; i < this.sortedMappedArray.length; i++)
			this.cumsum[i]= this.cumsum[i - 1] + this.sortedMappedArray[i].weightValue;
		//check if the last element in cumsum is greater than 1.0
		//this would prevent and endless while loop
		if (this.cumsum[this.sortedMappedArray.length - 1] > 1.0)
			throw Error("last element of cumsum array is > 1.0!!");

		this.getChoice = function () {
			if (typeof(this.choicesArray) == "undefined")
				throw alert("an array of choices was not defined");
			return (this.sortedMappedArray[this.getIndex()].choice);
		}

		this.getIndex = function () {
			var randNum = Math.random(); //random is a float between 0 and 1
			/* note that for (j = 0; randNum < this.cumsum[j]; j++); works the same */
			for (var i = 0; randNum > this.cumsum[i]; i++)
				;
			return (i);
		};
	},

	htmlToPlain : function (HTMLstring) {
		var ordered_idx = -1,
			ordered_list_level = [],
			list_type_idx = -1,
			ORDERED_LIST = 1,
			UNORDERED_LIST = 2,
			list_style = [],
			list_type = [],
			unordered_idx = -1,
			unordered_list_level = [ '*', '-', '+', '>', '=' ],
			LALPHA = 1,
		  UALPHA = 2,
		  LROMAN = 3,
		  UROMAN = 4;

		function ordered_list(cmd) {
			if (cmd == true) {
				list_type[++list_type_idx] = ORDERED_LIST;
				list_style[list_type_idx] = 0;
				ordered_list_level[++ordered_idx] = 0;
			} else
				ordered_idx--;
			return;
		}

		function unordered_list(cmd) {
			if (cmd == true) {
				list_type[++list_type_idx] = UNORDERED_LIST;
				unordered_idx++;
			} else
				unordered_idx--;
			return;
		}

		function enumerate_list_item() {
			var i, j, val, word = "";
			if (list_type[list_type_idx] == ORDERED_LIST) {
				val = ordered_list_level[ordered_idx]++;
				switch (list_style[list_type_idx]) {
				case LALPHA:
					for (i = 1; i >= 0; i--)
						if ((j = Math.floor(val / Math.pow(26, i))) > 0)
						{
							word += 'a' + j - 1;
							val -= j * Math.pow(26, i);
						}
					break;
				case UALPHA:
					for (i = 1; i >= 0; i--)
						if ((j = Math.floor(val / Math.pow(26, i))) > 0)
						{
							word += 'A' + j - 1;
							val -= j * Math.pow(26, i);
						}
					break;
				case LROMAN:
					if (val / 50 > 0) {
						word += 'l';
						val -= 50;
					}
					while (Math.floor(val / 10) > 0) {
						word += 'x';
						val -= 10;
					}
					if (val == 9) {
						word += 'ix';
						break;
					}
					if (val > 5) {
						word += 'v';
						val -= 5;
					}
					if (val == 4) {
						word += 'iv';
						break;
					}
					while (Math.floor(val / 1) > 0) {
						word += 'i';
						val--;
					}
					break;
				case UROMAN:
					if (val / 50 > 0) {
						word += 'L';
						val -= 50;
					}
					while (Math.floor(val / 10) > 0) {
						word += 'X';
						val -= 10;
					}
					if (val == 9) {
						word += "IX";
						break;
					}
					if (val > 5) {
						word += 'V';
						val -= 5;
					}
					if (val == 4) {
						word += "IV";
						break;
					}
					while (Math.floor(val / 1) > 0) {
						word += 'I';
						val--;
					}
					break;
				default:
				}
			}
			else
				word = unordered_list_level[unordered_idx];
			return (word);
		}
		var   FIND_ELEMENT            = 1,
		      READING_ELEMENT         = 2,
		      FIND_ATTRIBUTE          = 3,
		      READING_ATTRIBUTE       = 4,
		      READING_ATTRIBUTE_VALUE = 5,
		      READING_ENTITYREF       = 6,
			ch,
			newstring = "",
			word = "",
			i, j, statelevel = 0, state = 0, etago = false,
			element_actions = [
				{element: "p",   action: "\n\n"               },
				{element: "ol",  action: ordered_list         },
				{element: "ul",  action: unordered_list       },
				{element: "li",  action: enumerate_list_item  },
				{element: "br",  action: "\n"                 }
			],
			entityref_actions = [
				{entityref: "deg",  action: " degrees"  },
				{entityref: "lt",   action: "<"         },
				{entityref: "gt",   action: ">"         },
				{entityref: "amp",  action: "&"         }
			];
		for (i = 0; i < HTMLstring.length; i++)
			switch (ch = HTMLstring.charAt(i)) {
			case '<':
				state = FIND_ELEMENT;
				statelevel++;
				break;
			case '>':
				etago = false;
			case ' ':
				if (state == READING_ELEMENT) {
					for (j = 0; j < element_actions.length; j++)
						if (element_actions[j].element == word)
						{
							if (typeof(element_actions[j].action) == "string")
								newstring += element_actions[j].action;
							else
								(element_actions[j].action)(true);
							break;
						}
					word = "";
					state = FIND_ATTRIBUTE;
				}
				else if (state == READING_ATTRIBUTE_VALUE && ch == ' ')
					state = FIND_ATTRIBUTE;
				else if (state == READING_ENTITYREF ||
								(state == READING_ATTRIBUTE && ch == '>'))
					return null;
				if (ch == ' ')
					newstring += ' ';
				else
					statelevel = state = 0;
				break;
			case '&':
				state = READING_ENTITYREF;
				statelevel++;
				break;
			case ';':
				if (state == READING_ENTITYREF) {
					for (j = 0; j < entityref_actions.length; j++)
						if (entityref_actions[j].element == word) {
							newstring += entityref_actions[j].action;
							break;
						}
					word = "";
				}
				else
					newstring += word;
				if (--statelevel == 0)
					state = 0;
				break;
			case '=':
				if (state == 0)
					newstring += ch;
				else if (state != READING_ATTRIBUTE)
					return null;
				state = READING_ATTRIBUTE_VALUE;
				break;
			case '/':
				if (state == 0)
					newstring += ch;
				else if (state != FIND_ELEMENT)
					return null;
				etago = true;
				break;
			default:
				if (state == 0)
					newstring += ch;
				else {
					word += ch;
					if (state == FIND_ELEMENT)
						state = READING_ELEMENT;
					else if (state == FIND_ATTRIBUTE)
						state = READING_ATTRIBUTE;
				}
			}
		return newstring;
	},

	obj2source : function (objtype, objname, obj) {
		var i, str = null, objtypstr, len, start;

		if (objtype == "var")
			str = objname + " = " + String(obj) + ";"
		else if (objtype == "object") {
			if (objname != null)
				str = objname + " = { ";
			else
				str = "{ ";
			len = str.length;
			for (i in obj) {
				start = str.length;
				str += String(i) + ": ";
				objtypstr = typeof(obj[i]);
				if (objtypstr == "object") {
					if (obj[i].pop) /* indicates an array */
						objtypstr = "array";
					str += obj2source(objtypstr, null, obj[i]);
				} else if (objtypstr == "string")
					str += "\"" + obj[i] + "\"";
				else if (objtypstr == "boolean" || objtypstr == "number")
					str += obj[i];
				str += ",";
				len += str.length - start;
				if (len > 70) {
					str += "\n";
					len = 0;
				} else
					str += " ";
			}
			str = str.substr(0, str.length - 2) + " }";
		} else if (objtype == "array") {
			if (objname != null)
				str = objname + " = [ ";
			else
				str = "[ ";
			len = str.length;
			for (i = 0; i < obj.length; i++) {
				start = str.length;
				objtypstr = typeof(obj[i]);
				if (objtypstr == "object") {
					if (obj[i].pop) /* indicates an array */
						objtypstr = "array";
					str += obj2source(objtypstr, null, obj[i]);
				} else if (objtypstr == "string")
					str += "\"" + obj[i] + "\"";
				else if (objtypstr == "boolean" || objtypstr == "number")
					str += obj[i];
				if (i < obj.length - 1)
					str += ", ";
				len += str.length - start;
				if (len > 70 && i != obj.length - 1) {
					str += "\n";
					len = 0;
				} else
					str += " ";
			}
			str += " ]";
		} else
			return null;
		return str;
	},


	// ======  DEBUGGING FUNCTIONS ======================================
	testSetSigDigits : function () { // used for testing setSigDigits()
		var table = [
		//       value			digits			answer
			[		23.489,			3,			"23.5"	   			],
			[		23.489,			7,			"23.48900"				],
			[		"2.3489e1",		3,			"2.35e1"					],
			[		"2.3489e1",		7,			"2.348900e1"			],
			[		2.3489e-10,		3,			"0.00000000023489"	],
			[		2.3489e-10,		7,			"0.0000000002348900"	],
			[		0.000023489,	3,			"0.0000235"				],
			[		0.000023489,	7,			"0.00002348900"		]
		];
		var w;
		if (typeof(w) == "undefined" || w == null)
			w = window.open("", "", "resizable=yes,height=400,width=400");
		w.document.write("<html><head>");
		w.document.write("<style type=\"text/css\">" +
			"table {background-color:#222;}" +
			"td {font:normal 100% 'Courier New',Courier,monospace;padding:0.2em 0.5em;}" +
			"td, th {background-color:white;}" +
			"<\/style>");
		w.document.write("<\/head><body><table id=\"results\">" +
			"<tr><th>Input Value<th>Sig. Digits<th>Actual Result<th>Expected Result");
		var result;
		for (var i = 0; i < table.length; i++)
		{
			result = setSigDigits(table[i][0], table[i][1]);
			w.document.write("<tr><td>" + table[i][0] +
				"<td style=\"text-align:center;\">" +
				table[i][1] + "<td>" + result + "<td>" + table[i][2]);
		}
		w.document.write("<\/table><\/body><\/html>");
		w.document.close();
	},

	// this is a constructor, and should be called with 'new' operator
	filterFormEnterKey : function (form) {
		if (typeof(form) != "object")
			return;
		this.form = form;
		this.stopEnterKey = function(evt) {
	  	evt = (evt) ? evt : ((event) ? event : null);
	  	var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
			for (var tnode = node.parentNode; tnode != null && tnode != document;
							tnode = tnode.parentNode)
			if (tnode == this.form)
				break;
	  	if (tnode == this.form && (evt.keyCode == 13) && (node.type == "text"))
				return false;
			return true;
		};
		document.onkeypress = this.stopEnterKey;
	}
}