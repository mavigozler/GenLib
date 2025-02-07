/*****************************************************************************
This script was written by S. M. Halloran, who reserves all rights related to
the authorship/origination and dissemination/publication of this code.

Those wishing to use this code may do so freely as long as they retain this comment
in its entirety.  Modifications to the code can be annotated as an appendix to this
comment.

Use of this code is AT THE USER'S OWN RISK.  No warranty is made explicitly or
implicitly as to this code's unlikely potential at causing damage or malfunction
to data or computing device, especially when used as intended.

For instructions on how to use the interface, see the bottom of this script
source.
*****************************************************************************/
import {
	CssValueDim,
	MathOperation,
	iCss
} from "./iCss";

export {
	htmlDocTypeDecl,
	xhtmlMetaContentTypeAsXHTML,
	xhtmlDocTypeDecl,
	htmlMetaContentTypeAsHTML,
	setThumbedImages,
	thumbedImage,
	getImage,
	setDocWideBigImages
};

const htmlDocTypeDecl = "<!DOCTYPE html\n" +
	"<html>\n";
const xhtmlDocTypeDecl = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
	"<?xml-stylesheet type=\"text/xsl\" href=\"copy.xsl\"?>\n" +
	"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"\n" +
   "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
	"<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en\">\n";
const xhtmlMetaContentTypeAsXHTML = "<meta http-equiv=\"Content-Type\" " +
	"content=\"application/xhtml+xml; charset=utf-8\" />";
const htmlMetaContentTypeAsHTML = "<meta http-equiv=\"Content-Type\" " +
	"content=\"text/html; charset=utf-8\">";

/* resizeImage() forces a change in the size of the image to the
 * factor indicated
 * @param imgObj | instance of DOM img Object
 * @param factor | the factor by which to resize image in aspect
 * @return void
 */

function resizeImage(
	imgObj: HTMLImageElement,
	factor: number
): void {
	const aspect = imgObj.height / imgObj.width;
	if (typeof(imgObj) == "undefined" || typeof(factor) == "undefined")
		return;
	factor = Math.abs(factor);
	if (aspect > 1) {
		imgObj.width *= factor;
		imgObj.height = imgObj.width * aspect;
	} else {
		imgObj.height *= factor;
		imgObj.width = imgObj.height / aspect;
	}
}

/*
setThumbedImages() calls thumbedImage for all images with the 'class' attribute
set to 'thumbImage' in the document body. this function had to be created
because the 'onload' attribute is not permitted for the IMG element in the HTML
specification, but is permitted for the document body or a frameset

Normally, the image is thumbed by the class="..." value if it exceeds a
certain size.  However, if the argument 'force' is set 'true', then
the image will be resized whether or not it exceeds screen size
*/

