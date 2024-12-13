
/*
  plot() is a constructor that produces the Plot object

  The Plot object contains all information regarding the data
  and presentation of a x-y plot in all quadrants.  The user
  sets either properties or calls methods both to perform subroutines
  or functions and possibly get and set properties of the object.
  The user adds or removes one or more x-y datasets to the Plot object,
  and then designates that the plot be rendered/updated.  The user
  has the b
  
  plot() has only one argument 'plotType' which is either a
  defined constant or string
  which indicates the type of x-y plot to be constructed.   In this
  initial version of plot.js, only one type is available for the time
  being, ASCII (as a defined constant) or "ascii" as a string.
  In the future VML and SVG vector language constructs will be made
  available.

  The ASCII (as defined constant) or "ascii" (as string) specifies
  a plot that will be constructed entirely of ASCII characters.
  The x- and y-axis lines will be hyphen and vertical line
  characters, respectively, and the plot origin will be '+' character.
  In addition, these characters will be used to mark the scale of these
  axes.  Labeling of the axes will be possible, with all style
  features (font family and size) possible.  However the plot will
  itself will be composed of monospace characters (typewriter font).
  Except for the period and plus characters ('.' and '+')
  all possible characters can be used to designate plotted points.
  The period and plus characters are reserved for plotting lines.
  In general, the number of plotted lines on an ASCII type plot should
  be kept to a minimum since it makes this plot too busy and risks
  a loss of interpretability.  When more than 2 lines are plotted,
  a legend can be affixed and the begining or end of the line labeled
  with perhaps a capital letter or string of text to indicate
  what the line is.   The ASCII line plot and form controls that
  allow interactive changes in data, style, and appearance of the plot
  are returned in a DIV element either given a default 'id' attribute
  or one designated by the user.
*/


/* in doing major or minor divsions on the scale, there are two ways to
  do it:
   (1) the majordiv and minordiv specify how many parts to chop up the
	  scale:  for example, a major div of 10 says to chop up the scale
	  into 10 equal parts from the min to max of scale, and minordiv
	  of 2 says to chop up the divisions between major divisions into 2.
	 (2) absolute differences:  if majordiv is now set to 10, then
	 from the min to max, 10 will be added to min and a major div mark
	 placed, and this continues up to max.  If minordiv is 2, then starting
	 at each major division, 2 will be added to the next major div.

    set the parameter 'isdiff' to false (the default) if option (1) is
	 used, and set 'isdiff' to true to get option (2).  Note that
	 for option (1), if majordiv is <= 0, no major division will be
	 marked.  If minordiv is <= 0, no minor division will be marked
	 if minordiv is > 0 but majordiv <= 0, no minor division will be marked
	 (i.e., a major div must exist to create a minor division).  Also
	 for option (2), if minordiv > majordiv, no minordiv will be marked,
	 and if majordiv > the difference of the scales max and min, no majordiv
	 will be marked.  In addition, no major div markings can be made
	 which are < 2% of the difference between max and min, and no
	 minor div markings can be made which are < 10% of the difference
	 between major divisions */
	 
var ASCII = 10;

// Plot Options


// Dataset Options
var POINTS = 1,
    FUNCTION = 2;

var currentDatasetID = 1;

