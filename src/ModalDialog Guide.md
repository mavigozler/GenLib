
# Modal Dialog Guide

User will interact with instantiated class `ModalDialog`. The constructor requires up to four parameters. The first and required parameter is
`dialogSpec` which is an object of type

```TypeScript
{
   form: DialogControl[];
   formStyle?: {namedStyle: string} | ModalDialogStyling[];
}
```

The second and required parameter is `callback` and should be a defined
function of type `DialogCallback`, which is of the type `(data: ModalDialogResponse) => boolean`.

The third and optional parameter is a boolean to indicate whether a close button should be
included. By default, it is `false` if omitted, and the close button is not included.

The fourth and optional parameter is a string pointing to a container `id`
attribute outside the dialog and the containing parent of the main page. If this is not
provided, 'ModalDialog.ts' will create a DIV element and attach it to the HTML body as the
first child and style it as a fixed element in the web page centered vertically and
horizontally. Generally, a ModalDialog.ts user can omit creating and providing own DIV to
construct the dialog.

## Form Dialog Schema

Users should define the entire dialog as controls within an HTML Form element.

```TypeScript
//  documentElement: document,
  containerId: "modal-window",
  callback: formResponseProcess(),
  dialogSpec: {
   form: [{
    block: [{
     block: [{
      content: "Click ",
      contentContainer: {
       element: "span"
      }
     },
     {
      elemName: "a",
      elementContainer: {
       element: "span"
      },
      attributes: [{
       name: "href",
       value: `CAB%20app%20Help.aspx?serenahelp=true&header=${headerValue}`
      },
      {
       name: "target",
       value: "_blank"
      }],
      children: [{
       content: "here",
       contentContainer: {
        element: "span"
       }
      }]
        },
        {
         content: " for help on using this control.",
         contentContainer: {
           element: "span"
         }
        }
       ],
       blockContainer: {
        element: "p" // "div"|"p"|"span", also properties 'id','class','style' possible
       }
     },
     {
       block: [{
         elemName: "label",
         elementContainer: {
           element: "p"
         },
         children: [{
            content: "Header: ",
            contentContainer: {
             element: "span"
            }
           }]
        },
        {
         elemName: "input",
         elementContainer: {
           element: "p"
         },
         attributes: [{
            name: "name",
            value: "Serena-header"
           },
           {
            name: headerName,
            value: headerValue
           },
           {
            name: "size",
            value: "50"
           }]
        }],
       blockContainer: {
        element: "p"
       }
     }],
    blockContainer: {
     element: "div"
    }
   },
   {
    block: [{
       elemName: "label",
       elementContainer: {
        element: "span"
       },
       children: [{
         content: "CSV-Formatted Serena Data: ",
         contentContainer: {
           element: "span"
         }
        }]
     },
     {
       elemName: "textarea",
       elementContainer: {
        element: "p"
       },
       attributes: [{
         name: "name",
         value: "Serena-input"
        },
        {
         name: "rows",
         value: "15"
        },
        {
         name: "placeholder",
         value: serenaInput
        },
        // "\ne.g.\n\n" +  SerenaInputExample },
        {
         name: "style",
         value: "width:100%;"
        }],
       eventHandler: {
        event: "change",
        handler: () => {
         let headerFound = null;
         const parsedLines = csvFiles.CSVToArray((getFormControl("Serena-input") as HTMLInputElement).value);
         for (const line of parsedLines)
           if (line.join(",").search(/^\s*"?(CAB.*) -/) >= 0) {
            headerFound = line.join(",").match(/^\s*"?(CAB.*) -/)![1];
            if (checkHeader == true) {
             if (headerValue != headerFound)
               return bootbox.alert("The ticket data header does not correspond to the " +
                "item header. Either change the header or change the data. No further processing performed.");
            }
            else
             (getFormControl("Serena-header") as HTMLInputElement).value = headerFound;
           }
         if (headerFound == null)
           return bootbox.alert("The submitted data lacked the identifying information " +
            "to show it is Serena ticket data. Obtain properly formatted CSV data.");
        },
        bubble: false,
       }
     }],
    blockContainer: {
     element: "p"
    }
   },
 ],
 formStyle: [{
    selector: "label",
    rule: "font: bold 11pt Arial,sans-serif;color:purple"
   },
   {
    selector: "input",
    rule: "font: normal 10pt Arial,sans-serif"
   },
   {
    selector: "#modal-window",
    rule: "width:50%;font:normal 11pt Arial,sans-serif;margin:auto;" +
     "background-color:#f8f8f8;padding:1em;position:fixed;top:5%;left:25%;z-index:1;" +
     "border:12px outset darkgreen;}"
   },
   {
    selector: "#modal-form",
    rule: "border:2px solid blue;margin:1em;background-color:#f8f8f8;padding:1em;"
   }]
      }
   });
}
```

### Form Dialog Example

```TypeScript
   const mdlDlg = new ModalDialog(
      {
         form: //DialogControl[];
         formStyle: //{selector: string; rule: string;}[];
      },
      callback: serenaFormResponse,  // DialogCallback
      containerId?: "modal-window", // string,
      // true   /// addCloseButton?: boolean,
      dialogId: "modal-form",
      form: {
         controls: [
            introText[0],
            {
               block: [
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
                  eventHandler: { event: "change", handler: () => {
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
   });
```

## Dependencies for Modal Dialog module

* `iCss` in "iCss.ts":
  class methods are used to interact with stylesheets
* `CreateUUID` in "etc.ts"
  used to generate UUIDs for HTML elements generated dynamically and `id` attribute used

## Types

### Exported types

* ModalDialog,
* ModalDialogResponse,
* DialogText,
* DialogControl

### Internal types

* DialogCallback
* ModalDialogResponse
* ContentContainer
* DialogText
* DialogFormElement
* DialogBlock
* DialogInputElement
* DialogControl
* ModalDialogStyling

### Class ModalDialog
