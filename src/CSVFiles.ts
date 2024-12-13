"use strict";

type THeaderObjPropsColumns = {
	header: string;
	objprop: string;
	columns?: number;
	xmlInfo?: TXmlColumnFormatting;
};

type TXmlColumnFormatting = {
	fontWeight?: "normal" | "bold";
	color?: number | string;
	background?: number | string;
	fontStyle?: "italic";
	columnWidth?: number | string;
	prevColumn?: boolean;
};

export { CSVFiles, THeaderObjPropsColumns };

const ExcelXmlStylingTemplate =
`<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
	xmlns:o="urn:schemas-microsoft-com:office:office"
	xmlns:x="urn:schemas-microsoft-com:office:excel"
	xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
	xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>`,
	/*
	ReplaceableTableContent =
`	<Column ss:Width="15"/>
	<Column ss:Width="8"/>
	<Column ss:Width="25"/>
	<Row ss:StyleID="headerStyle">
	 <Cell><Data ss:Type="String">Column 1 Header</Data></Cell>
	 <Cell><Data ss:Type="String">Column 2 Header</Data></Cell>
	 <Cell><Data ss:Type="String">Column 3 Header</Data></Cell>
	</Row>`, */
	ReplaceableStylingContent =
`	<Styles>
	<Style ss:ID="headerStyle">
	 <Font ss:Bold="1"/>
	 <Interior ss:Color="#000000" ss:Pattern="Solid"/>
	 <NumberFormat ss:Format="@"/>
	 <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
	</Style>
  </Styles>`,
	ExcelXmlStylingFooter =
`  </Table>
 </Worksheet>
</Workbook>`,
	hyphenCellsNote =
`One or more of the cells in the CSV file started with a hyphen '-' character
Excel interprets cells starting with a hyphen character as a special formula
and will usually give a '#NAME?' error in the cell. To avoid this, an apostrophe
character has been inserted before the hyphen character.`;

// const ExcelTableColumnWidthStyling = "<Column ss:Width=\"${columnWidth}\"/>";

class CSVFiles {
	private CSVrowedFields: string[][] = [];
	// a row of CSV string fields, an array of string arrays
	private rowedCSVoutput: string[] = [];
	// an array of strings that represent CSV "output"
	private dataStore: unknown[] = [];

	constructor() {}

