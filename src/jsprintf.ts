"use strict";
/* insert eslint DISABLING for compiled JS here */
/* eslint-disable prefer-rest-params */
/* _id:jsprintf.js */

export { jsprintf };
/*********************************************************************

Defined functions in this file:

 isdigit()
 string_inside_field()
 jsprintf()

Original UNIX manual description of printf() is located at bottom of
this file.

 *********************************************************************/


const LEFT_JUSTIFY =			0x01,
	LEADING_ZEROES = 		0x02,
	SIGNED =					0x04,
	EXPECT_PRECISION =		0x08,
	FORMAT_ERROR =			0x10,
	ARG_SUBBED =				0x20,
	EXPECT_CONVERSION =		0x40,
	PREFIXED_RADIX =          0x80;

function isdigit(ch: string): boolean {
	if (ch < '0' || ch > '9')
		return false;
	return true;
}

function string_inside_field(
	str: string,
	field_width: number,
	option: number
) {
	if (typeof str  == "undefined" || typeof field_width  == "undefined" ||
			typeof option == "undefined" || field_width <= 0)
		return null;
	let block = "";
	if (option & LEFT_JUSTIFY)
		block += str;
	for (let i = field_width - str.length; i > 0; i--)
		block += " ";
	if ((option & LEFT_JUSTIFY) == 0)
		block += str;
	return block;
}

/* the variable 'state' determines the state of argument substitution
  in the format parameter.  Arguments are everything between the leading
  '%' which denotes the start of an argument to a character that specifies
  the end of an argument, such as 'f' for floating points, 'd' for integers,
  and 's' for strings.  Everything in between is either a specification
  for a precision or a modifying type.  The following states hold:

  ARG_SUBBED:  an argument has been substituted successfully (completed).
     Usually the next character can be anything
  FORMAT_ERROR:  an unexpected character occurred during argument
     substitution;  this usually means that a conversion will not
	  take place
  EXPECT_CONVERSION:  the next character should be a conversion character,
     such as 's' for string, 'c' for character, 'd' for integer, 'f' for
	  float, and so on
  EXPECT_PRECISION:  the next character (digit) should be a precision, which
      is particularly meaning for floating point variables, as it specifies
	  the number of digits that follow a decimal point.
   LEFT_JUSTIFY:  strings are by default right-justified when they occur
      as shorter in length than the width of the field (or precision, if
	  given) that they will occupy.  Special characters are used to
	  left-justify string values.
	LEADING_ZEROES: A zero (0) character in front of a field width or
	  specifying the field width when a precision is present indicates that
	  the field will be field with zeroes to the left of the string of digits
	  representing the numeric value, after its width is determined first.
	PREFIXED_RADIX:  for some numbers, the symbol that specifies the radix
	   type will be indicated:  thus 'printf("%o", 10)' outputs '12' as the
	   octal of decimal 10, but 'printf("%#o", 10)' outputs '012' with the
	   leading zero indicating an octal number.  For the e,E, or f conversions,
	   the '#' forces a decimal point even if there are only zeroes after it.
	   With g or G, the same results as e or E, resp., but trailing zeroes are
	   also printed.
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function jsprintf(format: string, ...values: unknown[]): string | null {
	let finalResult: string = "",
		i,
		state,
		idx,
		precision,
		fwidth,
		argIndex,
		val,
		str,
		// len,
		buflen,
		valstr,
		ch,
		radval,
		radix,
		radixform,
		rdigit,
		exponent,
		exponenlen;

	state = 0;
	argIndex = 0;
	if (typeof format !== "string")
		return null;
	// count args in format and those
	while ((idx = format.search(/%/)) >= 0) {
		if (idx > 0)
			finalResult += format.slice(0, idx);
		idx++;
		do {
			switch (ch = format.charAt(idx)) {
			case 'l':  /* a modifier for a type of integer (long or short) */
			case 'h':
				if ((state & EXPECT_CONVERSION) != 0) {
					state |= FORMAT_ERROR;
					break;
				}
				idx++;
				break;
			case 'u':   /* a conversion for an unsigned integer */
				(values[argIndex] as number) &= 0x7ffffff;
				break;
			case 'd':   /* conversion characters for integers */
			case 'i':
				val = values[argIndex++];
				state |= ARG_SUBBED;
				idx++;
				if (typeof val == "undefined" || val == null) {
					finalResult += " ";
					break;
				}
				if (typeof val === "number")
					val = parseInt(val!.toString()) as number;
				if (isNaN(val as number) || val == Number.NEGATIVE_INFINITY ||
													val == Number.POSITIVE_INFINITY) {
					finalResult += " ";
					break;
				}
				valstr = val.toString();
				if ((state & SIGNED) != 0 && (val as number) >= 0.0)
					valstr = "+" + valstr;
				if (typeof(fwidth) == "undefined")
					if (typeof(precision) == "undefined")
						fwidth = valstr.length;
					else
						fwidth = precision; // this code recently added based on new info on precision
				buflen = valstr.length;
				if ((state & LEFT_JUSTIFY) == 0)
					valstr = "";
				for (i = fwidth - buflen; i > 0; i--)
					if ((state & LEADING_ZEROES) == 0 || (state & LEFT_JUSTIFY) != 0)
						valstr += " ";
					else
						valstr += "0";
				if ((state & LEFT_JUSTIFY) == 0)
					valstr += val;
				finalResult += valstr;
				break;
			case 'b':
			case 'x':   /* a conversion character for a hexadecimal number */
			case 'X':
			case 'o':  /* conversion character for an octal number */
				radixform = "";
				radix = (ch == 'o') ? 8 : (ch == 'b') ? 2 : 16;
				if ((state & PREFIXED_RADIX) != 0)
					if (ch == 'x')
						radixform += "0x";
					else if (ch == 'X')
						radixform += "0X";
					else if (ch == 'o')
						radixform += "0";
					else
						radixform += '&';
				radval = parseInt(arguments[argIndex++].toString());
				for (i = 0; radval > Math.pow(radix, i); i++)
					;
				for (i--; i >= 0; i--) {
					rdigit = Math.floor(radval / Math.pow(radix, i));
					radval -= Math.pow(radix, i) * rdigit; // balance
					if (ch != 'o' && rdigit > 9)
						if (ch == 'x')
							rdigit = String.fromCharCode('a'.charCodeAt(0) +
							(rdigit - 10));
						else
							rdigit = String.fromCharCode('A'.charCodeAt(0) +
							(rdigit - 10));
					radixform += rdigit;
				}
				// TODO what does this do?