function setThumbedImages(
	docBody: HTMLBodyElement,
	force?: boolean,
	includePrompt?: boolean
): void {

	const calculationError = (message?: string) => {
		const defaultMessage = "There was a calculation error, probably in CSS math";
		if (message) {
			console.log(message);
			return message;
		} else {
			console.log(defaultMessage);
			return defaultMessage;
		}
	}

	const imgSetRegex: RegExp = /[0-9]*\.?[0-9]+/;
	let bodyImages: HTMLCollectionOf<HTMLImageElement> | null,
		imgElem: HTMLImageElement,
		classNames: string[],
		styleElem: HTMLStyleElement,
		htmlElems: HTMLCollectionOf<HTMLElement>,
		factor: RegExpMatchArray | null,
		promptSpan: HTMLSpanElement,
		// imgStyle: CSSStyleDeclaration,
		imgParent: HTMLParagraphElement | HTMLDivElement | HTMLSpanElement,
		imgContain: HTMLDivElement,
		computedFactor: CssValueDim | null;
		//	imageDecColor: number,
		// parentColor: string;
	//	oldParentColor: string | null = null;


	if (typeof includePrompt == "undefined")
		includePrompt = false;
	if ((htmlElems = document.getElementsByTagName("style")) == null ||
				(htmlElems instanceof HTMLCollection == true && htmlElems.length == 0)) {
		styleElem = document.createElement("style");
		htmlElems = document.getElementsByTagName("head");
		(htmlElems[0] as HTMLElement).appendChild(styleElem);
	} else
		styleElem = htmlElems[0] as HTMLStyleElement;
	styleElem.appendChild(document.createTextNode(
		".prompt-span {display:inline-block;color: blue;font: bold 9pt Tahoma,sans-serif;" +
			"margin:0.25em 0 0.5em 0.5em;float:left;}"
	));

	if ((bodyImages = docBody.getElementsByTagName("img")) == null)
		throw "there were no images found";
	for (let i = 0; i < bodyImages.length; i++) {
		imgElem = bodyImages[i];
		// imgStyle = getComputedStyle(imgElem);
		imgParent = imgElem.parentNode as HTMLElement;
		if (includePrompt == true) {
		//	parentColor = imgStyle.backgroundColor;

			imgContain = document.createElement("div");
			imgParent.insertBefore(imgContain, imgElem);
			imgContain.style.margin = "0";
			imgElem = imgParent.removeChild(imgElem);
			imgElem = imgContain.appendChild(imgElem);
			promptSpan = document.createElement("span");
			promptSpan.className = "prompt-span";
			/*
			if (parentColor != oldParentColor) {
				imageDecColor = ColorComponents.generateRandomContrastColor(parentColor, "cssColorString");
				oldParentColor = parentColor;
			} else {
				imageDecColor = parentColor
			} */
			//	imgContain.style.borderColor = imageDecColor.toString();
			imgContain.style.borderWidth = "1px";
			imgContain.style.borderStyle = "solid";
			imgContain.style.textAlign = "center";
			promptSpan.appendChild(document.createTextNode("Click on the image to enlarge it in a new window"));
			//	promptSpan.style.color = imageDecColor.toString();
			imgContain.insertBefore(promptSpan, imgElem);
			imgContain.insertBefore(document.createElement("br"), imgElem);
		}
		classNames = imgElem.className.split(/\s+/g);
		imgElem.style.cursor = "pointer";
		for (let j = 0; j < classNames.length; j++)
			if (classNames[j].toLowerCase().search("thumbimage") >= 0) {
				factor = classNames[j].match(imgSetRegex);
				if (factor) {
					if (force == true)
						resizeImage(imgElem, Number(factor[0]));
					else
						thumbIfBig(imgElem, Number(factor[0]));
					break;
				} else {
					const imgParentStyle: CSSStyleDeclaration = getComputedStyle(imgParent),
						iCSS: iCss = new iCss();
					let intermediate: string;

					// no resizing value set; fit to parent padded width
					intermediate = iCSS.doCssMath(MathOperation.CSS_MULTIPLY, -2, imgParentStyle.padding) ?? calculationError();
					intermediate = iCSS.doCssMath(MathOperation.CSS_SUM, imgParentStyle.width, intermediate) ?? calculationError();
					computedFactor = iCSS.extractValueDim(iCSS.doCssMath(
						MathOperation.CSS_DIVIDE, intermediate, imgElem.width
					) as string);
					if (computedFactor != null && computedFactor.val < 1)
						imgElem.width = computedFactor.val * imgElem.width;
				}
			}
	}
}

// img width = (img parent width - 2 * parent padding) / current img width (pixels) /

/* thumbedImage() for IMG onload event to size the thumb form of an image
   according to the screen resolution, but not the browser window
   dimensions.  One should try to use a thumb already sized to what
   it should be like */

function thumbedImage(imgObj: HTMLImageElement, screenProportion: number): void {
	thumbIfBig(imgObj, screenProportion);
}

function thumbIfBig(imgObj: HTMLImageElement, screenProportion: number): void {
	if (!imgObj)
		throw "An image element must be passed as an argument to 'thumbIfBig()'";
	if (typeof(screenProportion) == "undefined")
		screenProportion = 1;
	if (imgObj.height > screenProportion * screen.availHeight) 	{
		imgObj.width *= screenProportion * screen.availHeight / imgObj.height;
		imgObj.height = screenProportion * screen.availHeight;
	}
	if (imgObj.width > screenProportion * screen.availWidth) {
		imgObj.height *= screenProportion * screen.availWidth / imgObj.width;
		imgObj.width = screenProportion * screen.availWidth;
	}
}

