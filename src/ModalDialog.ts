"use strict";
/***********************************************************
     DOCUMENTATION at bottom
     Dependencies:
      *   iCss.ts
************************************************************/
import { iCss } from "./iCss";
import { CreateUUID } from "./etc";
import type { DialogItem, DialogCallback, ModalDialogStyling, DialogText, DialogBlock,
	DialogFormInputElement, ContentContainerSpec, FormInputElemObject,
	ContentContainer } from "./ModalDialogTypes.d.ts";

export {
	ModalDialog,
   ModalDialog_BUTTONS
};

enum ModalDialog_BUTTONS {
	OK_BUTTON,
	CANCEL_BUTTON,
	RESET_BUTTON,
	SUBMIT_BUTTON
}
/**
 * @class ModalDialog -- constructs an HTMLFormElemment as a dialog within a
 *     HTMLElement block element that is NOT part of the dialog but part of the
 *     web page. It is supposed to trap user inputs while dialog is visible
 * @param {object} - conforms to requirements below for building form in modal window
 * @returns {DOMnode} returns a DOMnode (DIV) that is the pseudo-modal window
 */
class ModalDialog {
	dialogContainerId: string; // id of parent containe of dialog
	dialogContainer: HTMLDivElement; // the elements object (a DIV) (nott partt of dialog)
	dialogId: string = "modal-dialog"; // the id attrib of HTMLFormElement as dialog container
	dialogForm: HTMLFormElement;  // the form element which contains  dialog elemmes
	dialogCallback: DialogCallback; // user function when dialog submitted
	modalStyle: HTMLStyleElement = document.createElement("style");
	dialogItems: DialogItem[]; // elements of form contained dialog
	activeContainer: HTMLElement;
	computedStyle: CSSStyleDeclaration = {} as CSSStyleDeclaration;

