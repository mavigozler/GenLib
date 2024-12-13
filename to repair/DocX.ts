"use strict";

import * as fs from 'fs';
import { Document, Packer, Paragraph, TextRun } from "docx";

function createDocx() {
	const titleBlock: Paragraph = new Paragraph({
		children: [
			new TextRun({
				text: "Department of Water Resources",
				font: "Bookman Old Style",
				size: "16pt",
				bold: true
			}),
			new TextRun({
				text: "Division of O&M",
				font: "Bookman Old Style",
				size: "16pt",
				bold: true
			}),
			new TextRun({
				text: "STATE WATER PROJECT",
				font: "Calibri Light",
				size: "16pt",
				bold: true,
				allCaps: true
			}),
			new TextRun({
				text: "Change Advisory Board Meeting",
				font: "Verdana",
				size: "20pt",
				bold: true
			}),
			new TextRun({
				text: `MEETING MINUTES -- ${MeetingDay}`,
				font: "Verdana",
				size: "16pt",
				bold: true
			}),

		],
	})
	const doc: Document = new Document({
		sections: [{
			properties: {},
			children: [
				new Paragraph({
					children: [
						new TextRun("Hello World"),
						new TextRun({
							text: "Foo Bar",
							bold: true,
						}),
						new TextRun({
							text: "\tGithub is the best",
							bold: true,
						}),
					]
				})
			]
		}]
	});
	// Used to export the file into a .docx file
	Packer.toBuffer(doc).then((buffer) => {
		fs.writeFileSync("My Document.docx", buffer);
	});
}
