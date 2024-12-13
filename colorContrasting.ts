"use strict";

class ColorComponents {
   colorNumerics: {
      r: number;
      g: number;
      b: number;
   } = {r: 0, g: 0, b: 0};

   constructor(color: string | number) {
   	let colors: string[] = [ "r", "g", "b" ],
         components;

// colors are names, strings
      if (typeof color == "string") {
         let strComponents: RegExpMatchArray | null = null;

         if (color.charAt(0) == "#") {
            if (color.length == 7)
               strComponents = color.toLowerCase().
                  match(/^#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/);
            else if (color.length == 4) {
               strComponents = color.toLowerCase().
                  match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
            }

            if (strComponents == null || strComponents.length != 4)
               throw "Parse of 'color' parameters does not yield 4 features";
            else
               for (let i = 1; i < 4; i++) {
                  if (strComponents[i].length == 1)
                     strComponents[i] = strComponents[i][0] + strComponents[i][0];
                  this.colorNumerics[colors[i - 1] as keyof typeof this.colorNumerics] = parseInt(strComponents[i], 16);
               }
         } else if (color.search(/rgb\(\d+/) >= 0) {
            strComponents = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
         } else
            return; // no valid string offered!
         components
      } else if (typeof color == "number") {
         let workingColor: number,
               components: number[] = [];

         workingColor = color;
         for (let i = 2; i >= 0; i--) {
            components[i] = (workingColor % 256);
            workingColor >>= 8;
         }
      } else
         throw "Parameter 'color' is not type 'number' or 'string'";

      this.colorNumerics.r = Number(components[1]);
      this.colorNumerics.g = Number(components[2]);
      this.colorNumerics.b = Number(components[3]);
   }
	toCssRgbHexadecimalString() {
		var hexDigits = "";
		for (var i = 0; i < 3; i++) {
			if (this[colors[i]] < 16)
				hexDigits += "0";
			hexDigits += this[colors[i]].toString(16);
		}
		return ("#" + hexDigits.toLowerCase());
	}
	toCssRgbGroupedDecimalString() {
		return ("rgb(" + this.red.toString().toLowerCase() + ", " +
				this.green.toString().toLowerCase() + ", " +
				this.blue.toString().toLowerCase() + ")");
	};
	toCssRgbGroupedPercentageString() {
		return ("rgb(" + Math.round(this.red/255*100).toString().toLowerCase() + "%, " +
				Math.round(this.green/255*100).toString().toLowerCase() + "%, " +
				Math.round(this.blue/255*100).toString().toLowerCase() + "%)");
	};

   getColorBrightness(theColor: ColorComponents): number {
      return ((theColor.red * 299 + theColor.green * 587 +
         theColor.blue * 114) / 1000);
   }

   getColorDifference(color1: ColorComponents, color2: ColorComponents): number {
      return (Math.max(color1.red, color2.red) - Math.min(color1.red, color2.red) +
            Math.max(color1.green, color2.green) - Math.min(color1.green, color2.green) +
            Math.max(color1.red, color2.blue) - Math.min(color1.red, color2.blue));
   }

/* color1 is the color to provide */
   static generateRandomContrastColor(
      color1: ColorComponents,
      returnType: string
   //   color1stdominance,
   //   color2nddominance
   ) {
      /* 1. Evaluate color brightness of two colors.  If difference >= 125, pass
         2. If color difference--distinct from brightness difference--is >= 500, pass */
      let setColors: boolean[] = [ false, false, false ],
         color2: ColorComponents = new ColorComponents("#ffffff"),
         colorDominances: string[] = [ "red", "green", "blue" ];
      do {
         for (let i = 2, j = 0; i < 4; i++) {
            if (arguments[i]) {
               for (j = 0; j < 3; j++)
                  if (arguments[i].toLowerCase() == colorDominances[j])
                     break;
               if (j < 3) {
                  if (color1[colorDominances[j]] <= 0x7f)
                     color2[colorDominances[j]] = Math.round(getRandom(0x80, 0xff));
                  else
                     color2[colorDominances[j]] = Math.round(getRandom(0x00, 0x7f));
                  setColors[j] = true;
               }
            }
         }
         for (i = 0; i < 3; i++)
            if (setColors[i] == false)
               if (color1[colorDominances[i]] <= 0x7f)
                     color2[colorDominances[i]] = Math.round(getRandom(0x80, 0xff));
                  else
                     color2[colorDominances[i]] = Math.round(getRandom(0x00, 0x7f));
      } while (Math.abs(this.getColorBrightness(color1) - this.getColorBrightness(color2)) < 125 ||
                  this.getColorDifference(color1, color2) < 500 ||
                  this.isContrastGood(color1, color2) == false);
      if (returnType.toLowerCase() == "cssColorString".toLowerCase())
         color2 = color2.toCssRgbHexadecimalString();
      else if (returnType != "object") // return as a number
         color2 = Number(((color2.red << 8) << 8) + (color2.green << 8) + color2.blue);
      return color2;
   }

   isContrastGood(color1: ColorComponents, color2: ColorComponents): boolean {
      let luminosity: number[] = [],
         lumRatio: number;

      for (let i = 0; i < arguments.length; i++)
         luminosity.push(Math.pow(arguments[i].red / 255, 2.2) * 0.2126 +
               Math.pow(arguments[i].green / 255, 2.2) * 0.7152 +
               Math.pow(arguments[i].blue / 255, 2.2) * 0.0722);
      if (luminosity[0] > luminosity[1])
         lumRatio = (luminosity[0] + 0.05) / (luminosity[1] + 0.05);
      else
         lumRatio = (luminosity[1] + 0.05) / (luminosity[0] + 0.05);
      if (lumRatio >= 5 || lumRatio <= 0.2)
         return true;
      return false;
   }
}
/**
 *

 Interfacing Library Functions

===> class ColorComponents (color)

     A constructor with function overloading capabilities which returns
     an object required to be used by other functions in the library.

     Argument 'color' can be a string or numeric type, although it is
     likely to be the string type.

     The string type argument must be formatted to show valid CSS color
     formats, of which two types are recognized:
     1. "rgb(ddd,ddd,ddd)" where 'ddd' refers to a decimal number between
        0 and 255 which specify red,green,blue color components
     2. "rgb(dd%,dd%,dd%) where 'dd%' is a percentage value instead of
        the 0-255 decimal value
     2. "#xxxxxx"  or "#xxx" which are the hexadecimal values for specifying
        red/green/blue color components in CSS, and the 3- and 6-digit formats
        are recognized

    The constructed object has 3 properties (.red, .green, .blue) in numeric
    type and 3 methods:

    1.  .toCssRgbHexadecimalString()
       returns the set object color component values as a valid CSS
       6-digit hexadecimal string:  "#xxxxxx"

		2. .toCssRgbGroupedDecimalString()
       returns the set object color component values as a valid CSS
       rgb grouped decimal series string  "rgb(ddd,ddd,ddd)"

    3. returns the set object color component values as a valid CSS
       rgb grouped percentage series string  "rgb(dd%,dd%,dd%)"

===>  generateRandomContrastColor(color1, returnType,
				color1stdominance, color2nddominance)

		This function helps to report a good color that provides contrast
		with an input color (color1).  This helps to build background and
		foreground (text) colors.

		In practice, the input color1 might be a DOM element's (body, div)
		background color.  This would generate return color that would be ideal
		in providing contrast against the element background, and might be
		another contained element's background or the foreground text color
		for the background.  If it is for contained element's background color,
		then the returned value can be input into the function again to return
		a foreground (text) color that is contrasting.

		Parameters/arguments:

		1. color1:  must be an object constructed by ColorComponents() defined
		   above
		2. returnType:  the type of value returned can be of type string, numeric,
		   or an object constructed by ColorComponents, representing the contrasting
		   color
		   a) "cssColorString": returns the color as a string in valid
		      CSS hexadecimal string format:  #xxxxxx
		   b) numeric type:  returns a number value which is equal to
		      (red value * 16^2 + green value * 16 + blue value)
		   c) object:  returns the object of type ColorComponents

		3. colorDominance1:  an OPTIONAL argument with value of type string
			with only three possible values: "red", "green", "blue".  Setting this
			argument will influence the function to return a color whose value
			has a hue of the specified color.  Thus, if the value is "blue", it
			will return a value that is blue-hued.

		4. colorDominance2:  an OPTIONAL argument with value of type string
			with only three possible values: "red", "green", "blue".  Performs
			similarily in providing setting preferred coloring.


Support Library Functions

These would not normally be called externally.  These functions probably
best classed within a constructor, but for now should be considered
statically defined.


 ===> function getColorBrightness(theColor)

	Uses a standard algorithm to evaluate the "brightness" of a color.
	Color brightness is characteristic of what the human eye is sensitive
	to in the color spectrum, so the values are arrived at empirically.

  As used here, the minimum brightness value of 125 must be returned for
  an acceptably randomly chosen color.

  The single argument must be an object returned by ColorComponents()
  constructor, which is the input color whose brightness is to be
  evaluated.

  The returned value is of numeric type.


===> function getColorDifference(color1, color2)

  Evaluates the 'color difference' between two colors.
  This is simply computed as the sum of the absolute values of the differences
  in the red, green, and blue color components.  A high value would indicate
  significant color difference.

  For the purposes of this library, good contrast will assumed if the
  color difference exceeds a value of 500.


===> function getRandom(minORset, max)

	an old library function used to generate random numbers either between
	a range (requires two arguments, the minimum and maximum of the range)
	or from a set (array) of elements, (takes only one argument of type Array).

	If a min-max two arg call was used, returns a random number between
	min and max

	If an array type of elements was used, returns the element that
	corresponds to a random picking.


===> function isContrastGood(color1, color2)

  A function intended to report if the contrast is good between two colors.

  It is
	var luminosity = new Array();
	for (i = 0; i < 2; i++)
		luminosity.push(Math.power(arguments[i].red / 255, 2.2) * 0.2126 +
				Math.power(arguments[i].green / 255, 2.2) * 0.7152 +
				Math.power(arguments[i].blue / 255, 2.2) * 0.0722);
	if (luminosity[0] > luminosity[1])
		lumRatio = (luminosity[0] + 0.05) / (luminosity[1] + 0.05);
	else
		lumRatio = (luminosity[1] + 0.05) / (luminosity[0] + 0.05);
}
*/