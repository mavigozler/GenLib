"use strict";

export {
	plainWindow,
	rewriteWindow
};
/* NOTE that this function will attempt to determine if the
 arguments fromt 'title' to 'body_style' are either STRING type
 or OBJECT type.  If STRING type, document.write() will be used
 to render the HTML.  If OBJECT type, they will be assumed
 to be DOM Object nodes and will be inserted into document
 using DOM function calls */

 type expandedWinOptions = {
	winTitle?: string,  // to be put on title bar
	headerStyle?: string,  // CSS strings to be put in HEAD element
	headerScript?: string,  // Javascripts in the HEAD element
	otherHeader?: string, // any string as HTML markup that can be placed in HEAD element
	body?: string | HTMLBodyElement, // the text making up the body of the HTML markup
	bodyAttributes?: string | string[],
	bodyStyle?: string, // CSS strings for styling the body
	closeButton?: boolean
} // menubar, personalbar, etc

function plainWindow(
	winFeatures: string,
	options?: expandedWinOptions
) { // true or false boolean to include "Close" button in window
	return getUrlInNewWindow("", "", winFeatures, options);
}

function getUrlInNewWindow(
	url: string, // the URL for content for new window
	target: string,  // see Window.open
	winFeatures: string,
	options?: expandedWinOptions
) { // true or false boolean to include "Close" button in window
	const	winOptions: expandedWinOptions = {};
	let w, i;

	// eslint-disable-next-line prefer-rest-params
	if (arguments.length == 1 && typeof arguments[0] != "boolean")
		winOptions.body = winFeatures;

	if (typeof winFeatures == "undefined" || winFeatures == null || winFeatures == "" || arguments.length == 0) {
		winFeatures = "menubar=no,personalbar=no,toolbar=no," +
			"resizable=yes,scrollbars=yes,width=" + screen.availWidth +
			",height=" + screen.availHeight * 0.75 +
			",left=0,top=0";
	} else if (typeof(winFeatures) == "string") {
		if (winFeatures.search(/menubar/) < 0)
			winFeatures += ",menubar=no";
		if (winFeatures.search(/personalbar/) < 0)
			winFeatures += ",personalbar=no";
		if (winFeatures.search(/toolbar/) < 0)
			winFeatures += ",toolbar=no";
		if (winFeatures.search(/resizable/) < 0)
			winFeatures += ",resizable=yes";
		if (winFeatures.search(/scrollbars/) < 0)
			winFeatures += ",scrollbars=yes";
		if (winFeatures.search(/width/) < 0)
			winFeatures += ",width=600";
		if (winFeatures.search(/height/) < 0)
			winFeatures += ",height=" + screen.availHeight * 0.75;
		if (winFeatures.search(/top/) < 0)
			winFeatures += ",top=100";
		if (winFeatures.search(/left/) < 0)
			winFeatures += ",left=100";
	} else if (winFeatures == true) {
		winFeatures = "menubar=yes,personalbar=yes,toolbar=yes," +
			"resizable=yes,scrollbars=yes,width=" + screen.availWidth +
			",height=" + screen.availHeight * 0.75 +
			",left=0,top=0";
	}
	if ((w = window.open(url, "", winFeatures)) == null)
		return w;
	w.document.open();
	if (arguments.length <= 1) {
		if (arguments.length == 0) {
			w.document.open("text/plain");
			return w;
		}
		winOptions.winTitle = options?.winTitle || "untitled window";
		winOptions.headerStyle = winOptions.headerScript = winOptions.otherHeader = winOptions.bodyStyle = "";
		winOptions.closeButton = true;
	}
	if (typeof options?.body == "object") {
		const htmlBody: HTMLBodyElement = options.body;
		let node: Node | null = null;

		try {
			if (w.document.importNode)
				node = w.document.importNode(htmlBody, true);
			else if (typeof htmlBody.cloneNode == "function")
				node = htmlBody.cloneNode(true);

			if (node == null)
				options.body = htmlBody.outerHTML;
			else // node != null
				(node as HTMLBodyElement).style.display = "block";
		} catch {
			options.body = (options.body as HTMLBodyElement).outerHTML;
		}
	}

	if (options?.bodyStyle == null)
		winOptions.bodyStyle = "";
	w.document.write(
		"<!DOCTYPE html>" +
		"\n<html>\n<head>");
	if (typeof options?.winTitle == "string" && options.winTitle.length > 0) {
		w.document.write("\n<title>" + options.winTitle + "</title>");
		//usedArg |= TITLE;
	}
	if (typeof options?.otherHeader == "string" && options.otherHeader.length > 0) {
		w.document.write("\n" + options.otherHeader);
		//usedArg |= OTHER_HEADER;
	}
	if (typeof options?.headerStyle == "string" && options.headerStyle.length > 0) {
		w.document.write("\n<style type=\"text/css\">" + options.headerStyle +
				"\n</style>");
		// usedArg |= HEADER_STYLE;
	}
	if (typeof options?.headerScript == "string" && options.headerScript.length > 0) {
		w.document.write("\n<script type=\"text/javascript\">" +
		options.headerScript + "\n</script>\n");
		//usedArg |= HEADER_SCRIPT;
	}
	if (options && options.bodyStyle && options.bodyStyle.length)
		w.document.write("\n</head>\n\n<body " +
			(options?.bodyStyle.length > 0 ? " style=\"" + options.bodyStyle + "\"" : ""));
	if (typeof options?.bodyAttributes == "object")
		for (i = 0; i < options.bodyAttributes.length; i++)
			w.document.write(" " + options.bodyAttributes[i]);
	w.document.write(">\n");
	if (typeof options?.body == "string") {
		w.document.write(options.body);
		//usedArg |= BODY;
	}
	if (options?.closeButton == true)
		w.document.write(
			"\n<p id=\"close-button-block\">\n<button " +
			"onclick=\"window.close();\">Close Window</button>");
	w.document.write("\n</body>\n</html>");
	w.document.close();
	/*
	if (node != null) {
		bodyElem = w.document.getElementsByTagName("body")[0];
		try {
			bodyElem.insertBefore(node, bodyElem.firstChild);
		} catch (exception) {
			bodyElem.appendChild(node);
		}
	} */

	/*
	var head = w.document.getElementsByTagName("head")[0];
	if ((usedArg & TITLE) == 0 && typeof(title) == "object")
		head.insertBefore(title, head.firstChild);
	if ((usedArg & OTHER_HEADER) == 0 && typeof(other_header) == "object")
		head.appendChild(other_header);
	if ((usedArg & HEADER_STYLE) == 0 && typeof(header_style) == "object")
		head.appendChild(header_style);
	if ((usedArg & HEADER_SCRIPT) == 0 && typeof(header_script) == "object")
		head.appendChild(header_script);
	if ((usedArg & BODY) == 0 && typeof(body) == "object")
	{
		var docbody = w.document.getElementsByTagName("body")[0];
		docbody.insertBefore(body, docbody.firstChild);
	}
	*/
	w.onclose = function () {
		w = null;
	};
	return w;
}