function plot(plotType)
{
	if (plotType != ASCII || (typeof(plotType) == "string" &&
						(plotType = plotType.toLowerCase()) != "ascii"))
		return (null);
	this.type = plotType == "ascii" ? ASCII : plotType;

	this.addDataset = function (Xdata, Ydata) {
		if ((dataset = new plotDataset(Xdata, Ydata)) == null)
			return (null);
		this.datasets.push(dataset);
	};
	this.removeDataset = function (datasetID) {
		for (i = 0; i < this.datasets.length; i++)
			if (this.datasets[i].id == datasetID)
			{
				delete this.datasets[i];
				return (0);
			}
		return (-1);
	};
	this.setPlotOptions = function (option, optionVal) {
	};
	this.render = plotRender(this);
	this.setXlabel = function (text) {
		if (typeof(text) == "undefined" || text.toString().length == 0)
			return (-1);
		if (typeof(text) != "string")
			text = String(text);
		this.Xlabel = text;
		return (0);
	};
	this.setYlabel = function (text) {
		if (typeof(text) == "undefined" || text.toString().length == 0)
			return (-1);
		if (typeof(text) != "string")
			text = String(text);
		this.Ylabel = text;
		return (0);
	};
	this.setXscale = function (min, max, majordiv, minordiv, isdiff) {
		this.Xmin = min ? min : this.Xmin;
		this.Xmax = max ? max : this.Xmax;
		this.Xmajor = majordiv ? majordiv : this.Xmajor;
		this.Xminor = minordiv ? minordiv : this.Xminor;
		this.Xisdiff = isdiff ? isdiff : this.Xisdiff;
	};
	this.setYscale = function (min, max, majordiv, minordiv, isdiff) {
		this.Ymin = min ? min : this.Ymin;
		this.Ymax = max ? max : this.Ymax;
		this.Ymajor = majordiv ? majordiv : this.Ymajor;
		this.Yminor = minordiv ? minordiv : this.Yminor;
		this.Yisdiff = isdiff ? isdiff : this.Yisdiff;
	};
	this.setDatasetOptions = function (type. pointsmarker, func, lolim, hilim) {
		/* type can be POINTS or FUNCTION
			pointsmarker can be any character except '.' and '+'
			if there is more than one line (the one or other is allowed) */
	};
	this.datasets = new Array(0);
	this.width = this.height = -1; // -1 means auto width and height
	this.Xlabel = "X";  // default labels
	this.Ylabel = "Y";
	this.Xmax = this.Xmin = this.Xmajor = this.Xminor =
		this.Ymax = this.Ymin = this.Ymajor = this.Yminor = Number.NaN; // auto
	this.Xisdiff = this.Yisdiff = false;
	return (this);
}

// a constructor for a plot Dataset
function plotDataset(Xdata, Ydata)
{
	var i;
	if (typeof(Xdata) != "object" || typeof(Ydata) != "object" ||
				Xdata.length != Ydata.length)
		return (null);
	for (i = 0; i < Xdata.length; i++)
		if (typeof(Xdata[i] != "number")
			Xdata[i] = Number(XData[i]);
		if (typeof(Ydata[i] != "number")
			Ydata[i] = Number(YData[i]);
	this.Xdata = Xdata;
	this.Ydata = Ydata;
	this.type = POINTS_AND_LINE;
	this.pointsmarker = '#';
	this.lolim = this.hilim = Number.NaN;  // automatically show all points
	this.id = currentDatasetID++;
	return (this);
}

function plotRender(plotObj)
{

}

/*
Plot rendering notes:

1. get the character counts for width and height of whole plot
2. determine the rectangle viewport:
    look at each dataset and determine what the low and high values of
	 the X and Y data in each set, and thus the low and high values
	 of X and Y for all datasets
3. set the low and high of the X and Y axes
4. determine the major divisions of axes
  (a) check isdiff option: if false, then if majdiv is set by user
      it must not be more than 50 (otherwise set 50)
		  if minordiv is set by user, it must not be more than 10 (otherwise re-set)
  (b) if isdiff is true, the calculate count of major divs (if > 50,
       reset to 50; calculate count of minor divs (if > 10, reset to 10).
5. Create array of the values marking the major and minor divs for
   both axes
6. Determine the coordinate origin as a transformation from the
   origin (lower left corner) of the rectangular viewport.
	Determine the scale factor of the coordinate system against the
	height and width of the rectangular viewport.
7. Draw the axes and division markings with their characters
8. Plot all datasets  When plotting, move from low to high along
   the domain (X axis), moving one character at a time, determining:
	  (a) the character position and what value it has on the domain,
	    including the midpoint between each character, representing
		 whether the character position includes
     (a) the Y for each dataset that is a LINE with its function
	  and within the low and high limit of the domain, and whether
	  it marks inside the viewport
	  (b) if a plot point
*/