	/**
	 * @method ObjectToCSV
	 *	 converts a JS/TS object to comma-separated field values of row data
	* @param { {[key: string]: any}[] } data
	*	 takes any object in a homogeneous array as input, including one with multilevel
	*	  properties and generates a CSV file from it. Can also be JSON object.
	* @param { headerObjPropsColumns[] } properties
	*	 the data to be used in the object is specified by properties and places the value
	*	  in the CSV file
	* Example:
	*  object:
	*	  {
	*		  name: {
	*			 first: "John",
	*			 last: "Smith"
	*		  }
	*		  dob: "12-23-2003",
	*		  age: 42
	*	  }
	*  CSV headers: "Last Name", "First Name", "Date of Birth", "Age"
	*  objprop: [ "name/last", "name/first", "dob", "age"]
	* @param {} metadata
	*  optional metadata to include
	*/
	ObjectToCSV (
		data: {[key: string]: unknown}[],
		properties: THeaderObjPropsColumns[],
		metadata?: {name:string; value:string;}[]
	): void {
		let modifiedProperties: THeaderObjPropsColumns[] | null,
			fieldValue: unknown,
			row: number = 0,
			repetition: number = 1,
			adjustmentResponse: {
				value: number | string | boolean | unknown,
				fieldValueType: "number" | "string" | "boolean" | "unknown"
			},
			useHyphenNote: boolean = false,
			lastXmlInfo: TXmlColumnFormatting | undefined;

		// optional metadata representing name,value pairs
		if (metadata)
			for (const metadatum of metadata) {
				this.CSVrowedFields[row] = [];
				this.CSVrowedFields[row].push(metadatum.name);
				this.CSVrowedFields[row].push(metadatum.value);
				row++;
			}
		this.CSVrowedFields[row++] = [ "------- Start of columnar data with headers next row -------" ];
		this.CSVrowedFields[row] = [];
		if (properties) {
			for (const column of properties) {
				if (column.columns)
					repetition = column.columns;
				for (let i = 0; i < repetition; i++)
					this.CSVrowedFields[row].push(column.header);
				repetition = 1;
			}
			row++;
			modifiedProperties = properties;
			for (const elem of modifiedProperties)
				elem.objprop = elem.objprop.replace(/\//g, ".");
		} else
			modifiedProperties = null;
		for (let i = 0; i < data.length; i++) {
			this.CSVrowedFields[row] = [];
			if (modifiedProperties == null)
				continue;
			for (const prop of modifiedProperties) {
				if (prop.columns) {
					repetition = prop.columns;
					for (let j = 0; j < data.length && j < repetition; j++, i++) {
						fieldValue = CSVFiles.getPropertyByPath(data[i], prop.objprop);
						adjustmentResponse = this.adjustFieldValue(fieldValue);
						if ((adjustmentResponse.value as string).search(/^\s*-/) >= 0) {
							useHyphenNote = true;
							adjustmentResponse.value = "'" + adjustmentResponse.value;
						}
						this.CSVrowedFields[row].push(adjustmentResponse.value as string);
					}
					repetition = 1;
				} else {
					fieldValue = CSVFiles.getPropertyByPath(data[i], prop.objprop);
					adjustmentResponse = this.adjustFieldValue(fieldValue);
					if ((adjustmentResponse.value as string).search(/^\s*-/) >= 0) {
						useHyphenNote = true;
						adjustmentResponse.value = "'" + adjustmentResponse.value;
					}
					this.CSVrowedFields[row].push(adjustmentResponse.value as string);
				}
			}
			row++;
		}
		for (let row = 0; row < this.CSVrowedFields.length; row++)
			this.rowedCSVoutput.push(this.CSVrowedFields[row].join(",") + "\n");
		if (useHyphenNote == true)
			this.rowedCSVoutput.push("\n\n" + hyphenCellsNote);
		this.createFile("data.csv");

		for (const item of properties) {
			if (typeof lastXmlInfo !== "undefined" && item.xmlInfo &&
						item.xmlInfo.prevColumn && item.xmlInfo)
				item.xmlInfo = lastXmlInfo;
			lastXmlInfo = item.xmlInfo;
		}
		this.createExcelXmlStylingFile("data.xml", properties);
	}

	static getPropertyByPath(
		obj: object,
		path: string
	): unknown {
		let fieldValue: unknown;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fieldValue = path.split(".").reduce((value: {[key: string]: any;}, property) => value[property], obj);
		if (typeof fieldValue == "undefined" || fieldValue == null)
			fieldValue = obj;
		return fieldValue;
	}

	adjustFieldValue(fieldValue: number | string | boolean | unknown): {
		value: number | string | boolean | unknown,
		fieldValueType: "number" | "string" | "boolean" | "unknown"
	} {
		let fieldValueType: "number" | "string" | "boolean" | "unknown";

		switch (typeof fieldValue) {
		case "number":
			fieldValue = fieldValue.toString();
			fieldValueType = "number";
			break;
		case "boolean":
			fieldValueType = "boolean";
			fieldValue = fieldValue.toString();
			break;
		case "string":
			fieldValueType = "string";
			fieldValue = fieldValue.replace(/"/g, "\"\"");
			if ((fieldValue as string).search(/,/) >= 0)
				fieldValue = "\"" + fieldValue + "\"";
			break;
		default:
			fieldValueType = "unknown";
		}
		return {
			value: fieldValue,
			fieldValueType: fieldValueType
		};
	}

	StoredDataToCSV (
		properties: THeaderObjPropsColumns[],
		metadata?: {name:string;value:string;}[]
	) {
		this.ObjectToCSV(this.dataStore as {[key: string]: unknown;}[], properties, metadata);
	}

	// ref: http://stackoverflow.com/a/1293163/2343
	// This will parse a delimited string into an array of
	// arrays. The default delimiter is the comma, but this
	// can be overriden in the second argument.
	// public
	CSVToArray(
		strData: string,
		strDelimiter: string = "," // default delimiter is ','
	): string[][] {
	// Create a regular expression to parse the CSV values.
		const objPattern = new RegExp((
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		), "gi");
		// Create an array to hold our data. Give the array
		// a default empty first row.
		const arrData: Array<Array<string>> = [[]];
		// Create an array to hold our individual pattern
		// matching groups.
		let arrMatches: RegExpExecArray | null = null;
		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while ((arrMatches = objPattern.exec( strData ))) {
			// Get the delimiter that was found.
			const strMatchedDelimiter = arrMatches[ 1 ];

			// Check to see if the given delimiter has a length
			// (is not the start of string) and if it matches
			// field delimiter. If id does not, then we know
			// that this delimiter is a row delimiter.
			if (
				strMatchedDelimiter.length &&
				strMatchedDelimiter !== strDelimiter
			) {
				// Since we have reached a new row of data,
				// add an empty row to our data array.
				arrData.push( [] );
			}
			let strMatchedValue;
			// Now that we have our delimiter out of the way,
			// let's check to see which kind of value we
			// captured (quoted or unquoted).
			if (arrMatches[ 2 ]) {
				// We found a quoted value. When we capture
				// this value, unescape any double quotes.
				strMatchedValue = arrMatches[ 2 ].replace(
					new RegExp( "\"\"", "g" ),
					"\""
				);
			} else {
				// We found a non-quoted value.
				strMatchedValue = arrMatches[ 3 ];
			}
			// Now that we have our value string, let's add
			// it to the data array.
			arrData[ arrData.length - 1 ].push( strMatchedValue );
		}
		// Return the parsed data.
		return arrData;
	}

	createButton (options: {
		type: "BUTTON";
		script: (evt: Event) => void;
		attachment: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement;
		dataId?: string;
		buttonTitle?: string;
	}) {  //
		const buttonControl: HTMLButtonElement = document.createElement("button");
		let buttonTitle: string = "CSV";
		if (options.buttonTitle)
			buttonTitle = options.buttonTitle;
		buttonControl.appendChild(document.createTextNode(
			buttonTitle
		));
		options.attachment.appendChild(buttonControl);
		buttonControl.addEventListener("click", options.script);
		if (options.dataId)
			buttonControl.setAttribute("data-id", options.dataId.toString());
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	addData (dataBlock: any[] | any | null | undefined): boolean {
		if (typeof dataBlock == "undefined" || dataBlock == null)
			return false;
		if (Array.isArray(dataBlock) == true)
			this.dataStore = this.dataStore.concat(dataBlock);
		else
			this.dataStore.push(dataBlock);
		return true;
	}
	// eslint-enable @typescript-eslint/no-explicit-any

	createFile (fileName: string) {
		const blob = new Blob(this.rowedCSVoutput, { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		if (fileName.substring(fileName.length - ".csv".length) !== ".csv")
			fileName += ".csv";
		link.setAttribute("href", url);
		link.setAttribute("download", fileName);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	createExcelXmlStylingFile (fileName: string, properties: THeaderObjPropsColumns[]) {
		const link = document.createElement("a");
		let content: string = "",
			line: string,
			prop: THeaderObjPropsColumns,
			columns: number = properties.length;


		if (fileName.substring(fileName.length - ".xml".length) !== ".xml")
			fileName += ".xml";
		for (let i = 0;  i < columns; i++) {
			prop = properties[i];
			if (prop && typeof prop.columns !== "undefined")
				columns += prop.columns;
			if (prop && prop.xmlInfo && prop.xmlInfo.columnWidth)
				line = `\n	<Column ss:Width="${prop.xmlInfo.columnWidth}"/>`;
			else
				line = "\n	<Column/>";
			content += line;
		}
		content += "\n	<Row ss:StyleID=\"headerStyle\">";
		for (let i = 0; i < columns; i++)
			content += `\n	 <Cell><Data ss:Type="String">Column ${i + 1} Header</Data></Cell>`;
		content += "\n	</Row>" + ReplaceableStylingContent;
		content = ExcelXmlStylingTemplate + content + ExcelXmlStylingFooter;
		const blob = new Blob([content], { type: "text/xml;charset=utf-8;" });
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", fileName);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}


/**************************************************************************************/
/* eslint-disable */
let CSVtestInputData: {
		name: {
			first: string;
			last: string;
		};
		dob: string;
		age: number;
		}[] = [
			{
			name: {
				first: "John",
				last: "Smith"
			},
			dob: "12-23-2003",
			age: 42
			},
			{
			name: {
				first: "Dave",
				last: "Brown"
			},
			dob: "1-9-1994",
			age: 56
			},
			{
			name: {
				first: "Susan",
				last: "Green"
			},
			dob: "06-04-2003",
			age: 24
			}
		];