/* winHeight, and winWidth must be values between 0 and 1, and represent
   the proportion the window is to the screen (0 = min, 1 = max, and
   somewhere in between) */

function resizeImage2Screen(
	imgObj: HTMLImageElement,
	scrn: Screen,
	resizeFactor: number
): boolean {
	const wratio: number = imgObj.width / scrn.availWidth,
		hratio: number = imgObj.height / scrn.availHeight,
		aspect: number = imgObj.width / imgObj.height;
	if (typeof imgObj == "undefined" || imgObj == null)
		throw "resizeImage2Screen() arg #1: img object instance undefined or null";
	if (typeof scrn == "undefined" || scrn == null)
		throw "resizeImage2Screen() arg #2: screen instance undefined or null";
	if (typeof imgObj == "undefined" || imgObj == null)
		throw "resizeImage2Screen() arg #3: resizeFactor float undefined or null" +
			"a good default to use = 0.96";

	if (wratio < 1.0 && hratio < 1.0)
		return false;
	if (wratio > hratio) {
		imgObj.width *= (resizeFactor / wratio);
		imgObj.height = imgObj.width / aspect;
	} else {
		imgObj.height *= (resizeFactor / hratio);
		imgObj.width = imgObj.height * aspect;
	}
	return true;
}

function resizeWin2Image(
	imgObj: HTMLImageElement,
	win: Window,
	resizeFactor: number
): void {
	if (typeof imgObj == "undefined" || imgObj == null)
		throw "resizeWin2Image() arg #1: img object instance undefined or null";
	else if (typeof win == "undefined" || win == null)
		throw "resizeWin2Image() arg #2: window instance undefined or null";
	else if (!resizeFactor || resizeFactor == null)
		throw "resizeWin2Image() arg #3: resizeFactor float undefined or null" +
			"\na good default to use = 1.1";
	win.resizeTo(imgObj.width * resizeFactor, imgObj.height * resizeFactor);
}

function getImage(url: string): Window | null {
	return window.open(url);
}

/**
 *  Use docWideResize() to resize all images in the document
 *  to the parent container width of 100% and automatically make them clickable.
 *
 *  EXCEPTIONS:  to stop an image from being scripted in this way,
 *    put as a class attribute /class="no-js"/
 */

function setDocWideBigImages(
	document: Document,
	styling: string
): number {
	const imageRefs: HTMLCollectionOf<HTMLImageElement> = document.getElementsByTagName("img"),
		docImages: (HTMLImageElement | null)[] = [];
	let clonedImage;

	if (typeof imageRefs.item == "function")
		for (let i = 0; i < imageRefs.length; i++)
			if (imageRefs[i].className.search(/no-js/) < 0)
				docImages.push(imageRefs.item(i));
	for (let i = 0; i < docImages.length; i++) {
		clonedImage = setImagePrompt(docImages[i] as HTMLImageElement, styling);
		clonedImage.addEventListener("click", docWideBigImage, false);
	}
	return docImages.length; // number of images processed
}

/* this is a handler */
function docWideBigImage(evt: Event) {
	if (evt.target)
		return bigimage(evt.target as HTMLImageElement, true);
	return bigimage(evt.currentTarget as HTMLImageElement, true);
}

function setImagePrompt(
	imgObj: HTMLImageElement,
	styling: string
): HTMLImageElement {
	const parentNode: ParentNode = imgObj.parentNode as ParentNode,
		divElem: HTMLDivElement = document.createElement("div"); // <div> </div>;
	let clonedImageObj: HTMLImageElement;

	parentNode.appendChild(divElem);  // <parent><img><div></div></parent>
	divElem.appendChild(clonedImageObj = (imgObj.cloneNode(true) as HTMLImageElement));
	// <parent><img><div><imgClone></div></parent>
	parentNode.removeChild(imgObj);
	// <parent><div><imgClone></div></parent>
	imgObj = clonedImageObj;
	// <parent><div><img></div></parent>
	if (typeof styling === "string")
		divElem.setAttribute("style", styling);
	imgObj.style.marginTop = "0";
	imgObj.style.cursor = "pointer";
	divElem.insertBefore(document.createTextNode(
		"Click on image to obtain at original resolution in new window"), imgObj);
	// <parent><div>Click text<img></div></parent>
	divElem.insertBefore(document.createElement("br"), imgObj);
	// <parent><div>Click text<br><img></div></parent>
	return imgObj;
}


