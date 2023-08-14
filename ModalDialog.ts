/***********************************************************
     DOCUMENTATION at bottom


     Dependencies:
      *   iCss.ts

************************************************************/
//export
type TContentContainer =  {
   element: "div" | "p" | "span";
   id?: string;
   class?: string;
   style?: string; // CSS inline
};

//export
type TDialogText = {
   content: string;
   contentContainer: TContentContainer;
};

//export
type TDialogFormElement = {
   elemName: string;
   elementContainer: TContentContainer;
   attributes?: {name: string; value: string;}[];
   eventHandler?: {
      event: string;
      handler: () => void;
      bubble: boolean;
   };
   children?: (TDialogText | TDialogFormElement)[];
};

//export
type TDialogBlock =  {
   block: TDialogControl[];
   blockContainer: TContentContainer;
};

//export
type TDialogControl = (TDialogText | TDialogFormElement | TDialogBlock) & {
   domNode?: HTMLInputElement;
   attribName?: string;
   initValue?: string | null;
};

//export
type TModalDialogResponse = {
   length: number;
   [key: string]: string | number;

};

/**
 * @class ModalDialog
 * @param {object} - conforms to requirements below for building form in modal window
 * @returns {DOMnode} returns a DOMnode (DIV) that is the pseudo-modal window
 */
//export
class ModalDialog {
   dialogContainerId: string; // parent of dialog
   dialogContainer: HTMLDivElement ;
   dialogId: string = "modal-dialog"; // designated dialog Id
   dialog: HTMLFormElement;
   dialogCallback: (data: any | null) => boolean;
   modalStyle: HTMLStyleElement = document.createElement("style");;
   dialogControls: TDialogControl[];

   constructor(dialogSettings: {
      callback: (data: any) => boolean,
      containerId: string,
      dialogSpec: {
         form: TDialogControl[];
         formStyle: {selector: string; rule: string;}[];
      },
      addCloseButton?: boolean,
   }) {
      let buttonElem: HTMLButtonElement,
         iCSS: iCss = new iCss();

      this.dialogControls = dialogSettings.dialogSpec.form;

      if (typeof dialogSettings.callback != "function" && dialogSettings.callback != null)
         throw "ModalDialog(): object parameter missing required 'callback' reference to defined function";
      this.dialogCallback = dialogSettings.callback;
// find the existing DOM node to contain the form
      if ((this.dialogContainer = document.getElementById((this.dialogContainerId = dialogSettings.containerId)) as HTMLDivElement) == null)
         throw "ModalDialog(): object parameter missing 'id' reference to DIV representing form window";

   // looks for previously created dialog in document
      if ((this.dialog = document.getElementById(this.dialogId) as HTMLFormElement) == null) {
         this.dialog = document.createElement("form");
         this.dialog.id = this.dialogId;
         this.dialogContainer.appendChild(this.dialog); // attach new form
      }
      if (dialogSettings.addCloseButton && dialogSettings.addCloseButton == true)
         this.dialogContainer.appendChild(this.getCloseButton());
      document.head.appendChild(this.modalStyle);

      if (dialogSettings.dialogSpec && dialogSettings.dialogSpec.formStyle)
         for (let rule of dialogSettings.dialogSpec.formStyle)
            this.modalStyle.sheet!.insertRule(rule.selector + rule.rule);
      else {
         let defaultStyle = [
               " label {font: bold 11pt Arial,sans-serif;color:purple}",
               "input  {font: normal 11pt Arial,sans-serif}",
               "#" + this.dialogContainer.id + " {width:40%;font:bold 16pt Arial,sans-serif;margin:auto;" +
               "background-color:#f8f8f8;padding:1em;position:fixed;top:30%;left:30%;" +
               "color:maroon;border:12px outset darkgreen;z-index:1;",
               "#modal-form {border:2px solid blue;margin:1em;background-color:#f8f8f8;padding:1em;}"
            ];
         for (let rule of defaultStyle) {
            if (iCSS.getCssRule(rule) == null)
              this.modalStyle.sheet!.insertRule(rule);
         }
      }
      this.modalStyle.sheet!.insertRule(
         "#" + this.dialogContainerId + " button {margin:auto 1em;}"
      );

      for (let control of this.dialogControls)
         this.buildDomNodeInModalWin(this.dialogContainer, control);
      this.dialogContainer.style.display = "block";

// create a Submit Data button
      buttonElem = document.createElement("button");
      buttonElem.type = "button";
      buttonElem.id = "submit-data";
      buttonElem.appendChild(document.createTextNode("Submit Data"));
      buttonElem.addEventListener("click", () => {
         let formData: {name: string; value: string}[] = [ ];

         for (let datum of this.dialogControls)
            if (datum.domNode!.value)
               formData.push({
                  name: datum.attribName!,
                  value: datum.domNode!.value
            });

         if (this.dialogCallback(formData) == false)
            return -1;
         this.dialogContainer.style.display = "none";
         this.cleanModalWindow();
      }, false);
      this.dialogContainer.appendChild(buttonElem);

// create a Cancel button
      buttonElem = document.createElement("button");
      buttonElem.type = "button";
      buttonElem.appendChild(document.createTextNode("Cancel"));
      buttonElem.addEventListener("click", () => {
         dialogSettings.callback(null);
         this.dialogContainer.style.display = "none";
         this.cleanModalWindow();
      }, false);
      this.dialogContainer.appendChild(buttonElem);

// create a Reset button
      buttonElem = document.createElement("button");
      buttonElem.type = "button";
      buttonElem.appendChild(document.createTextNode("Reset"));
      buttonElem.addEventListener("click", () => {
         for (let control of this.dialogControls)
            if (control.initValue != null)
               control.domNode!.value = control.initValue;
         }, false);
      this.dialogContainer.appendChild(buttonElem);
   }

