"use strict";

export
type THeaderObjPropsColumns = {
   header: string;
   objprop: string;
   columns?: number;
   xmlInfo?: TXmlColumnFormatting;
};

export
type TXmlColumnFormatting = {
   fontWeight?: "normal" | "bold";
   color?: number | string;
   background?: number | string;
   fontStyle?: "italic";
   columnWidth?: number | string;
   prevColumn?: boolean;
};

const ExcelXmlStyingTemplate =
`<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
   xmlns:o="urn:schemas-microsoft-com:office:office"
   xmlns:x="urn:schemas-microsoft-com:office:excel"
   xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
   xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>`,
   ReplaceableTableContent =
`   <Column ss:Width="15"/>
   <Column ss:Width="8"/>
   <Column ss:Width="25"/>
   <Row ss:StyleID="headerStyle">
    <Cell><Data ss:Type="String">Column 1 Header</Data></Cell>
    <Cell><Data ss:Type="String">Column 2 Header</Data></Cell>
    <Cell><Data ss:Type="String">Column 3 Header</Data></Cell>
   </Row>`,
   ReplaceableStyingContent =
`   <Styles>
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

let ExcelTableColumnWidthStyling = "<Column ss:Width=\"${columnWidth}\"/>";

export
class CSVFiles {
   private CSVrowedFields: string[][] = [];
   private rowedCSVoutput: string[] = [];
   private dataStore: any[] = [];

   constructor() {
   }

/**
 * @method ObjectToCSV
 *    converts a JS/TS object to comma-separated field values of row data
 * @param { {[key: string]: any}[] } data
 *    takes any object in a homogeneous array as input, including one with multilevel
 *     properties and generates a CSV file from it. Can also be JSON object.
 * @param { headerObjPropsColumns[] } properties
 *    the data to be used in the object is specified by properties and places the value
 *     in the CSV file
 * Example:
 *  object:
 *     {
 *        name: {
 *          first: "John",
 *          last: "Smith"
 *        }
 *        dob: "12-23-2003",
 *        age: 42
 *     }
 *  CSV headers: "Last Name", "First Name", "Date of Birth", "Age"
 *  objprop: [ "name/last", "name/first", "dob", "age"]
 */
   ObjectToCSV (
      data: {[key: string]: any}[],
      properties: THeaderObjPropsColumns[],
      metadata?: {name:string; value:string;}[]
   ): void {
      let modifiedProperties: THeaderObjPropsColumns[] | null,
         fieldValue: any,
         row: number = 0,
         repetition: number = 1,
         adjustmentResponse: {
            value: any,
            fieldValueType: "number" | "string" | "boolean" | "unknown"
         },
         useHyphenNote: boolean = false,
         lastXmlInfo: TXmlColumnFormatting | undefined;

      if (metadata)
         for (let metadatum of metadata) {
            this.CSVrowedFields[row] = [];
            this.CSVrowedFields[row].push(metadatum.name);
            this.CSVrowedFields[row].push(metadatum.value);
            row++;
         }
      this.CSVrowedFields[row++] = [ "------- Start of columnar data with headers next row -------" ];
      this.CSVrowedFields[row] = [];
      if (properties) {
         for (let column of properties) {
            if (column.columns)
               repetition = column.columns;
            for (let i = 0; i < repetition; i++)
               this.CSVrowedFields[row].push(column.header);
            repetition = 1;
         }
         row++;
         modifiedProperties = properties;
         for (let elem of modifiedProperties)
            elem.objprop = elem.objprop.replace(/\//g, ".")
      } else
         modifiedProperties = null
      for (let i = 0; i < data.length; i++) {
         this.CSVrowedFields[row] = [];
         if (modifiedProperties == null)
            continue;
         for (let prop of modifiedProperties) {
            if (prop.columns) {
               repetition = prop.columns;
               for (let j = 0; j < data.length && j < repetition; j++, i++) {
                  fieldValue = CSVFiles.getPropertyByPath(data[i], prop.objprop);
                  adjustmentResponse = this.adjustFieldValue(fieldValue);
                  if (adjustmentResponse.value.search(/^\s*\-/) >= 0) {
                     useHyphenNote = true;
                     adjustmentResponse.value = "'" + adjustmentResponse.value;
                  }
                  this.CSVrowedFields[row].push(adjustmentResponse.value);
               }
               repetition = 1;
            } else {
               fieldValue = CSVFiles.getPropertyByPath(data[i], prop.objprop);
               adjustmentResponse = this.adjustFieldValue(fieldValue);
               if (adjustmentResponse.value.search(/^\s*\-/) >= 0) {
                  useHyphenNote = true;
                  adjustmentResponse.value = "'" + adjustmentResponse.value;
               }
               this.CSVrowedFields[row].push(adjustmentResponse.value);
            }
         }
         row++;
      }
      for (let row = 0; row < this.CSVrowedFields.length; row++)
         this.rowedCSVoutput.push(this.CSVrowedFields[row].join(",") + "\n");
      if (useHyphenNote == true)
         this.rowedCSVoutput.push("\n\n" + hyphenCellsNote);
      this.createFile("data.csv");

      for (let item of properties) {
         if (typeof lastXmlInfo !== "undefined" && item.xmlInfo &&
                item.xmlInfo.prevColumn && item.xmlInfo)
            item.xmlInfo = lastXmlInfo;
         lastXmlInfo = item.xmlInfo;
      }
      this.createExcelXmlStyingFile("data.xml", properties);
   }

   static getPropertyByPath(
      obj: any,
      path: string
   ): any {
      let fieldValue: any;

      fieldValue = path.split(".").reduce((value, property) => value[property], obj);
      if (typeof fieldValue == "undefined" || fieldValue == null)
         fieldValue = obj;
      return fieldValue;
   }

   adjustFieldValue(fieldValue: any): {
      value: any,
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
            if (fieldValue.search(/,/) >= 0)
               fieldValue = '"' + fieldValue + '"';
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
      this.ObjectToCSV(this.dataStore, properties, metadata);
   }

   CSVtoArray (CSVinput: string[]) {

   }

   createButton (options: {
      type: "BUTTON";
      script: (evt: Event) => void;
      attachment: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement;
      dataId?: string;
      buttonTitle?: string;
   }) {  //
      let buttonTitle: string = "CSV",
         buttonControl: HTMLButtonElement = document.createElement("button");
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

   addData (dataBlock: any[] | any | null | undefined): boolean {
      if (typeof dataBlock == "undefined" || dataBlock == null)
         return false;
      if (Array.isArray(dataBlock) == true)
         this.dataStore = this.dataStore.concat(dataBlock);
      else
         this.dataStore.push(dataBlock);
      return true;
   }

   createFile (fileName: string) {
      const blob = new Blob(this.rowedCSVoutput, { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      if (fileName.substring(fileName.length - ".csv".length) !== ".csv")
         fileName += ".csv";
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    createExcelXmlStyingFile (fileName: string, properties: THeaderObjPropsColumns[]) {
      const link = document.createElement('a');
      let content: string = "",
         line: string,
         blob: Blob,
         url: string,
         prop: THeaderObjPropsColumns,
         columns: number = properties.length;


      if (fileName.substring(fileName.length - ".xml".length) !== ".xml")
         fileName += ".xml";
      for (let i = 0;  i < columns; i++) {
         prop = properties[i];
         if (prop && typeof prop.columns !== "undefined")
            columns += prop.columns;
         if (prop && prop.xmlInfo && prop.xmlInfo.columnWidth)
            line = `\n   <Column ss:Width="${prop.xmlInfo.columnWidth}"/>`;
         else
            line = `\n   <Column/>`;
         content += line;
      }
      content += "\n   <Row ss:StyleID=\"headerStyle\">";
      for (let i = 0; i < columns; i++)
         content += `\n    <Cell><Data ss:Type="String">Column ${i + 1} Header</Data></Cell>`;
      content += "\n   </Row>" + ReplaceableStyingContent;
      content = ExcelXmlStyingTemplate + content + ExcelXmlStylingFooter;
      blob = new Blob([content], { type: 'text/xml;charset=utf-8;' }),
      url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
}





/**************************************************************************************/

let CSVtestInputData:   {
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

