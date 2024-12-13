"use strict";

//import { sendRequest } from "../RestRequesting";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import JSDOM from "jsdom";
//const sendRequest = require("./RestRequesting");

// Define the HTML content
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Dynamic HTML Document</title>
</head>
<body>
   <form id="request-form">
      <input id="request-url"
         value="https://google.com" >
      <input type="checkbox" id="cors-proxy">
      <textarea rows="12" name="response"></textarea>
   </form>
</body>
</html>
`;

//const htmlDocument = JSDOM(htmlContent).window.document;
//sendRequest(htmlDocument.getElementById("request-form") as HTMLFormElement);