   showModalDialog() {

   }

   hideModalDialog() {

   }

   close(): void {
      this.cleanModalWindow();
   }
   // ensure close control
   getCloseButton(): HTMLImageElement {
      let buttonElem: HTMLButtonElement = document.createElement("button"),
         imgElem: HTMLImageElement = document.createElement("img");

      buttonElem.style.float = "right";
      buttonElem.style.border = "none";
      buttonElem.style.background = "none";
      imgElem = document.createElement("img");
      buttonElem.addEventListener("click", () => {
         this.dialogCallback(null);
         this.dialogContainer.style.display = "none";
         this.cleanModalWindow();
      }, false);
      buttonElem.appendChild(imgElem);
      imgElem.src = "data:image/png;base64,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";
      imgElem.style.color = "red";
      imgElem.style.fontWeight = "bold";
      imgElem.style.width = "25px";
      imgElem.alt = "\u26d2";
      return imgElem;
   }


/*********************************************************************************
*            SUPPORT FUNCTIONS
*********************************************************************************/
   cleanModalWindow(): void {
      while (this.dialogContainer.firstChild)
         this.dialogContainer.removeChild(this.dialogContainer.firstChild);
      this.modalStyle.parentNode!.removeChild(this.modalStyle);
   }
/* formControlData object properties:
   tag (element name),
   domNode (actual DOM node),
   attribName (form name),
   initValue (for reset)

   {
         formElement: string;
         text: string;
         block: null;
         container: HTMLElement;
         attributes: string[]
      }
*/
   processFormElement(
      parentDomNode: HTMLElement,
      nodeInfo: TDialogControl
   ) {
      let containerNode:  HTMLElement,
         inputElement: HTMLInputElement = nodeInfo.domNode as HTMLInputElement,
         dialogControlData: any;

      if ((nodeInfo as TDialogBlock).block)
         this.buildDomNodeInModalWin(parentDomNode, nodeInfo);
      else if ((nodeInfo as TDialogText).content)
         parentDomNode.appendChild(document.createTextNode(
            (nodeInfo as TDialogText).content
         ));
      else { // TDialogFormElement
         let elemInfo: TDialogFormElement = nodeInfo as TDialogFormElement;

         dialogControlData.domNode = document.createElement(elemInfo.elemName);
         if (elemInfo.elementContainer) {
            containerNode = document.createElement(elemInfo.elementContainer.element);
            parentDomNode.appendChild(containerNode);
         } else
            containerNode = parentDomNode;
         containerNode.appendChild(dialogControlData.domNode);
         if (elemInfo.attributes)
            for (let attribute of elemInfo.attributes) {
                  if (attribute.name == "name")
                     dialogControlData.attribName = attribute.value;
                  if (attribute.name == "value") {
                     if (typeof attribute.value != "string" &&
                           inputElement.placeholder && typeof inputElement.value == "string")
                        attribute.value = inputElement.placeholder;
                     else
                        inputElement.value = attribute.value;
                  } else
                     dialogControlData.domNode.setAttribute(attribute.name, attribute.value);
            }
         if (elemInfo.eventHandler)
            dialogControlData.domNode.addEventListener(elemInfo.eventHandler.event, elemInfo.eventHandler.handler,
                     elemInfo.eventHandler.bubble);
         if (elemInfo.children)
            for (let child of elemInfo.children)
               this.buildDomNodeInModalWin(containerNode, child as TDialogControl);
         nodeInfo.initValue = inputElement.value ?  inputElement.value : null;
         if (dialogControlData.tag == "input" || dialogControlData.tag == "textarea" || dialogControlData.tag == "select")
            this.dialogControls.push(dialogControlData);
      }
   }