/* imgObj is the DOM image object
    origRez is a boolean: if true, open a window immediately to the image's
       original resolution;  if not set or false, then it jumps by intermediates */
function bigimage(
	imgObj: HTMLImageElement,
	origRez: boolean
) {
	let nameParts: RegExpMatchArray | null,
		filename: string;

	if (origRez == null || typeof(origRez) == "undefined")
		origRez = false;
	if ((nameParts = imgObj.src.match(/(.*)\/thumbs(.*)-thumb(.*)/)) == null)
		filename = imgObj.src;
	else
		filename = nameParts[1] + nameParts[2] + nameParts[3];
	if (origRez == true)
		return (origImage(filename, imgObj.alt));
	return (makeBigImage(filename, imgObj.alt));
}

// this is a support function for bigimage()
let imgWin: Window | null;  // recycle windows when possible
function makeBigImage(
	imgURL: string,
	imageTitle: string
) {
	const winResize: number = 1.25,
		imgResize: number = 0.80;
	let paraElem: HTMLParagraphElement,
		doc: Document,
		spanElem: HTMLSpanElement;

	if (typeof imgURL != "string" || imgURL.length == 0)
		throw "The argument for parameter 'imgURL' must be a string with a valid URL";
	if (typeof imageTitle != "string" || imageTitle.length == 0)
		imageTitle = "*** this image had no title ***";
	imgWin = window.open("" /*window.location.href*/, "",
		"resizable=no,scrollbars=no;,height=" +
			screen.availHeight * 0.98 + ",width=" + screen.availWidth * 0.98);
	if (imgWin == null)
		throw "A child window could not be opened. Is there a restriction on pop-ups?";
	(doc = imgWin.document).close();
	const headElem = doc.getElementsByTagName("head")[0];
	const titleElem = doc.createElement("title");
	headElem.appendChild(titleElem);
	titleElem.appendChild(doc.createTextNode(imageTitle));
	const metaElem = doc.createElement("meta");
	metaElem.setAttribute("html-equiv", "Content-Type");
	metaElem.setAttribute("content", "text/html; charset=utf-8");
	headElem.appendChild(metaElem);
	if (typeof iCss == "undefined")
		throw "iCss object is undefined:  is css.js included?";
	/*   returnValue = iCSS.createStyleSheet(doc,
   		"html{margin:0;} body{background-color:black;margin:0;} img {border:3px solid blue;}" +
   		"\n .rez {color:red;font:bold 100% Verdana,Tahoma,Arial,sans-serif;}"); */
	const bodyElem = doc.getElementsByTagName("body")[0];

	paraElem = doc.createElement("p");
	bodyElem.appendChild(paraElem);
	paraElem.style.color = "yellow";
	paraElem.appendChild(doc.createTextNode("Click image to show at original resolution: "));

	spanElem = doc.createElement("span");
	spanElem.id = "origrez";
	spanElem.className = "rez";
	paraElem.appendChild(spanElem);
	spanElem.appendChild(doc.createTextNode("\u00a0\u00a0current image resolution: "));

	spanElem = doc.createElement("span");
	spanElem.id = "currez";
	spanElem.className = "rez";
	paraElem.appendChild(spanElem);
	spanElem.appendChild(doc.createTextNode(
		"\u00a0\u00a0screen resolution: "));

	spanElem = doc.createElement("span");
	spanElem.className = "rez";
	spanElem.appendChild(document.createTextNode(screen.width + "\u00d7" + screen.height));
	paraElem.appendChild(spanElem);

	paraElem = doc.createElement("p");
	bodyElem.appendChild(paraElem);
	paraElem.style.marginTop = "0";
	paraElem.style.textAlign = "center";
	paraElem.style.color = "white";
	paraElem.style.font = "bold 1em 'Courier New',Courier,monospace";
	paraElem.appendChild(doc.createTextNode(imageTitle));

	paraElem.appendChild(doc.createElement("br"));

	const theImage = doc.createElement("img");
	theImage.src = imgURL;
	theImage.id = "the-Image";
	theImage.alt = "Big Goddam Image\nClick the right mouse button and select " +
		"'Save Picture As...' to save this image to your hard disk";
	theImage.addEventListener("click",
		function () {
			return origImage(imgURL, imageTitle);
		}, false);

	paraElem.appendChild(theImage);

	doc.getElementById("origrez")!.appendChild(doc.createTextNode(
		theImage.width + " \u00d7 " + theImage.height
	));
	resizeImage2Screen(theImage, screen, imgResize);
	resizeWin2Image(theImage, imgWin, winResize);
	doc.getElementById("currez")!.appendChild(doc.createTextNode(
		theImage.width + " \u00d7 " + theImage.height
	));
}

