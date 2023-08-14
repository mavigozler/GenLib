"use strict";

/********************************************************************
 * Browser based support for using these libraries as <script> loads below
 *    Other uses include NodeJS modules
 */

const HtmlDocTypeHeading =
`<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
xmlns:w='urn:schemas-microsoft-com:office:word'
xmlns='http://www.w3.org/TR/REC-html40'>`;


/**
 * @function createInWord
 */
function createInWord(
	source: {
   	contentInHTML: string,
		sourceType: "STRING" | "FILE"
		sourceProtocol?: "HTTPS" | "FILE"  // file will be assumed
	},
   savedFileName: string
) {
   let aNode: HTMLAnchorElement = document.createElement("a");

		if (source.sourceType == "FILE") {
			if (!source.sourceProtocol)
				throw "Use of sourceType 'File' requires specifying optional parameter 'sourceProtocol'\n" +
					"with either 'HTTPS' parameter value (when using browser & remote server) or 'FILE' if\n" +
					"using a server like Node where permissions is not an issue.";
			if (source.sourceProtocol == 'HTTPS') {

			} else { // HTTPS

			}
		}
      if (source.contentInHTML.search(/^\s*<!DOCTYPE html>/) != 0)
         source.contentInHTML = HtmlDocTypeHeading + source.contentInHTML;
      // if filename
      document.body.appendChild(aNode);
		aNode.href = "data:application/vnd.ms-word;charset=utf-8," +
					encodeURIComponent(source.contentInHTML);
		aNode.download = savedFileName  + ".doc";
		aNode.click();
}


/*
function wordDocxBuild(renderedHtml: string): Promise<any> {
	return new Promise((resolve, reject) => {
		let blob = htmlDocx.asBlob(renderedHtml, {
				orientation: "landscape",
				margins: {
					top: 720,
					bottom: 720
				}
			}),
			jszip = new JSZip();
		//		saveAs(blob, "document.docx");
		jszip.loadAsync(blob).then((buffer: any) => {
			jszip.file();
			resolve(blob);
		}).catch((response: any) => {
			reject(response);
		});
	});
} */


/*****************************************************************************

<!-- Load the jszip library from a CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js"></script>

Find latest version: https://cdnjs.com/libraries/jszip
Reference on GitHub https://stuk.github.io/jszip/

<!-- Load the docx library from a CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/docx/4.4.1/docx.browser.min.js"></script>

<script>
// Assume we have an HTML string stored in a variable called "htmlString"

// Create a new JSZip object
const zip = new JSZip();

// Add a file to the zip containing the HTML string
zip.file('document.html', htmlString);

// Generate the Word document
const doc = new window.docx.Document();
const paragraph = new window.docx.Paragraph();
paragraph.createTextRun('Hello World');
doc.addParagraph(paragraph);

// Convert the Word document to a blob
const blob = await window.docx.Packer.toBlob(doc);

// Add the blob to the zip as a file named "document.doc"
zip.file('document.doc', blob);

// Generate the final zip file
const zipFile = await zip.generateAsync({ type: 'blob' });

// At this point, you can save the zip file to disk or do whatever else you need to with it
</script>

*******************************************************************************/