//				if (radixform.length < fwidth!)
//					format_integer(radixform, state, fwidth);
				state |= ARG_SUBBED;
				idx++;
				finalResult += radixform;
				break;
			case 'p': /* pointers not allowed */
				state |= ARG_SUBBED;
				idx++;
				break;
			case 'f':	/* default is [-]ddd.ddd or %6.3f */
			case 'e':  /* conversion character for scientific notation */
			case 'E':
				idx++;
				state |= ARG_SUBBED;
				val = Number(arguments[argIndex++]);
				if (typeof(val) == "undefined" || isNaN(val) == true ||
						val == Number.NEGATIVE_INFINITY || val == Number.POSITIVE_INFINITY) {
					finalResult += " ";
					break;
				}
				if (typeof(precision) == "undefined")
					precision = 6;
				if (typeof(fwidth) == "undefined")
					fwidth = 6;
				if (precision > fwidth)
					fwidth = precision;
				if (ch != 'f') {
					exponent = 0;
					while (val > 10.0 || val < 1.0)
						if (val < 1.00) {
							exponent--;
							val *= 10.0;
						} else {
							exponent++;
							val /= 10.0;
						}
				}
				valstr = val.toFixed(precision);
				if (ch != 'f')	{
					valstr += ch;
					if (exponent! < 0.0)
						valstr += "-";
					else
						valstr += "+";
					exponenlen = String(exponent).length;
					valstr += (exponenlen == 1) ? "00" : (exponenlen == 2) ? "0" : "";
						valstr += exponent;
				}
				finalResult += valstr;
				break;
			case 'g':  /* conversion character for floating point */
			case 'G':
				break;
			case '-':  /* specifies that strings should be left-justified */
				if ((state & EXPECT_CONVERSION) != 0)
				{
					state |= FORMAT_ERROR;
					break;
				}
				if ((state & EXPECT_PRECISION) == 0)
					state |= LEFT_JUSTIFY;
				idx++;
				break;
			case '*':  // modifier says that next argument specifies the precision
				if ((state & EXPECT_CONVERSION) != 0)
				{
					state |= FORMAT_ERROR;
					break;
				}
				if ((state & EXPECT_PRECISION) == 0)
					fwidth = parseInt(arguments[argIndex++].toString());
				else
					precision = parseInt(arguments[argIndex++].toString());
				idx++;
				break;
			case '+':  // specifies that substituted argument must have a forced sign
				if ((state & EXPECT_CONVERSION) != 0)
				{
					state |= FORMAT_ERROR;
					break;
				}
				if ((state & EXPECT_PRECISION) == 0)
					state |= SIGNED;
				idx++;
				break;
			case '.':   // specifies a precision
				if ((state & EXPECT_CONVERSION) != 0)
				{
					state |= FORMAT_ERROR;
					break;
				}
				if ((state & EXPECT_PRECISION) != 0)
					state |= FORMAT_ERROR;
				state |= EXPECT_PRECISION;
				idx++;
				break;
			case ' ': /* if there is a sign, this is ignored */
				if ((state & EXPECT_CONVERSION) != 0)
				{
					state |= FORMAT_ERROR;
					break;
				}
				if ((state & SIGNED) == 0)
					break;
				break;
			case '#':  // write not just the value of a radix, but its prefix too
				state |= PREFIXED_RADIX;
				idx++;
				break;
			case '%':  // conversion character is a '%' character
				if ((state & EXPECT_CONVERSION) != 0)
				{
					state |= FORMAT_ERROR;
					break;
				}
				finalResult += "%";
				idx++;
				state |= ARG_SUBBED;
				break;
			case 's':   // conversion character for a string
				state |= ARG_SUBBED;
				idx++;
				str = arguments[argIndex++];
				if (typeof str  == "undefined") {
					finalResult += " ";
					break;
				}
				if (typeof(str) != "string")
					str = str.valueOf().toString();
				if (typeof(precision) == "undefined" || precision == null) {
					if (typeof(fwidth) == "undefined" || fwidth == null)
						finalResult += str;
					else /* fwidth specifies a minimum width */
						finalResult += string_inside_field(str, fwidth, state);
				} else if (typeof(fwidth) == "undefined" || fwidth == null) {
					/* precision specifies maximum! */
					if (precision < str.length)
						finalResult += str.slice(0, precision);
					else
						finalResult += str;
				} else { // both precision and fwidth specified
					/* precision specifies maximum and overrides fwidth value! */
					if (precision < fwidth)
						if (precision < str.length)
							finalResult += str.slice(0, precision);
						else
							finalResult += string_inside_field(str, fwidth, state);
					else // precision >= fwidth
						if (precision < str.length)
							finalResult += str.slice(0, precision);
						else if (fwidth < str.length)
							finalResult += string_inside_field(str, fwidth, state);
						else // this next part recently changed based on new info
							finalResult += string_inside_field(str, precision, state);
				}
				break;
			case 'c':   // conversion character for a character
				val = arguments[argIndex++];
				state |= ARG_SUBBED;
				idx++;
				if (isNaN(val) == true)
					finalResult += val;
				else
					finalResult += String.fromCharCode(parseInt(val));
				break;
			case '0':   // modifies numbers to have leading zeroes
				if ((state & EXPECT_CONVERSION) != 0) {
					state |= FORMAT_ERROR;
					break;
				}