function rewriteWindow(
	win: Window,
	options?: expandedWinOptions
) {
	win.document.open();
	win.document.write(
		"<!DOCTYPE html>" +
		"\n<html>\n<head>");
	if (typeof options?.winTitle == "string" && options.winTitle.length > 0)
		win.document.write("\n<title>" + options!.winTitle + "</title>");
	if (typeof options?.otherHeader == "string" && options.otherHeader.length > 0)
		win.document.write("\n" + options.otherHeader);
	if (typeof options?.headerStyle == "string" && options.headerStyle.length > 0)
		win.document.write("\n<style type=\"text/css\">" + options.headerStyle +
				"\n</style>");
	if (typeof options?.headerScript == "string" && options.headerScript.length > 0)
		win.document.write("\n<script type=\"text/javascript\">" +
				options.headerScript + "\n</script>\n");
	if (options && options.bodyStyle && options.bodyStyle.length)
		win.document.write("\n</head>\n\n<body " +
			(options?.bodyStyle?.length > 0 ? " style=\"" + options?.bodyStyle + "\"" : ""));
	if (options?.bodyAttributes && typeof options?.bodyAttributes == "object")
		for (const attrib of options.bodyAttributes)
			win.document.write(" " + attrib);
	win.document.write(">\n");
	if (typeof options?.body == "string")
		win.document.write(options?.body);
	if (options?.closeButton == true)
		win.document.write(
			"\n<p id=\"close-button-block\">\n<button " +
			"onclick=\"window.close();\">Close Window</button>");
	win.document.write("\n</body>\n</html>");
	win.document.close();
}
