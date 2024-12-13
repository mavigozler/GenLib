
export {
	ModalDialogResponse,
	DialogItem,
   DialogText,
   DialogFormInputElement,
   DialogBlock,
   DialogCallback,
   ContentContainer,
   ContentContainerSpec,
   ModalDialogStyling,
   FormInputElemObject
};

type DialogCallback = (data: ModalDialogResponse) => boolean;

// TODO describe
type ModalDialogResponse = {
   length?: number;
   formData?: {[key: string]: string | number;}[];
};

type ContentContainerSpec = {
   element: "div" | "p" | "span";  // ensure one of these elements
   id?: string;    // get its id attribute
   class?: string;  // is class attribute described?
   style?: string; // CSS inline
};

type ContentContainer =  ContentContainerSpec | HTMLElement;

type DialogText = {
   text: string;   						 // dialog will have text
   textContainer?: ContentContainer;  // its parent container
};

type FormInputElemObject = {
   domNode?: HTMLElement;
   attribName?: string;
   initValue?: string | null;
	tag?: "input" | "textarea" | "select";
};

// this is an element contained in the form for the dialog
type DialogFormInputElement = {
	elemName: string;    // valid HTML element name
	attributes?: {name: string; value: string;}[]; // elem attributes
	eventHandler?: {   // does it have an event handler
		event: string;    // valid event name
		handler: () => void;
      bubble: boolean  // the handler  // does it bubble
   };
   objectInfo?: FormInputElemObject
   // connection to its contained elements
   // if not defined in dialog spec, it will be created in module
   children?: (DialogText | DialogFormInputElement)[];
   elementContainer?: ContentContainer; // immediate parent
   stdCtrl?: typeof ModalDialog_BUTTONS;
};

// a block in the dialog will be a functional group of elements
type DialogBlock =  {
	block: DialogItem[];  // it is an array of controls
   blockContainer?: ContentContainer;  // block is container, so will be defined
};

// An item is a reference to THREE types: text, formElement, or
//  controls OR
type DialogItem = (DialogText | DialogBlock | DialogFormInputElement);// | DialogInputElement;

type ModalDialogStyling = {
   selector: string;
   rule: string;
};