function origImage(
	imgURL: string,
	imageTitle: string
): void {
	let origwin: Window | null;

	if ((origwin = window.open(imgURL, "", "resizable=yes,scrollbars=yes")) == null)
		throw "A child window could not be opened which is necessary. Incorrect URL?";
	const doc: Document = origwin.document;
	doc.close();
	const headElem: HTMLHeadElement = doc.getElementsByTagName("head")[0];
	const titleElem: HTMLTitleElement = doc.createElement("title");
	headElem.appendChild(titleElem);
	titleElem.appendChild(doc.createTextNode("Original Size: " + imageTitle));
	const metaElem: HTMLMetaElement = document.createElement("meta");
	metaElem.setAttribute("html-equiv", "Content-Type");
	metaElem.setAttribute("content", "text/html; charset=utf-8");
	headElem.appendChild(metaElem);
	if (typeof iCss == "undefined")
		throw "iCss class is undefined:  is 'iCss.js' included?";
	const iCSS: iCss = new iCss();
	iCSS.createStyleSheet(doc,
		"\nbody{background-color:black;}\nimg{border:3px solid blue;}");
	const bodyElem: HTMLBodyElement = doc.getElementsByTagName("body")[0];
	const divElem: HTMLDivElement = doc.createElement("div");
	divElem.style.marginTop = "0";
	divElem.style.textAlign = "center";
	divElem.style.color = "white";
	divElem.style.font = "bold 1em 'Courier New',Courier,monospace";
	divElem.appendChild(doc.createTextNode(imageTitle));
	divElem.appendChild(doc.createElement("br"));
	const imgElem: HTMLImageElement = doc.createElement("img");
	imgElem.src = imgURL;
	imgElem.alt = "Big Goddam Image\n\nClick the right mouse button and select " +
		"'Save Picture As...' to save this image to your hard disk\n" +
		"\nURL=" + imgURL;
	divElem.appendChild(imgElem);
	bodyElem.appendChild(divElem);
}

/* imgObj is the image object.  If null or undefined, an error is returned
   topFraction is a value 0->1 that is the starting point from the top
       of the image to begin the crop and represents a fraction of
       the height of the image.  If out of range, a default 0 is used.
   leftFraction is a value 0->1 that is the starting point from the left
       of the image to begin the crop and represents a fraction of
       the width of the image.  If out of range, a default of 0 is used.
   height represents the fraction of the height to show starting from
       the topFraction.  Its value should zero to a maximum value
       that is (1 - topFraction).  If out of range,
       the value (1 - topFraction) is the default.
   height represents the fraction of the width to show starting from
       the leftFraction.  Its value should zero to a maximum value
       that is (1 - leftFraction).  If out of range,
       the value (1 - leftFraction) is the default.
*/

