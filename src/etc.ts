"use strict";

export { CreateUUID, hasFormProperty };

function CreateUUID():string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);

		return v.toString(16);
	});
}

function hasFormProperty(element: unknown): element is
		HTMLInputElement | HTMLButtonElement | HTMLSelectElement |
		HTMLTextAreaElement | HTMLOutputElement | HTMLFieldSetElement | HTMLObjectElement {
	if (typeof element === 'object' && element !== null)
		return 'form' in element;
	return false;
}