   buildDomNodeInModalWin(
      parentDomNode: HTMLElement,
      dlgCtrlInfo: TDialogControl
   ) {
      let containerNode: HTMLElement,
         textControl: TDialogText = dlgCtrlInfo as TDialogText,
         blockElems: TDialogBlock = dlgCtrlInfo as TDialogBlock;

// Text as control
      if (textControl.content) {
         if (textControl.contentContainer) {
            containerNode = document.createElement(textControl.contentContainer.element);
            parentDomNode.appendChild(containerNode);
         } else
            containerNode = parentDomNode;
         containerNode.appendChild(document.createTextNode(textControl.content));
// Block as control
      } else if (blockElems.block) {
         if (!blockElems.blockContainer)
            throw "modalFormWindow: a block definition must have a container property";
         containerNode = document.createElement(blockElems.blockContainer.element);
         parentDomNode.appendChild(containerNode);

         if (blockElems.blockContainer.id )
            containerNode.id = blockElems.blockContainer.id;
         if (blockElems.blockContainer.class)
            containerNode.className = blockElems.blockContainer.class;
         if (blockElems.blockContainer.style)
            containerNode.setAttribute("style", blockElems.blockContainer.style);

         for (let block of blockElems.block)
            this.processFormElement(containerNode, block as TDialogControl);
      } else
            this.processFormElement(parentDomNode, dlgCtrlInfo);
   }
}


/* *******************************************************************************
                DOCUMENTATION
 *      {
 *          windowDivId: id of element to contain modal window,
 *          setFormElement: boolean (if true, set "form"; needed for SharePoint),
 *          callback: <callback function> [required]
 *          addCloseButton: boolean,
 *          form: {
 *              controls: [
 *                  { text: @string,
 *                     "container": { element: "div"|"p"|"span",
 *                           id: <id-value>,
 *                           class: <class-value> ,
 *                           style: <style-value
 *                      }
 *                  },
 *                  {
 *                      formElement: legal HTML element name,
 *                      container: { element: "div"|"p"|"span",
 *                           id: <id-value>,
 *                           class: <class-value> ,
 *                           style: <style-value
 *                      }
 *                      attributes: [{name: , value: },...],
 *                      eventHandler: {event: , function: , bubble: }
 *                      children: [
 *                          array of "element" or "text"
 *                      ]
 *                  },
 *                  {
 *                      block: [
 *                          {formElement: ...},
 *                          {formElement: ...}
 *                      ],
 *                      container: { element: "div"|"p"|"span",
 *                           id: <id-value>,
 *                           class: <class-value> ,
 *
 *
 *                           style: <style-value
 *                      }
 *                  }
 *              ],
 *              style: [
 *                  rule, ...  // rule = "selector {property:propertyValues;...}"
 *              ]
 *          }
 *      }
 *
 *
 * Example:
 *
 *
	mdlDlg = new ModalDialog({
		callback: serenaFormResponse,  // should be a function
		dialogContainerId: "modal-window",
		dialogId: "modal-form",
		form: {
			controls: [
				introText[0],
				{ block: [
					{ formElement:"label", children: [ {text: "Header: "} ] },
					{ formElement:"input",
							attributes: [
							{name: "name", value: "Serena-header" },
							{name: headerName, value: headerValue },
							{name: "size", value: 50 }
						]
					}
				  ],
				  	container: {element: "p" }
				},
				{ block: [
					{ formElement:"label", children: [ {text:"CSV-Formatted Serena Data: "} ] },
					{ formElement:"textarea", attributes: [
							{name: "name", value: "Serena-input" },
							{name: "rows", value: 15},
							{name: "placeholder", value: serenaInput },
							// "\ne.g.\n\n" +  SerenaInputExample },
							{name: "style", value: "width:100%;" }
						],
						eventHandler: {	event: "change", handler: () => {
							let parsedLines, headerFound;

							parsedLines = CSVToArray(getFormControl("Serena-input", this).value);
							for (let line of parsedLines)
								if (line.join(",").search(/^\s*"?(CAB.*) \-/) >= 0) {
									headerFound = line.join(",").match(/^\s*"?(CAB.*) \-/)[1];
									if (checkHeader == true) {
										if (headerValue != headerFound)
											return bootbox.alert("The ticket data header does not correspond to the " +
											"item header. Either change the header or change the data. No further processing performed.");
									} else
										getFormControl("Serena-header", this).value = headerFound;
								}
							if (!headerFound)
								return bootbox.alert("The submitted data lacked the identifying information " +
									"to show it is Serena ticket data. Obtain properly formatted CSV data.");
						}, bubble: false }
				   }
				  ], container: {element: "p"}
				},
			],
			style: [
            " label {font: bold 11pt Arial,sans-serif;color:purple}",
            "input  {font: normal 10pt Arial,sans-serif}",
            "#modal-window {width:50%;font:normal 11pt Arial,sans-serif;margin:auto;" +
                    "background-color:#f8f8f8;padding:1em;position:fixed;top:5%;left:25%;" +
                    "border:12px outset darkgreen;}",
            "#modal-form {border:2px solid blue;margin:1em;background-color:#f8f8f8;padding:1em;}"
			]
		}
	});

 *

**********************************************************************************/