/* no such function can work
function croppedImage(imgObj, topFraction, leftFraction, height, width) {
	if (!imgObj || typeof(imgObj)  == "undefined" || imgObj == null)
		return;
	if (topFraction < 0.0 || topFraction > 1.0)
		topFraction = 0.0;
	if (leftFraction < 0.0 || leftFraction > 1.0)
		leftFraction = 0.0;
	if (height > 1.0 - topFraction)
		height = 1.0 - topFraction;
	if (width > 1.0 - leftFraction)
		width = 1.0 - leftFraction;
	imgObj.style.clip = "rect(" + imgObj.height * topFraction + "px, " +
                  imgObj.width * (width - leftFraction) + "px, " +
                  imgObj.height * (height - topFraction) + "px, " +
                  imgObj.width * leftFraction + "px);";
}
*/

/*
This script is intended for the purpose of making small or "thumbed" images
of all or selected images (placed as IMG elements) within an HTML document,
with the thumbed images being clickable so that they produce an initial
magnification of the image is an OPENED (separate) unscrollable window,
with the image fitting within the extent of the display at its pixel resolution,
and with that image being clickable so as to open another (separate)
scrollable window which displays the image

This script should be used ONLY for images whose original size (resolution)
is too big for the flow of HTML document text or which exceeds the size of
browser window, requiring the image to be scrolled to view it.  For images
that neatly fit within the flow of HTML document text, these images can and
should be excluded from alterations by the script by not altering the image
elements to include attribute or attribute values required by the script.

REDUCING THE SIZE OF (THUMBING) SELECTED/ALL DOCUMENT IMAGES

Perform the following steps.

1. Add an 'onload' event to the BODY element to call a function that reduces
the sizes of all images or selected images.  The body element should look
like so, where '...' are the other attributes that might be used:

   <body onload="setThumbedImages(document.body);" ...>

Do not use:

   <body onload="setThumbedImages(this);" ...>

Do use the second boolean parameter of setThumbedImages() set to true if
the images are supposed to be forced down to size:

   <body onload="setThumbedImages(document.body, true);" ...>


It might be expected to pass on the object representing the body element as
the 'this' keyword, but in Firefox, an error was produced that the object
did not have a parentNode, and the script could not complete.

2. To each image element (IMG tag), add a 'class' attribute with the
attribute value having the following format:

    <img ... class="thumbImageNNN">
or
    <img ... class="thumbImage-NNN">

where NNN is actually a number between 0 and 1.  Note that the string
"thumbImage" is a required prefix (class attribute values are not
case-sensitive, but use it as this is readable).  The hyphen character ("-") is
optional, but useful in making the class attribute value readable.  The value
NNN should be the fraction of the original size of the image.  Thus if
NNN="0.35", making the image 35% of its original size, the class attribute value
should be

    <img ... class="thumbImage0.35">
or
    <img ... class="thumbImage-0.35">

The value NNN only needs to be a valid floating point number between 0 and 1.
It does not have to have a certain string length, such as trailing zeros.
For 50% of the original size, "thumbImage-0.5" is valid as is "thumbImage-0.50".

=============================================================================
ONE SIZE FITS ALL

	setDocWideBigImages(document)
		passing the 'document' object of the document whose images are to be
		modified, this
		* adds the 'docWideBigImage' handler to the onclick  listener of the images
		* calls setImagePrompt with a default of the "click" text colored blue
			and at 70% font size
		always returns true

function docWideResize(document) {
	var i,
		docImages = document.getElementsByTagName("img"); // document.images??
	for (i = 0; i < docImages.length; i++) {
		docImages[i].style.width = "100%";
		docImages[i].onclick = docWideBigImage;
//		docImages[i].addEventListener("click", docWideBigImage, false);
		setImagePrompt(docImages[i], "color:blue;font-size:70%;margin-top:2em;");
	}
}

function docWideBigImage(evt) {
	if (evt.srcElement)
		return bigimage(evt.srcElement);
	return bigimage(this);
}

function setImagePrompt(imgObj, styling) {
	var divElem, clonedImageObj;
	divElem = document.createElement("div"); // <div> </div>
	imgObj.parentNode.appendChild(divElem);  // <parent><img><div></div></parent>
	divElem.appendChild(clonedImageObj = imgObj.cloneNode(true));
    // <parent><img><div><imgClone></div></parent>
	imgObj.parentNode.removeChild(imgObj);
    // <parent><div><imgClone></div></parent>
	imgObj = clonedImageObj;
    // <parent><div><img></div></parent>
	if (typeof styling === "string")
		divElem.setAttribute("style", styling);
	imgObj.style.marginTop = 0;
	imgObj.style.cursor = "pointer";
	divElem.insertBefore(document.createTextNode(
				"Click on image to obtain at original resolution in new window"), imgObj);
    // <parent><div>Click text<img></div></parent>
	divElem.insertBefore(document.createElement("br"), imgObj);
    // <parent><div>Click text<br><img></div></parent>
	return imgObj;
}



Perform the following ONLY IF **ALL** images in the document are to be reduced
by one single constant factor:

  a) Add the following text verbatim to be contained (placed) within the HEAD
element of of the HTML document.

  <script type="text/javascript">
  function initializePage() {
    reducedImageSize = 0.5;  // CHANGE THIS VALUE TO THE FACTOR DESIRED
    var docImages = document.images;
    for (var i = 0; i < docImages.length; i++)
	    thumbedImage(docImages[i], reducedImageSize);
  }
  </script>
  <script type="text/javascript" src="include/bigimage.js"></script>

This HTML code is valid with Strict document type HTML.  Note the location
of 'bigimage.js' is determined by the user.

  b) Go to where the text was added within the HEAD element.  With the first
   SCRIPT element within the function initializePage(), change the value
   of variable 'reducedImageSize' to a value between 0 and 1 which represents
   the size of the images you want.  Thus for a value of '0.1', all thumbed
   images will be 10% of the original size.

  c) Modify the body element (BODY tag) so that it includes the following
'onload' attribute:

    <body ... onload="initializePage();" ...>

Note that "..." refers to other possible attributes of the body element.

  d) do not perform Steps 1 and 2 above

===================================================================================

SETTING SELECTED DOCUMENT IMAGES TO BE MAGNIFIED

To enable reduced images to be magnified (in two-stages) in new windows,
perform the following steps:

1. Add the following 'onclick' attribute to the image element (IMG tag) of
all reduced images (the text added should be verbatim):

   <img ... onclick="bigimage(this);" ...>

where the '...' represent other attributes of the element.

A typical 'img' tag in validated Strict HTML will look like this:

   <img src="path/to/myimage.jpg" onclick="bigimage(this);"
     alt="The desired title of my image" class="thumbImage-0.4">

Note that the 'alt' attribute is required for 'img' elements and its value
will be used as a title for the image in the window containing the magnified
images.  So fill in the 'alt' attribute properly or the text

    *** this image had no title ***

will appear.

2. Optionally--but strongly urged---it is useful to enclose the tag
of reduced images within a DIV container that takes the image out of
flow (use 'float' in a style attribute) and presents the text
"click on image to obtain at original resolution in new window".

For example:

    <div class="leftimglegend">
    Click on image to obtain at original resolution in new window
    <br><img src="path/to/myimage.jpg" onclick="bigimage(this);"
       class="thumbImage-0.33"
       alt="Nine-tenths of cells allowed to form colonies">
    </div>

Rather than using inline style attributes for every container, the
class attribute is defined and the document or external stylesheet
defines the style properties for the classed element.

   .leftimglegend { float:left;margin-right:3em;padding:3px;
           font:normal 60% Arial,Helvetica,sans-serif;}
   .rightimglegend { float:right;font:normal 60% Arial,Helvetica,sans-serif;
         margin-left:3em;padding:3px;}

So the text "Click on..." is reduced to a small size (60% of normal body text)
and both this text and the image are taken out of the flow (to the left) by
the float property, with the container having margins and padding appropriate
to give room.  Other properties could be added to change color or add
borders.  Additional text could be added to caption the image.

=====

OTHER USEFUL FUNCTIONS OF THE SCRIPT INTERFACE

*  resizeImage2Screen() will basically enlarge the image with aspect preserved
to screen size.  It is utilized by bigimage().

*  resizeWin2Image() does just that:  it resizes a window to the image dimensions.

*  makeBigImage() requires the image URL and an image "title" as parameters and
provides the engine for two-step image enlargement to the original, both in
separate pop-up windows.

*/