	constructor(params: {
      dialogSpec: { // check specification for defining
         dialog: DialogItem[];  // all controls of dialog form
         dialogStyle?: {namedStyle: string} | ModalDialogStyling[]; // dialog styling
      },
      callback: DialogCallback,  // user handler for submitted dialog data
      containerId?: string,  //  id attribute of dialog parent (needed?)
      addCloseButton?: boolean,   //
   }) {
		const iCSS: iCss = new iCss();
		this.dialogItems = params.dialogSpec.dialog;
		this.dialogCallback = params.callback;

		// find the existing DOM node to contain the dialog
		if (params.containerId)
			this.dialogContainer = document.getElementById(this.dialogContainerId = params.containerId) as
				HTMLDivElement;
		else { // no specified container: build it dynamically
			const onFlyDlgDivElem = document.createElement("div");
			onFlyDlgDivElem.id = "dlg" + CreateUUID();
			const docBodyElem = document.getElementsByTagName("body")[0];
			docBodyElem.insertBefore(onFlyDlgDivElem, docBodyElem.firstChild);
			this.dialogContainer = onFlyDlgDivElem;
			this.dialogContainerId = onFlyDlgDivElem.id;
		}
		// looks for previously created dialog in document OR create the form
		if ((this.dialogForm = document.getElementById(this.dialogId) as HTMLFormElement) == null) {
			this.dialogForm = document.createElement("form");
			this.dialogForm.id = this.dialogId;
			this.dialogContainer.appendChild(this.dialogForm); // attach new form
		}
		if (params.addCloseButton && params.addCloseButton == true)
			this.dialogContainer.appendChild(this.getCloseButton());
		document.head.appendChild(this.modalStyle);

		let styling: ModalDialogStyling[] | undefined;
		if (params.dialogSpec.dialogStyle)
			if (params.dialogSpec.dialogStyle as {namedStyle: string}) {
				const namedStyle = (params.dialogSpec.dialogStyle as {namedStyle:string}).namedStyle as string;
				styling = namedStyles.find(elem => elem.styleName == namedStyle)?.style;
			} else { // form style is CSS spec {
				styling = params.dialogSpec.dialogStyle as ModalDialogStyling[];
			}
		else
			styling = namedStyles.find(elem => elem.styleName == "default")?.style;
		if (styling) {
			for (const rule of styling) {
				rule.selector = rule.selector.replace(/\$\{([^}]+)\}/mg,
						(_: unknown, match: string) => {return eval(match)});
				rule.rule = rule.rule.replace(/\$\{([^}]+)\}/mg,
						(_: unknown, match: string) => {return eval(match)});
				if (iCSS.getCssRule(rule.selector) == null)
					this.modalStyle.sheet!.insertRule(`${rule.selector} {${rule.rule}}`);
			}
		}
		this.activeContainer = this.dialogForm;
		this.modalStyle.sheet!.insertRule("#" + this.dialogContainerId + " button {margin:auto 1em;}");
		for (const item of this.dialogItems)
			this.buildDialogItemInDialog(item);
		this.hideModalDialog();
	}

	/**
	 * @method buildDialogItemInDialog --
	 * @param itemSpec
	 */
	buildDialogItemInDialog(
		itemSpec: DialogItem
	) {
		let textSpec: DialogText,
			blockSpec: DialogBlock,
			containerElem: HTMLElement | null;
		if ((textSpec = itemSpec as DialogText).text) {
			const textContainer: ContentContainer | undefined = textSpec.textContainer;
			if (textContainer) {
				if ((textSpec.textContainer as ContentContainerSpec).element) {
					if ((containerElem = this.buildItemContainer(textSpec.textContainer as ContentContainerSpec)) == null)
						throw Error("");
				} else
					containerElem = textSpec.textContainer as HTMLElement;
				this.activeContainer.appendChild(containerElem);
			} else
				containerElem = this.activeContainer;
			containerElem.innerHTML += textSpec.text;
		//	this.activeContainer = containerElem;
		// Block as control
		} else if ((blockSpec = itemSpec as DialogBlock).block) {
			const blockContainer: ContentContainer | undefined = blockSpec.blockContainer;
			if (blockContainer) {
				if ((blockContainer as ContentContainerSpec).element) {
					if ((containerElem = this.buildItemContainer(blockSpec.blockContainer as ContentContainerSpec)) == null)
						throw Error("");
				} else
					containerElem = blockSpec.blockContainer as HTMLElement;
				this.activeContainer.appendChild(containerElem);
			} else
				containerElem = this.activeContainer;
			for (const dlgItem of blockSpec.block) {
				if ((dlgItem as DialogText).textContainer)
					(dlgItem as DialogText).textContainer = containerElem;
				else if ((dlgItem as DialogFormInputElement).elementContainer)
					(dlgItem as DialogFormInputElement).elementContainer = containerElem;
				this.buildDialogItemInDialog(dlgItem);
			}
			this.activeContainer = containerElem;
		} else // form element and form input
			this.processFormInputElement(itemSpec as DialogFormInputElement);
	}

	validContainerElements = [ "div", "p", "span" ];

	isElementValid(
		testElement: string,
		validElements: string[]
	): boolean {
		return !!validElements.find(elem => elem == testElement) != null;
	}

	buildItemContainer(spec: ContentContainerSpec): HTMLElement | null {
		if (this.isElementValid(spec.element, this.validContainerElements) == false)
			return null;
		const containerElem = document.createElement(spec.element);
		if (spec.id)
			containerElem.id = spec.id;
		if (spec.class)
			containerElem.className = spec.class;
		if (spec.style)
			containerElem.setAttribute("style", spec.style);
		this.computedStyle = getComputedStyle(containerElem);
		return containerElem;
	}

	/**
	 * @method processFormInputElement --
	 * @param parentDomNode
	 * @param elemInfo
	 */
	processFormInputElement(
		itemSpec: DialogFormInputElement
	) {
		let containerElem: HTMLElement | null;
		// create the specified element
		if (!itemSpec.objectInfo)
			itemSpec.objectInfo = {} as FormInputElemObject;
		if (itemSpec.elemName) {
			itemSpec.objectInfo.domNode = document.createElement(itemSpec.elemName);
			if (itemSpec.elementContainer) {
				if ((itemSpec.elementContainer as ContentContainerSpec).element) {
					if ((containerElem = this.buildItemContainer(itemSpec.elementContainer as ContentContainerSpec)) == null)
						throw Error("Unable to create an item container from 'elementContainer'");
				} else
					containerElem = itemSpec.elementContainer as HTMLElement;
				// run through the attributes if they exist
				if (this.activeContainer != containerElem) {
					this.activeContainer.appendChild(containerElem!);
					this.activeContainer = containerElem;
				}
			} else {
				this.activeContainer.appendChild(itemSpec.objectInfo.domNode);
				this.activeContainer = itemSpec.objectInfo.domNode;
			}
			// if event handler specified, attach it
			if (itemSpec.eventHandler)
				itemSpec.objectInfo.domNode.addEventListener(itemSpec.eventHandler.event, itemSpec.eventHandler.handler);
			// run through the children
			if (itemSpec.children)
				for (const child of itemSpec.children) {
					this.activeContainer = itemSpec.objectInfo.domNode;
					this.buildDialogItemInDialog(child);
					this.activeContainer = this.activeContainer.parentElement!;
				}
					/*
				throw Error("The ModalDialog specification for defining elements of the dialog form were not followed." +
				"\nA 'DialogItem' was missing properties that identify it as 'DialogText', 'DialogBlock' or 'DialogFormInputElement'");
			*/
				const inputElement: HTMLInputElement = itemSpec.objectInfo.domNode as HTMLInputElement;
				// attach the element
			if (itemSpec.attributes)
				for (const attribute of itemSpec.attributes) {
					if (attribute.name == "name")
						itemSpec.objectInfo.attribName = attribute.value;
					if (attribute.name == "value") {
						if (typeof attribute.value != "string" &&
								inputElement.placeholder && typeof inputElement.value == "string")
							attribute.value = inputElement.placeholder;
						else
							inputElement.value = attribute.value;
						/*		itemSpec.objectInfo.initValue = inputElement.value ?  inputElement.value : null;
			if (DialogItemData?.tag == "input" || DialogItemData?.tag == "textarea" || DialogItemData?.tag == "select")
				this.dialogItems.push(DialogItemData); */
					} else
						itemSpec.objectInfo.domNode!.setAttribute(attribute.name, attribute.value);
				}
		} else if (itemSpec.stdCtrl) {
			const buttonElem = document.createElement("button");
			itemSpec.objectInfo.domNode = buttonElem;
			switch (itemSpec.stdCtrl) {
			case ModalDialog_BUTTONS.OK_BUTTON:
					buttonElem.type = "button";
					buttonElem.appendChild(document.createTextNode("OK"));
					break;
			case ModalDialog_BUTTONS.CANCEL_BUTTON:
				buttonElem.type = "button";
				buttonElem.appendChild(document.createTextNode("Cancel"));
				break;
			case ModalDialog_BUTTONS.RESET_BUTTON:
				buttonElem.type = "button";
				buttonElem.appendChild(document.createTextNode("Reset"));
				break;
			case ModalDialog_BUTTONS.SUBMIT_BUTTON:
				buttonElem.type = "submit";
				buttonElem.appendChild(document.createTextNode("Submit"));
				break;
			}
			buttonElem.addEventListener("click", () => {
				this.stdCtrlAction(itemSpec.stdCtrl);
			});
			this.activeContainer.appendChild(itemSpec.objectInfo.domNode);
		}
	}

	showModalDialog() {
		this.dialogContainer.style.display = "block";
		window.addEventListener("click", (event: Event) => {
			event.stopImmediatePropagation();
		});
	}

	hideModalDialog() {
		this.dialogContainer.style.display = "none";
		window.removeEventListener("click", (event: Event) => {
			event.stopImmediatePropagation();
		});
	}

	stdCtrlAction(
		action: ModalDialog_BUTTONS.CANCEL_BUTTON | ModalDialog_BUTTONS.OK_BUTTON |
			ModalDialog_BUTTONS.RESET_BUTTON | ModalDialog_BUTTONS.SUBMIT_BUTTON
	) {
		switch (action) {
		case ModalDialog_BUTTONS.CANCEL_BUTTON:
			// reset the state (not the HTML form)
			break;
		case ModalDialog_BUTTONS.OK_BUTTON:
			// call the dialog callback
			this.dialogCallback(this.dialogForm);
			break;
		case ModalDialog_BUTTONS.RESET_BUTTON:
			// form reset
			this.dialogForm.reset();
			break;
		case ModalDialog_BUTTONS.SUBMIT_BUTTON:
			this.dialogForm.submit();
			break;
		}
		this.hideModalDialog();
	}

	close(): void {
		this.cleanModalWindow();
	}
	// ensure close control
	getCloseButton(): HTMLImageElement {
		const buttonElem: HTMLButtonElement = document.createElement("button"),
			imgElem: HTMLImageElement = document.createElement("img");

		buttonElem.style.float = "right";
		buttonElem.style.border = "none";
		buttonElem.style.background = "none";
		buttonElem.addEventListener("click", () => {
			this.dialogCallback({length: 0});
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


	createSubmitCancelResetButtonSet(
		block: { containingElementName: "div" | "p" | "span", containingElement: HTMLElement } |
		("div" | "p" | "span" ) |
		undefined
	): {
		containingElementName: "div" | "p" | "span",
		containingElement: HTMLElement
	} {
		let containingElement, containingElementName, buttonElem;
		if (!block) { // undefined, set up DIV
			containingElementName = "div";
			containingElement = document.createElement("div");
		} else if (typeof block == "string" && (block == "div" || block == "p" || block == "span")) {
			containingElementName = block;
			containingElement = document.createElement(block);
		} else {
			containingElementName = block.containingElementName;
			containingElement = block.containingElement;
		}
		// create a Submit Data button
		buttonElem = document.createElement("button");
		buttonElem.type = "button";
		buttonElem.id = "submit-data";
		buttonElem.appendChild(document.createTextNode("Submit Data"));
		buttonElem.addEventListener("click", () => {
			const formData: {name: string; value: string}[] = [ ];

			for (const datum of this.dialogItems) {
				const dlgFormInpObj = (datum as DialogFormInputElement).objectInfo as FormInputElemObject;
				if ((dlgFormInpObj.domNode as HTMLInputElement)!.value)
					formData.push({
						name: dlgFormInpObj.attribName!,
						value: (dlgFormInpObj.domNode as HTMLInputElement)!.value
					});
			}

			if (this.dialogCallback({length: formData.length, formData: formData}) == false)
				return -1;
			this.dialogContainer.style.display = "none";
			this.cleanModalWindow();
		}, false);
		containingElement.appendChild(buttonElem);

		/// create a Cancel button
		buttonElem = document.createElement("button");
		buttonElem.type = "button";
		buttonElem.appendChild(document.createTextNode("Cancel"));
		buttonElem.addEventListener("click", () => {
			this.dialogCallback({});
			this.dialogContainer.style.display = "none";
			this.cleanModalWindow();
		}, false);
		containingElement.appendChild(buttonElem);

		/// create a Reset button
		buttonElem = document.createElement("button");
		buttonElem.type = "button";
		buttonElem.appendChild(document.createTextNode("Reset"));
		buttonElem.addEventListener("click", () => {
			for (const control of this.dialogItems) {
				const dlgFormInpObj = (control as DialogFormInputElement).objectInfo as FormInputElemObject;
				if (dlgFormInpObj.initValue != null)
					(dlgFormInpObj.domNode as HTMLInputElement)!.value = dlgFormInpObj.initValue;
			}
		}, false);
		containingElement.appendChild(buttonElem);
		return {
			containingElementName: containingElementName as "div" | "p" | "span",
			containingElement: containingElement
		};
	}
}

const namedStyles: {
	styleName: string;
	style: ModalDialogStyling[];
}[] = [
	{
		styleName: "default",
		style: [
			{
				selector: "label",
				rule: "font: bold 11pt Arial,sans-serif;color:purple"
			},
			{
				selector: "input",
				rule: "font: normal 11pt Arial,sans-serif"
			},
			{
				selector: "#${this.dialogContainer.id}",
				rule: "width:auto;font:bold 16pt Arial,sans-serif;margin:auto;" +
					"background-color:#f8f8f8;padding:1em;position:fixed;top:50%;left:50%;" +
					"transform:translate(-50%,-50%);color:maroon;border:12px outset darkgreen;" +
					"z-index:1;"
			},

			{
				selector: "#modal-dialog",
				rule: "border:2px solid blue;margin:1em;background-color:#f8f8f8;padding:1em;"
			}
		]
	}
];