//  apparently, leading zeroes can be specified even when precision is specified
				idx++;
				if ((state & EXPECT_PRECISION) != 0)
					for (precision = 0; isdigit(ch = format.charAt(idx)) == true; idx++)
						precision = Number(ch) + 10 * val;
				else
					state |= LEADING_ZEROES;
				break;
			default:
				if ((state & EXPECT_CONVERSION) != 0) {
					state |= FORMAT_ERROR;
					break;
				}
				i = val = 0;
				while (isdigit(ch = format.charAt(idx)) == true) {
					val = Number(ch) + 10 * val;
					idx++;
				}
				if (state & EXPECT_PRECISION) {
					precision = val;
					state |= EXPECT_CONVERSION;
				} else
					fwidth = val;
			}
		} while ((state & (ARG_SUBBED | FORMAT_ERROR)) == 0);
		state = 0;
		format = format.substring(idx);
		precision = undefined;
		fwidth = undefined;
	}
	finalResult += format;
	return finalResult;
}

/*
if (typeof(Date.prototype.toLocaleFormat) == "undefined") {
	Date.prototype.toLocaleFormat = function (formatString) {
	//strftime source code adapted from
	//   http://www.eskimo.com/~scs/src/strftime.c
	var weekdays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
		"Friday", "Saturday" ],
		months = [ "January", "February", "March", "April", "May", "June", "July",
			"August", "September", "October", "November", "December" ];
	function strftime(s, maxsize, format, timeptr) {
		// char *s; size_t maxsize; const char *format; const struct tm *timeptr;
		//register char *fp = format;
		//register char *dp = s;
		//register size_t ret = 0;
		if (typeof(format) == "undefined" || typeof(s) == "undefined" || maxsize <= 0)
			return (null);

		// #define Putch(c) (ret < maxsize ? (*dp++ = (c), ret++) : 0)

		while (*fp != '\0') {
			char *p;
			int len;
			char tmpbuf[10];

			if (*fp != '%') {
				Putch(*fp++);
				continue;
			}
			fp++;
			switch(*fp) {
			// #define Putstr(str) p = str; goto dostr
			// #define Putstrn(str, n) p = str; len = n; goto dostrn
			// #define Printf(fmt, arg) sprintf(tmpbuf, fmt, arg); p = tmpbuf; goto dostr
			// #define Recur(fmt)	{						     \
			//	size_t r = strftime(dp, maxsize - ret, fmt, timeptr); \
			//		if(r <= 0)					     \
			//			return r;				     \
			//		dp += r;					     \
			//		ret += r;					     \
			//  }
			case 'a':	// locale's abbreviated weekday name
				Putstrn(weekdays[timeptr->tm_wday], 3);
				break;
			case 'A':	// locale's full weekday name
				Putstr(weekdays[timeptr->tm_wday]);
				break;
			case 'b':	// locale's abbreviated month name
				Putstrn(months[timeptr->tm_mon], 3);
				break;
			case 'B':	// locale's full month name
				Putstr(months[timeptr->tm_mon]);
				break;
			case 'c':	// appropriate date and time representation
				Recur("%X %x");		// s.b. locale-specific
				break;
			case 'd':	// day of month as decimal number (01-31)
				Printf("%02d", timeptr->tm_mday);
				break;
			case 'H':	// hour (24-hour clock) as decimal (00-23)
				Printf("%02d", timeptr->tm_hour);
				break;
			case 'I':	// hour (12-hour clock) as decimal (01-12)
				Printf("%02d", ((timeptr->tm_hour + 11) % 12) + 1);
				break;
			case 'j':	// day of year as decimal number (001-366)
				Printf("%03d", timeptr->tm_yday + 1);
				break;
			case 'm':	// month as decimal number (01-12)
				Printf("%02d", timeptr->tm_mon + 1);
				break;
			case 'M':	// month as decimal number (00-59)
				Printf("%02d", timeptr->tm_min);
				break;
			case 'p':	// AM/PM designations (12-hour clock)
				Putstr(timeptr->tm_hour < 12 ? "AM" : "PM");
						// s.b. locale-specific
			break;
			case 'S':	// second as decimal number (00-61)
				Printf("%02d", timeptr->tm_sec);
				break;
			case 'U':	// week of year (first Sunday = 1) (00-53)
			case 'W':	// week of year (first Monday = 1) (00-53)
			{
				int fudge = timeptr->tm_wday - timeptr->tm_yday % 7;
				if(*fp == 'W')
					fudge--;
				fudge = (fudge + 7) % 7;      // +7 so not negative
				Printf("%02d", (timeptr->tm_yday + fudge) / 7);
				break;
			}
			case 'w':	// weekday (0-6), Sunday is 0
				Printf("%02d", timeptr->tm_wday);
				break;
			case 'x':	// appropriate date representation
				Recur("%B %d, %Y");	// s.b. locale-specific
				break;
			case 'X':	// appropriate time representation
				Recur("%H:%M:%S");	// s.b. locale-specific
				break;
			case 'y':	// year without century as decimal (00-99)
				Printf("%02d", timeptr->tm_year % 100);
				break;
			case 'Y':	// year with century as decimal
				Printf("%d", timeptr->tm_year + 1900);
				break;
			case 'Z':	// time zone name or abbreviation
				// XXX %%%
				break;
			case '%':
				Putch('%');
				break;

dostr:	while(*p != '\0')
				Putch(*p++);
				break;

dostrn:	while(len-- > 0)
				Putch(*p++);
				break;
			}
			fp++;
		}
		if(ret >= maxsize) {
			s[maxsize - 1] = '\0';
			return 0;
		}
		*dp = '\0';
		return ret;
	}
	// #ifdef MAIN
	// #include <stdlib.h>
	// #define FMTBUFSIZE 100

		main(argc, argv)
		int argc;
		char *argv[];
		{
			int argi;
			char *format;
			time_t now;
			struct tm *tmp;
			char fmtbuf[FMTBUFSIZE];

			argi = 1;

			if(argi < argc && strcmp(argv[argi], "-t") == 0)
				{
				argi++;
				now = atol(argv[argi++]);
				}
			else	now = time((time_t *)NULL);

			if(argi < argc)
				format = argv[argi];
			else	format = "%c";

			tmp = localtime(&now);

			strftime(fmtbuf, FMTBUFSIZE, format, tmp);

			printf("%s\n", fmtbuf);

			exit(0);
		}

	}
}

/*****************

     printf(3S)           STANDARD I/O FUNCTIONS            printf(3S)
     NAME
          printf, fprintf, sprintf - print formatted output
     SYNOPSIS

          #include <stdio.h>

          int printf(const char *format, .../ * args  * /);
          int fprintf(FILE *strm, const char *format, .../ * args * /);
          int sprintf(char *s, const char *format, .../ * args * /);

     DESCRIPTION
          printf places output on the standard output stream stdout.

          fprintf places output on strm.

          sprintf places output, followed by the null character  (\0),
          in  consecutive  bytes  starting  at  s.   It  is the user's
          responsibility to ensure that enough storage  is  available.
          Each  function  returns the number of characters transmitted
          (not including the \0 in the case of sprintf) or a  negative
          value if an output error was encountered.

          Each of these functions converts, formats,  and  prints  its
          args under control of the format.  The format is a character
          string that contains three types of objects defined below:

               1.  plain characters that  are  simply  copied  to  the
                   output stream;

               2.  escape   sequences   that   represent   non-graphic
                   characters;

               3.  conversion specifications.

          The following escape sequences produce the associated action
          on display devices capable of the action:

          \a   Alert.  Ring the bell.

          \b   Backspace.  Move the printing position to one character
               before   the   current  position,  unless  the  current
               position is the start of a line.

          \f   Form feed.  Move the printing position to  the  initial
               printing position of the next logical page.

          \n   Newline.  Move the printing position to  the  start  of
               the next line.

          \r   Carriage return.  Move the  printing  position  to  the
               start of the current line.

          \t   Horizontal tab.  Move the printing position to the next
               implementation-defined  horizontal  tab position on the
               current line.

          \v   Vertical tab.  Move the printing position to the  start
               of   the   next   implementation-defined  vertical  tab
               position.

          All forms of the printf functions allow for the insertion of
          a  language-dependent decimal-point character.  The decimal-
          point character is defined by the program's locale (category
          LC_NUMERIC).   In  the  C  locale,  or in a locale where the
          decimal-point character is not  defined,  the  decimal-point
          character defaults to a period (.).

          Each conversion specification is introduced by the character
          %.  After the character %, the following appear in sequence:

               An optional field, consisting of a decimal digit string
               followed  by  a  $,  specifying  the  next  args  to be
               converted.  If this field is  not  provided,  the  args
               following the last args converted will be used.

               Zero or more flags, which modify  the  meaning  of  the
               conversion specification.

               An optional string  of  decimal  digits  to  specify  a
               minimum  field width.  If the converted value has fewer
               characters than the field width, it will be  padded  on
               the  left  (or  right, if the left-adjustment flag (-),
               described below, has been given) to the field width.

               An optional precision that gives the minimum number  of
               digits  to  appear  for  the  d,  i,  o,  u,  x,  or  X
               conversions (the field is padded with  leading  zeros),
               the  number of digits to appear after the decimal-point
               character for the e, E, and f conversions, the  maximum
               number   of   significant   digits  for  the  g  and  G
               conversions, or the maximum number of characters to  be
               printed  from  a string in s conversion.  The precision
               takes the form of a period (.) followed  by  a  decimal
               digit  string;  a null digit string is treated as zero.
               Padding  specified  by  the  precision  overrides   the
               padding specified by the field width.

               An optional h specifies that a following d, i, o, u, x,
               or  X  conversion  specifier  applies to a short int or
               unsigned short  int  argument  (the  argument  will  be
               promoted  according  to the integral promotions and its
               value converted to short  int  or  unsigned  short  int
               before  printing);  an  optional  h  specifies  that  a
               following n conversion specifier applies to  a  pointer
               to a short int argument.  An optional l (ell) specifies
               that a following  d,  i,  o,  u,  x,  or  X  conversion
               specifier  applies  to  a long int or unsigned long int
               argument;  an  optional  l  (ell)  specifies   that   a
               following  n  conversion specifier applies to a pointer
               to long int argument.  An optional L specifies  that  a
               following e, E, f, g, or G conversion specifier applies
               to a long double argument.  If an h, l,  or  L  appears
               before  any other conversion specifier, the behavior is
               undefined.

               A conversion character (see below) that  indicates  the
               type of conversion to be applied.

          A field width or precision may be indicated by  an  asterisk
          (*)  instead  of  a  digit string.  In this case, an integer
          args supplies the field width or precision.  The  args  that
          is  actually  converted  is not fetched until the conversion
          letter is seen,  so  the  args  specifying  field  width  or
          precision  must  appear  before  the  args  (if  any)  to be
          converted.  If the precision argument is negative,  it  will
          be  changed  to  zero.   A  negative field width argument is
          taken as a - flag, followed by a positive field width.

          In  format  strings  containing  the  *digits$  form  of   a
          conversion  specification,  a  field  width or precision may
          also be indicated  by  the  sequence  *digits$,  giving  the
          position  in the argument list of an integer args containing
          the field width or precision.

          When numbered argument specifications are  used,  specifying
          the  Nth  argument  requires that all the leading arguments,
          from the first to the (N-1)th, be specified  in  the  format
          string.

          The flag characters and their meanings are:

          -    The result of the  conversion  will  be  left-justified
               within  the field.  (It will be right-justified if this
               flag is not specified.)

          +    The result of a signed  conversion  will  always  begin
               with  a sign (+ or -).  (It will begin with a sign only
               when a negative value is converted if this flag is  not
               specified.)

          space
               If the first character of a signed conversion is not  a
               sign,  a  space will be placed before the result.  This
               means that if the space and + flags  both  appear,  the
               space flag will be ignored.

          #    The value is to be converted to an alternate form.  For
               c,  d, i, s, and u conversions, the flag has no effect.
               For an o conversion,  it  increases  the  precision  to
               force  the first digit of the result to be a zero.  For
               x (or X) conversion, a non-zero result will have 0x (or
               0X)   prepended   to  it.   For  e,  E,  f,  g,  and  G
               conversions, the result will always contain a  decimal-
               point  character,  even  if  no digits follow the point
               (normally, a decimal point appears  in  the  result  of
               these  conversions  only if a digit follows it).  For g
               and G conversions, trailing zeros will not  be  removed
               from the result as they normally are.

          0    For d, i, o, u, x, X, e, E, f, g,  and  G  conversions,
               leading  zeros  (following  any  indication  of sign or
               base) are used to pad to  the  field  width;  no  space
               padding is performed.  If the 0 and  flags both appear,
               the 0 flag will be ignored.  For d, i, o, u, x,  and  X
               conversions,  if  a  precision is specified, the 0 flag
               will be ignored.  For other conversions,  the  behavior
               is undefined.

          Each conversion character results in fetching zero  or  more
          args.   The  results are undefined if there are insufficient
          args for the format.  If the format is exhausted while  args
          remain, the excess args are ignored.

          The conversion characters and their meanings are:

          d,i,o,u,x,X    The  integer  arg  is  converted  to   signed
                         decimal   (d  or  i),  (unsigned  octal  (o),
                         unsigned decimal (u), or unsigned hexadecimal
                         notation  (x  and  X).  The x conversion uses
                         the letters abcdef and the X conversion  uses
                         the  letters ABCDEF.  The precision specifies
                         the minimum number of digits to  appear.   If
                         the  value being converted can be represented
                         in fewer digits than the  specified  minimum,
                         it  will be expanded with leading zeros.  The
                         default  precision  is  1.   The  result   of
                         converting  a  zero value with a precision of
                         zero is no characters.

          f              The  double  args  is  converted  to  decimal
                         notation  in  the style [-]ddd.ddd, where the
                         number  of  digits  after  the  decimal-point
                         character [see setlocale(3C)] is equal to the
                         precision specification.  If the precision is
                         omitted  from  arg, six digits are output; if
                         the  precision is explicitly zero and  the  #
                         flag   is  not  specified,  no  decimal-point
                         character  appears.    If   a   decimal-point
                         character  appears,  at least 1 digit appears
                         before it.   The  value  is  rounded  to  the
                         appropriate number of digits.

          e,E            The double args is  converted  to  the  style
                         [-]d.ddde_dd, where there is one digit before
                         the decimal-point character  (which  is  non-
                         zero  if  the  argument  is non-zero) and the
                         number of digits after it  is  equal  to  the
                         precision.   When  the  precision is missing,
                         six digits are produced; if the precision  is
                         zero  and  the  #  flag  is not specified, no
                         decimal-point  character  appears.    The   E
                         conversion  character  will  produce a number
                         with E instead of e introducing the exponent.
                         The  exponent  always  contains  at least two
                         digits.   The  value  is   rounded   to   the
                         appropriate number of digits.

          g,G            The double args is printed in style  f  or  e
                         (or  in style E in the case of a G conversion
                         character), with the precision specifying the
                         number   of   significant   digits.   If  the
                         precision is zero, it is taken as  one.   The
                         style  used  depends  on the value converted:
                         style e (or E)  will  be  used  only  if  the
                         exponent  resulting  from  the  conversion is
                         less than -4 or greater than or equal to  the
                         precision.   Trailing  zeros are removed from
                         the  fractional  part  of  the   result.    A
                         decimal-point character appears only if it is
                         followed by a digit.

          c              The int args  is  converted  to  an  unsigned
                         char, and the resulting character is printed.

          s              The args is taken to be a  string  (character
                         pointer)  and  characters from the string are
                         written  up  to   (but   not   including)   a
                         terminating  null character; if the precision
                         is  specified,  no  more   than   that   many
                         characters  are written.  If the precision is
                         not specified, it is taken to be infinite, so
                         all characters up to the first null character
                         are printed.  A  NULL  value  for  args  will
                         yield undefined results.

          p              The args should be a pointer  to  void.   The
                         value  of  the  pointer  is  converted  to an
                         implementation-defined set  of  sequences  of
                         printable  characters,  which  should  be the
                         same as the set of sequences that are matched
                         by the %p conversion of the scanf function.

          n              The  argument  should  be  a  pointer  to  an
                         integer  into  which is written the number of
                         characters written to the output standard I/O
                         stream   so  far  by  this  call  to  printf,
                         fprintf,  or   sprintf.    No   argument   is
                         converted.

          %              Print a %; no argument is converted.

          If the character after the % or %digits$ sequence is  not  a
          valid  conversion  character,  the results of the conversion
          are undefined.

          If a floating-point value is the internal representation for
          infinity,  the  output is [_]inf, where inf is either inf or
          INF, depending on the conversion character.  Printing of the
          sign follows the rules described above.

          If a floating-point value is the internal representation for
          ``not-a-number,'' the output is [_]nan0xm.  Depending on the
          conversion  character,   nan   is   either   nan   or   NAN.
          Additionally,  0xm  represents  the most significant part of
          the mantissa.  Again depending on the conversion  character,
          x  will  be  x  or  X,  and m will use the letters abcdef or
          ABCDEF.  Printing of the sign follows  the  rules  described
          above.

          In no case does a non-existent or small  field  width  cause
          truncation  of  a  field;  if  the result of a conversion is
          wider than the field width, the field is simply expanded  to
          contain  the  conversion  result.   Characters  generated by
          printf and fprintf are printed as if the  putc  routine  had
          been called.

          The printf() family of functions works in "round-to-nearest"
          mode.  In this rounding mode the representable value nearest
          to the infinitely precise result is delivered.  If  the  two
          nearest  representable values are equally near, the one with
          its least significatn bit zero is delivered.

     EXAMPLE
          To print a date and time in the form Sunday, July 3,  10:02,
          where  weekday  and  month  are  pointers to null-terminated
          strings:

               printf("%s, %s %i, %d:%.2d",
                       weekday, month, day, hour, min);

          To print n to 5 decimal places:

               printf("pi = %.5f", 4 * atan(1.0));

     SEE ALSO
          exit(2), lseek(2), write(2), abort(3C), ecvt(3C),  putc(3S),
          scanf(3S), setlocale(3C), stdio(3S).

     DIAGNOSTICS
          printf, fprintf, and sprintf return the number of characters
          transmitted,  or  return  a  negative  value if an error was
          encountered.

******************/
