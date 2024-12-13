

const		BITS_PER_PIXEL				=	4,
			IMAGE_SEPARATOR_CHAR		=	0x2c,  /* the comma ',' */
			GIF_TERMINATOR				=	0x3b, /* the semicolon ';' */
			IMAGE_DATA_BLOCK_SIZE	=	255,

/* angle types */
			ANGLE_RADIANS				=	1,
			ANGLE_DEGREES				=	2,

/* marker symbol types */
			TOTAL_POSSIBLE_SERIES	= 10,   /* should equal number of markers */
			SOLID_CIRCLE				=  0,
			SOLID_SQUARE				=  1,
			SOLID_TRIANGLE				=  2,
			SOLID_DIAMOND				=  3,
			PLUS_SIGN					=  4,
			OPEN_CIRCLE					=  5,
			OPEN_SQUARE					=  6,
			OPEN_TRIANGLE				=  7,
			OPEN_DIAMOND				=  8,
			DIAGONAL_CROSS				=  9,

			DEFAULT_MARKER				= 255,

			LINES_CONNECTED			= 100,
			LINES_NOT_CONNECTED		= 101

/* abscissa styles */
   TICK_CENTERED_NO_ANGLE         1
   HEAD_CENTERED_ANGLED_TAIL      2
   TAIL_CENTERED_ANGLED_HEAD      3  /* default */
   AUTO_STYLER                    4

  CHART_BACKGROUND_COLOR          WHITE
  CHARTLINES                      RED


	MIN_GRIDLINE_SPACE_PIXEL_HEIGHT         25
	DEFAULT_MARKER_SPACING_PIXEL_WIDTH      20
	MIN_TOP_AREA_PIXEL_HEIGHT               20
  AXIS_TICK_MARK_PIXEL_LENGTH              7
  BORDER_PADDING                           6
  PLOT_PADDING                             4
  TICK_MARK_TO_LABEL_PADDING               5
  LABEL_TO_AXIS_NAME_PADDING               6



/* options to option arg on set_proportioned_font() */
  TITLE          1
  AXIS_TEXT      2
  LABEL          3

/* font types for setting and using fonts */
  FONT_SET_INDEX_MAX	512
  FIRST_FONT_SET       0
  LAST_FONT_SET       15
  FNT_5x8              0
	FNT_6x9              1
	FNT_6x10             2
	FNT_6x12             3
	FNT_6x13             4
  FNT_6x13B            5
	FNT_7x13             6
	FNT_7x13B            7
	FNT_7x14             8
	FNT_8x13             9
	FNT_8x13B           10
	FNT_8x16            11
	FNT_9x15            12
  FNT_9x15B           13
  FNT_10x20           14
	FNT_12x24           15
  FNT_MARKERS_7x9     16
  FNT_MARKERS_9x12    17

struct fontprop {
	int       fontid;
	int       width;
	int       height;
	int       leading;
	void     *rdefs;
};

  PIXELS_ON   0
  PIXELS_OFF  1
  OFFSET      2

struct indexed_bitmap_info {
	int              bpp;
	int              height;
	int              width;
	int              x_point;
	int              y_point;
	int              fore_color_index;
	int              back_color_index;
   int              dash[3];
	struct fontprop  font;
	void            *grid;
	void            *color_map;
};



/******** QC descriptor file-related structures *********/
struct pointdesc {
	char              series;
	char              abscissa_posn;
	double            value;
	double            mean;
	double            sd;
	struct pointdesc *next;
};


struct LJplotdesc {
	char               *title;
	int                 series_count;        /* number of series */
	char                series_style[TOTAL_POSSIBLE_SERIES][2];
	                    /* Note the TOTAL_POSSIBLE_SERIES is based
						  on the number of marker symbols there are
						  the 2nd dimension is [0]=symbol marker to use
						                       [1]=line style */
	int                 abscissa_points;   /* number of abscissa points */
	char              **abscissa_text;	   /* text used on abscissa */
   short              *abscissa_size;     /* length of string */
   unsigned short      abscissa_style : 2;    /* see styles */
   unsigned short      abscissa_angle : 8;
   unsigned short      date_format: 2;
   unsigned short      angle_set : 1;
   int                 abscissa_ptlim;  /* number of points allocated */
	struct pointdesc   *points;	/* this is a singly linked list,
      NOT AN ARRAY! de-allocate accordingly.  Description of each point:
	  NOTE:  the description of each point is not sorted and is at random.
	      In general, you should start at the start of the list,
		  read in each points data, and use it to plot your point;
		  don't depend on a certain order */
};


/******** GIF-related structures *********/

   BITS         12

struct image_descriptor {
	short     left_start;
	short     top_start;
	short     width;          /* note that size and position of image */
	short     height;         /* must be with parameters of screen descriptor */
	char      use_local_map;
    char     is_interlaced;
	char      bits_per_pixel;
	char      code_size;
	void     *raster_data;
};

struct gif_image {
	struct screen_descriptor  sd;
	int                       defined_colors;
	char                     *global_color_map; /* should be r1g1b1r2g2b2...*/
	int    image_count;
	struct image_descriptor  *id;   /* can be more than one image defined */
};

  get_current_font_height(z)   z.font.height
  get_current_font_width(z)   z.font.width


function qc2bitmap(inputData, outputData)
{
	void *plotinfo;
	char buf[PATH_MAX], *ptr;
	unsigned char *uptr;
	int i, j, plottype, fontid,
			y_axis_height, x_axis_width, xtickpos, ytickpos,
			bmwidth, bmheight, x_axis_pixel_space,
			gridline_pixel_spacing,
			y_axis_textarea_pixel_width, x_axis_textarea_pixel_height,
			fnthgt, fntwdt, marker_spacing_pixel_width,
			right_area_pixel_width, top_area_pixel_height,
			maxsize, xpos, ypos, zero_y, lypos, lxpos, upper_ylimit, lower_ylimit,
			upper_xlimit, lower_xlimit, x_axis_marks, len;
	struct lld line_data[40];
	unsigned char *bmgrid, *color_map;
	char square3x3[] = { 1,1,1,1,0,1,1,1,1 };
	time_t tm;
	float Z;
	struct LJplotdesc *LJ;
	struct fontprop label_font, axis_text_font, title_font;
	struct Youdenplotdesc *Youden;
	struct indexed_bitmap_info *bmpinfo;
	struct gif_image *gi;
	struct pointdesc *plot_point;
/*
#ifdef USER_MODE
	struct stat finfo;
#endif

#ifdef MSS
	MSS_ENTER_SCOPE;
#endif
#ifdef DEBUG
	if ((ptr = strchr(infname, '.')) != NULL)
	{
		memcpy(buf, infname, ptr - infname);
		buf[ptr - infname] = '\0';
	}
	else
		strcpy(buf, infname);
	strcat(buf, ".log");
	if ((log_f = fopen(buf, "w")) == NULL)
	{
#ifdef USER_MODE
		fprintf(stderr, "\n\nfailure to open debug log file `%s'\nError=%s",
					buf, strerror(errno));
#endif
		return (-1);
	}
#endif */

	if ((plotDescription = readPlotDescription(inputData, TYPE_FILENAME)) != 0)
	{
		// error reading in the data format for plot
		return (-1);
	}
	if ((bmpinfo = new indexedBitmapInfo) == null)
	{
		Error("Memory allocation failure for bitmap record");
		return (-1);
	}
	// probably should go in a constructor
	bmpinfo.bpp = 8;
	bmpinfo.back_color_index = WHITE;
	bmpinfo.fore_color_index = CHARTLINES;
	// set some defaults
	y_axis_height = x_axis_width = y_axis_textarea_pixel_width =
			x_axis_textarea_pixel_height = marker_spacing_pixel_width =
			top_area_pixel_height = x_axis_marks = x_axis_pixel_space = 0;
	right_area_pixel_width = BORDER_PADDING + 8 + PLOT_PADDING;

	plot = null;

//	Youden = NULL;
//	LJ = NULL;
	if (plotDescription.type == IS_LJ)
	{
/*
#ifdef USER_MODE
		printf("\nLevey-Jennings plot description found");
#endif
		 this section sets the general areas of the LJ bitmap by calculating
		   dimensions for each area of the chart based on label lengths
		   and fonts and the number of points */
		LJ = plotDescription.info;
		if (LJ.abscissa_points >= 40)
			LJ.abscissa_points = 39;
		if (MIN_LJ_POINTS_TO_SHOW > 0 && LJ.abscissa_points < MIN_LJ_POINTS_TO_SHOW)
			x_axis_marks = MIN_LJ_POINTS_TO_SHOW;
		else
			x_axis_marks = LJ.abscissa_points;
		/* formatting each text line of the abscissa */
		maxsize = 0;
		for (i = 0; i < LJ.abscissa_points; i++)
			if (LJ.abscissa_text[i])
			{
				line_data[LJ_ABSCISSA_LABEL + i].label = LJ.abscissa_text[i];
				line_data[LJ_ABSCISSA_LABEL + i].line_count = 4;
				line_data[LJ_ABSCISSA_LABEL + i].line_pixlen[0] = LJ_ABSCISSA_TEXT_LINE_1_FONT;
				line_data[LJ_ABSCISSA_LABEL + i].line_pixlen[1] = LJ_ABSCISSA_TEXT_LINE_2_FONT;
				line_data[LJ_ABSCISSA_LABEL + i].line_pixlen[2] =
						line_data[LJ_ABSCISSA_LABEL + i].line_pixlen[3] =
						LJ_ABSCISSA_TEXT_LINE_3_FONT;
				do_label_line_conversion(&line_data[LJ_ABSCISSA_LABEL + i]);
				maxsize = (maxsize > line_data[LJ_ABSCISSA_LABEL + i].max_pix_width) ?
						maxsize : line_data[LJ_ABSCISSA_LABEL + i].max_pix_width;
			}
		marker_spacing_pixel_width =
				(maxsize > DEFAULT_MARKER_SPACING_PIXEL_WIDTH) ?
				maxsize : DEFAULT_MARKER_SPACING_PIXEL_WIDTH;
		/* title data */
		line_data[LJ_TITLE_LABEL].label = LJ.title;
		line_data[LJ_TITLE_LABEL].line_count = 3;
		line_data[LJ_TITLE_LABEL].line_pixlen[0] = LJ_TITLE_TEXT_LINE_1_FONT;
		line_data[LJ_TITLE_LABEL].line_pixlen[1] = LJ_TITLE_TEXT_LINE_2_FONT;
		line_data[LJ_TITLE_LABEL].line_pixlen[2] = LJ_TITLE_TEXT_LINE_3_FONT;
		do_label_line_conversion(&line_data[LJ_TITLE_LABEL]);
		top_area_pixel_height = line_data[LJ_TITLE_LABEL].max_pix_height * 4 / 3;
		label_font.fontid = LJ_AXIS_TICK_LABEL_FONT;
		get_font_properties(&label_font);
		gridline_pixel_spacing = label_font.height * 2;
		if (marker_spacing_pixel_width < gridline_pixel_spacing * 4 / 3)
			marker_spacing_pixel_width = gridline_pixel_spacing * 4 / 3;
		y_axis_height = LJ_DEVIATIONS_PLOTTED * 2 * gridline_pixel_spacing;
		if ((maxsize = ((line_data[LJ_TITLE_LABEL].max_pix_width * 4) / 3)) >
					x_axis_width)
		{
			x_axis_width = maxsize;
			x_axis_marks = (x_axis_width - 2 * x_axis_pixel_space) /
						marker_spacing_pixel_width + 1;
		}
		x_axis_pixel_space = marker_spacing_pixel_width / 2;
		x_axis_width = (x_axis_marks - 1) * marker_spacing_pixel_width +
						2 * x_axis_pixel_space;
		y_axis_textarea_pixel_width = AXIS_TICK_MARK_PIXEL_LENGTH / 2 +
				BORDER_PADDING + label_font.width * 2 +
				TICK_MARK_TO_LABEL_PADDING;
		x_axis_textarea_pixel_height = AXIS_TICK_MARK_PIXEL_LENGTH / 2 +
				line_data[LJ_ABSCISSA_LABEL].max_pix_height +
				BORDER_PADDING;
	}
/*
	else if (plottype == IS_YOUDEN)
	{
#ifdef USER_MODE
		printf("\nYouden plot description found");
#endif
		Youden = plotinfo;
		if (Youden.size < MIN_YOUDEN_AXIS_LENGTH)
			Youden.size = MIN_YOUDEN_AXIS_LENGTH;
		else if (Youden.size > MAX_YOUDEN_AXIS_LENGTH)
			Youden.size = MAX_YOUDEN_AXIS_LENGTH;
		x_axis_width = y_axis_height = Youden.size;
		gridline_pixel_spacing = Youden.size / 6;
		set_proportioned_font(Youden.size, &label_font, LABEL);
		set_proportioned_font(Youden.size, &axis_text_font, AXIS_TEXT);
		set_proportioned_font(Youden.size, &title_font, TITLE);
		fontid = title_font.fontid;
		line_data[YOUDEN_TITLE_LABEL].label = Youden.title;
		line_data[YOUDEN_TITLE_LABEL].line_count = 3;
		line_data[YOUDEN_TITLE_LABEL].line_pixlen[0] = fontid;
		if (fontid > 1)
			fontid--;
		line_data[YOUDEN_TITLE_LABEL].line_pixlen[1] = fontid;
		if (fontid > 1)
			fontid--;
		line_data[YOUDEN_TITLE_LABEL].line_pixlen[2] = fontid;
		do_label_line_conversion(&line_data[YOUDEN_TITLE_LABEL]);
		top_area_pixel_height = line_data[YOUDEN_TITLE_LABEL].max_pix_height * 4 / 3;
		if (top_area_pixel_height < MIN_TOP_AREA_PIXEL_HEIGHT)
			top_area_pixel_height = MIN_TOP_AREA_PIXEL_HEIGHT;
		if (Youden.x_axis_label == NULL)
			Youden.x_axis_label = DEFAULT_YOUDEN_X_AXIS_LABEL;
		fontid = axis_text_font.fontid;
		line_data[YOUDEN_X_AXIS_LABEL].label = Youden.x_axis_label;
		line_data[YOUDEN_X_AXIS_LABEL].line_count = 3;
		line_data[YOUDEN_X_AXIS_LABEL].line_pixlen[0] = fontid;
		if (fontid > 1)
			fontid--;
		line_data[YOUDEN_X_AXIS_LABEL].line_pixlen[1] = fontid;
		if (fontid > 1)
			fontid--;
		line_data[YOUDEN_X_AXIS_LABEL].line_pixlen[2] = fontid;
		do_label_line_conversion(&line_data[YOUDEN_X_AXIS_LABEL]);
		x_axis_textarea_pixel_height =
				AXIS_TICK_MARK_PIXEL_LENGTH / 2 + // half tick mark len
				TICK_MARK_TO_LABEL_PADDING + // spacing between tick and label
				label_font.height + /* label font height
				LABEL_TO_AXIS_NAME_PADDING + // spacing between label and title
				line_data[YOUDEN_X_AXIS_LABEL].max_pix_height + // all pixels of name
				BORDER_PADDING;
		if (Youden.y_axis_label == NULL)
			Youden.y_axis_label = DEFAULT_YOUDEN_Y_AXIS_LABEL;
		fontid = axis_text_font.fontid;
		line_data[YOUDEN_Y_AXIS_LABEL].label = Youden.y_axis_label;
		line_data[YOUDEN_Y_AXIS_LABEL].line_count = 3;
		line_data[YOUDEN_Y_AXIS_LABEL].line_pixlen[0] = fontid;
		if (fontid > 1)
			fontid--;
		line_data[YOUDEN_Y_AXIS_LABEL].line_pixlen[1] = fontid;
		if (fontid > 1)
			fontid--;
		line_data[YOUDEN_Y_AXIS_LABEL].line_pixlen[2] = fontid;
		do_label_line_conversion(&line_data[YOUDEN_Y_AXIS_LABEL]);
		y_axis_textarea_pixel_width =
				AXIS_TICK_MARK_PIXEL_LENGTH / 2 + // half tick mark len
				TICK_MARK_TO_LABEL_PADDING + // spacing between tick and label
				label_font.width * 2 + // label font width
				LABEL_TO_AXIS_NAME_PADDING + // spacing between label and title
				line_data[YOUDEN_Y_AXIS_LABEL].max_pix_height + // all pixels of name
				BORDER_PADDING; // space between border and start of axis label
	} */
	else
		return (-1);
	bmpinfo.width = bmwidth = x_axis_width + y_axis_textarea_pixel_width
				+ right_area_pixel_width;
	bmpinfo.height = bmheight = top_area_pixel_height + y_axis_height +
					x_axis_textarea_pixel_height;
	if ((bmpinfo.grid = bmgrid = new Grid(bmwidth * bmheight)) == null)
	{
		Error("Memory allocation failure for primary bitmap");
		return (-1);
	}
	memset(bmgrid, CHART_BACKGROUND_COLOR, bmwidth * bmheight);
		/* fill in the global color map */
	if ((bmpinfo.color_map = color_map =
				calloc((1 << BITS_PER_PIXEL) * 3, sizeof(char))) == NULL)
	{
		Error("Memory allocation failure for color map");
		return (-1);
	}
	memset(color_map, 0, (1 << BITS_PER_PIXEL) * 3 * sizeof(char));
	memcpy(color_map, global_colors, 15 * 3);

	if (plotDescription.type == IS_LJ)
	{
/*
#ifdef DEBUG
		print_LJ_record(LJ, log_f);
#endif */
		lower_ylimit = x_axis_textarea_pixel_height;
		zero_y = lower_ylimit + 4 *	gridline_pixel_spacing;
		upper_ylimit = lower_ylimit + y_axis_height;
		lower_xlimit = y_axis_textarea_pixel_width;
		upper_xlimit = lower_xlimit + x_axis_width;
		/******** now let's use data from the qc file ******/
		set_font(bmpinfo, FNT_MARKERS_7x9);
		fnthgt = get_current_font_height(bmpinfo);
		fntwdt = get_current_font_width(bmpinfo);
		/* first paint any connecting lines */
		for (plot_point = LJ.points; plot_point != NULL; plot_point = plot_point.next)
		{
			i = plot_point.series;
			j = plot_point.abscissa_posn;
			if (LJ.series_style[i - 1][1] != LINES_CONNECTED)
			  	continue;
			Z = (plot_point.value - plot_point.mean) / plot_point.sd;
			ypos = zero_y + (Z * gridline_pixel_spacing) - fnthgt / 2;
			xpos = y_axis_textarea_pixel_width + x_axis_pixel_space +
							(j - 1) * marker_spacing_pixel_width - fntwdt / 2;
			if (j > 1)
			{
				if (Z >= -4.0 || Z <= 4.0)
					line(lxpos, lypos, xpos + fntwdt / 2, ypos + fnthgt / 2, bmpinfo);
				/* cannot draw marker but do draw clipped lines lines */
				else
					clip_line(upper_ylimit, lower_xlimit, lower_ylimit,
						  upper_xlimit, &lxpos, &lypos, &xpos, &ypos);
			}
			lxpos = xpos + fntwdt / 2;
			lypos = ypos + fnthgt / 2;
		}
		for (plot_point = LJ.points; plot_point != NULL; plot_point = plot_point.next)
		{
			i = plot_point.series;
			j = plot_point.abscissa_posn;
			Z = (plot_point.value - plot_point.mean) / plot_point.sd;
			ypos = zero_y + (Z * gridline_pixel_spacing) - fnthgt / 2;
			xpos = y_axis_textarea_pixel_width + x_axis_pixel_space +
							(j - 1) * marker_spacing_pixel_width - fntwdt / 2;
			if (Z >= -4.0 || Z <= 4.0)
			{
				moveto(bmpinfo, xpos, ypos);
				paint_glyph(LJ.series_style[i - 1][0], bmpinfo, 0);
			}
		}
		/********* paint the plot lines, axes, axis text, etc *******/
		rectangle(y_axis_textarea_pixel_width,
					bmheight - top_area_pixel_height,
					bmwidth - right_area_pixel_width,
					x_axis_textarea_pixel_height, bmpinfo);
		/* paint the horizontal lines */
		for (i = 0, ypos = lower_ylimit; i < 9; i++, ypos += gridline_pixel_spacing)
		{
			if (i > 1 && i < 7 && i != 4)
				set_dash(bmpinfo, 4, 2, 0);
			else
				set_dash(bmpinfo, 0, 0, 0);
			line(y_axis_textarea_pixel_width, ypos,
				 bmwidth - right_area_pixel_width, ypos, bmpinfo);
		}
		/* paint the x-axis tick marks */
		for (i = 0, xpos = y_axis_textarea_pixel_width + x_axis_pixel_space;
					i < x_axis_marks; i++, xpos += marker_spacing_pixel_width)
			line(xpos, x_axis_textarea_pixel_height -
					AXIS_TICK_MARK_PIXEL_LENGTH / 2, xpos,
					x_axis_textarea_pixel_height +
					AXIS_TICK_MARK_PIXEL_LENGTH / 2, bmpinfo);
		/* paint the y-axis labels : "+3", "+2", ... */
		set_font(bmpinfo, LJ_AXIS_TICK_LABEL_FONT);
		fnthgt = get_current_font_height(bmpinfo);
		fntwdt = get_current_font_width(bmpinfo);
		for (i = 3; i >= -3; i--)
		{
			xpos = y_axis_textarea_pixel_width -
							(TICK_MARK_TO_LABEL_PADDING +
							AXIS_TICK_MARK_PIXEL_LENGTH / 2 + fntwdt);
			if (i != 0)
				xpos -= fntwdt;
			ypos = x_axis_textarea_pixel_height + (i + 4) *
								gridline_pixel_spacing - fnthgt / 2;
			moveto(bmpinfo, xpos, ypos);
			if (i > 0)
				paint_glyph('+', bmpinfo, 0);
			else if (i < 0)
				paint_glyph('-', bmpinfo, 0);
			paint_glyph('0' + abs(i), bmpinfo, 0);
		}
		/*******************************************************/
		set_font(bmpinfo, FNT_5x8);
		fnthgt = get_current_font_height(bmpinfo);
		fntwdt = get_current_font_width(bmpinfo);
		tm = time(NULL);
		strftime(buf + 70, 9, "%Y", gmtime(&tm));
		sprintf(buf, "Duzen Labs/Halloran \251 %s", buf + 70);
		moveto(bmpinfo, bmpinfo.width - BORDER_PADDING,
					(bmpinfo.height - strlen(buf) * fntwdt) / 2);
		for (uptr = buf; *uptr != '\0'; uptr++)
			paint_angled_glyph(*uptr, bmpinfo, 0, 90.0, ANGLE_DEGREES);
		/*******************************************************
		   Writing abscissa text
		 *******************************************************/
		set_font(bmpinfo, LJ_ABSCISSA_TEXT_LINE_1_FONT);
		fnthgt = get_current_font_height(bmpinfo);
		fntwdt = get_current_font_width(bmpinfo);
		xtickpos = y_axis_textarea_pixel_width + x_axis_pixel_space;
		ytickpos = x_axis_textarea_pixel_height -
					      (fnthgt / 3 + AXIS_TICK_MARK_PIXEL_LENGTH / 2);
		for (i = 0; i < LJ.abscissa_points; i++)
		{
			/* convert backslashed characters */
			xpos = xtickpos;
			ypos = ytickpos;
			ptr = line_data[LJ_ABSCISSA_LABEL + i].label;
			for (j = 0; j < line_data[LJ_ABSCISSA_LABEL + i].line_count; j++)
			{
				fnthgt = get_current_font_height(bmpinfo);
				fntwdt = get_current_font_width(bmpinfo);
				if (j == 0)
					xpos -= (line_data[LJ_ABSCISSA_LABEL + i].line_len[j] * fntwdt) / 2;
				ypos -=	fnthgt;
				moveto(bmpinfo, xpos, ypos);
				while (*ptr != '\0')
					paint_glyph(*ptr++, bmpinfo, 0);
				ptr++;
				if (j == 0)
					set_font(bmpinfo, LJ_ABSCISSA_TEXT_LINE_2_FONT);
				else if (j == 1)
					set_font(bmpinfo, LJ_ABSCISSA_TEXT_LINE_3_FONT);
			}
			set_font(bmpinfo, LJ_ABSCISSA_TEXT_LINE_1_FONT);
			xtickpos += marker_spacing_pixel_width;
			/* Not working yet
			switch (LJ.abscissa_style)
			{
			case AUTO_STYLER:
			case HEAD_CENTERED_ANGLED_TAIL:
			case TAIL_CENTERED_ANGLED_HEAD:
			default:
         case TICK_CENTERED_NO_ANGLE:
         	break; */
		}
		/* Now insert the title */
		set_font(bmpinfo, LJ_TITLE_TEXT_LINE_1_FONT);
		fnthgt = get_current_font_height(bmpinfo);
		fntwdt = get_current_font_width(bmpinfo);
		ypos = x_axis_textarea_pixel_height + y_axis_height +
							 line_data[LJ_TITLE_LABEL].max_pix_height * 7 / 6;
		ptr = line_data[LJ_TITLE_LABEL].label;
		for (j = 0; j < line_data[LJ_TITLE_LABEL].line_count; j++)
		{
			xpos = y_axis_textarea_pixel_width + (x_axis_width / 2) -
						(line_data[LJ_TITLE_LABEL].line_len[j] * fntwdt) / 2;
			ypos -= fnthgt;
			moveto(bmpinfo, xpos, ypos);
			while (*ptr != '\0')
				paint_glyph(*ptr++, bmpinfo, 0);
			if (j == 0)
				set_font(bmpinfo, LJ_TITLE_TEXT_LINE_2_FONT);
			else if (j == 1)
				set_font(bmpinfo, LJ_TITLE_TEXT_LINE_3_FONT);
			fnthgt = get_current_font_height(bmpinfo);
			fntwdt = get_current_font_width(bmpinfo);
			ptr++;
		}
		free_LJ(LJ);
	}
	else if (plottype == IS_YOUDEN)
	{
#ifdef DEBUG
		print_Youden_record(Youden, log_f);
#endif
		/********************/
		line(y_axis_textarea_pixel_width,
				x_axis_textarea_pixel_height + y_axis_height,
				y_axis_textarea_pixel_width,
				x_axis_textarea_pixel_height, bmpinfo);
		line(y_axis_textarea_pixel_width,
				x_axis_textarea_pixel_height,
				y_axis_textarea_pixel_width + x_axis_width,
				x_axis_textarea_pixel_height, bmpinfo);
		line(y_axis_textarea_pixel_width,
				x_axis_textarea_pixel_height,
				y_axis_textarea_pixel_width + x_axis_width,
				x_axis_textarea_pixel_height, bmpinfo);
		line(y_axis_textarea_pixel_width,
				x_axis_textarea_pixel_height,
				y_axis_textarea_pixel_width + x_axis_width,
				x_axis_textarea_pixel_height, bmpinfo);
		line(y_axis_textarea_pixel_width,
				x_axis_textarea_pixel_height + y_axis_height / 2,
				y_axis_textarea_pixel_width + x_axis_width,
				x_axis_textarea_pixel_height + y_axis_height / 2,
				bmpinfo);
		line(y_axis_textarea_pixel_width + x_axis_width / 2,
				x_axis_textarea_pixel_height,
				y_axis_textarea_pixel_width + x_axis_width / 2,
				x_axis_textarea_pixel_height + y_axis_height, bmpinfo);
		circle(y_axis_textarea_pixel_width + x_axis_width / 2,
				x_axis_textarea_pixel_height + y_axis_height / 2,
				y_axis_height / 6, bmpinfo);
		circle(y_axis_textarea_pixel_width + x_axis_width / 2,
				x_axis_textarea_pixel_height + y_axis_height / 2,
				(y_axis_height * 2) / 6, bmpinfo);
		line(y_axis_textarea_pixel_width, x_axis_textarea_pixel_height,
				y_axis_textarea_pixel_width + x_axis_width,
				x_axis_textarea_pixel_height + y_axis_height, bmpinfo);
		/* tick marks */
		for (i = 0; i < 5; i++)
			line(y_axis_textarea_pixel_width - 3,
					(i + 1) * y_axis_height / 6 + x_axis_textarea_pixel_height,
					y_axis_textarea_pixel_width + 3,
					(i + 1) * y_axis_height / 6 + x_axis_textarea_pixel_height,
					bmpinfo);
		for (i = 0; i < 5; i++)
			line((i + 1) * x_axis_width / 6 + y_axis_textarea_pixel_width,
					x_axis_textarea_pixel_height - 3,
					(i + 1) * x_axis_width / 6 + y_axis_textarea_pixel_width,
					x_axis_textarea_pixel_height + 3,
					bmpinfo);
		/* Axis labels */
		/* Y axis */
		set_font(bmpinfo, label_font.fontid);
		for (i = 2; i >= -2; i--)
		{
			xpos = y_axis_textarea_pixel_width -
							(TICK_MARK_TO_LABEL_PADDING +
							AXIS_TICK_MARK_PIXEL_LENGTH / 2 + label_font.width);
			if (i != 0)
				xpos -= label_font.width;
			ypos = x_axis_textarea_pixel_height + y_axis_height * (i + 3) /
											6 -	label_font.height / 2;
			moveto(bmpinfo, xpos, ypos);
			if (i > 0)
				paint_glyph('+', bmpinfo, 0);
			else if (i < 0)
				paint_glyph('-', bmpinfo, 0);
			paint_glyph('0' + abs(i), bmpinfo, 0);
		}
		/* X axis */
		for (i = -2; i <= 2; i++)
		{
			if (i == 0)
				xpos = y_axis_textarea_pixel_width +
								x_axis_width * (i + 3) / 6 - label_font.width / 2;
			else
				xpos = y_axis_textarea_pixel_width +
								x_axis_width * (i + 3) / 6 - label_font.width;
			ypos = x_axis_textarea_pixel_height -
							(label_font.height +
							AXIS_TICK_MARK_PIXEL_LENGTH / 2 +
							TICK_MARK_TO_LABEL_PADDING);
			moveto(bmpinfo, xpos, ypos);
			if (i > 0)
				paint_glyph('+', bmpinfo, 0);
			else if (i < 0)
				paint_glyph('-', bmpinfo, 0);
			paint_glyph('0' + abs(i), bmpinfo, 0);
		}
		/* copyright label */
		set_font(bmpinfo, FNT_5x8);
		tm = time(NULL);
		strftime(buf + 70, 9, "%Y", gmtime(&tm));
		sprintf(buf, "Duzen Labs/Halloran \251 %s", buf + 70);
		moveto(bmpinfo, bmpinfo.width - BORDER_PADDING,
					bmpinfo.height - ((strlen(buf) + 8) * 5));
		for (ptr = buf; *ptr != '\0'; ptr++)
			paint_angled_glyph(*ptr, bmpinfo, 0, 90.0, ANGLE_DEGREES);
		/* text labels on the axes */
		/********************/
		/* putting text in: X axis */
		set_font(bmpinfo, fontid = axis_text_font.fontid);
		fnthgt = get_current_font_height(bmpinfo);
		ptr = line_data[YOUDEN_X_AXIS_LABEL].label;
		ypos = x_axis_textarea_pixel_height - (label_font.height +
							AXIS_TICK_MARK_PIXEL_LENGTH / 2 +
							TICK_MARK_TO_LABEL_PADDING +
							LABEL_TO_AXIS_NAME_PADDING);
		for (i = 0; i < line_data[YOUDEN_X_AXIS_LABEL].line_count; i++)
		{
			xpos = y_axis_textarea_pixel_width + x_axis_width / 2 -
						line_data[YOUDEN_X_AXIS_LABEL].line_pixlen[i] / 2;
			ypos -= fnthgt;
			moveto(bmpinfo, xpos, ypos);
			while (*ptr != '\0')
				paint_glyph(*ptr++, bmpinfo, 0);
			if (fontid > 1 && i < 2)
			{
				set_font(bmpinfo, --fontid);
				fnthgt = get_current_font_height(bmpinfo);
			}
			ptr++;
		}
		/* Y axis */
		set_font(bmpinfo, fontid = axis_text_font.fontid);
		fnthgt = get_current_font_height(bmpinfo);
		ptr = line_data[YOUDEN_Y_AXIS_LABEL].label;
		xpos = BORDER_PADDING;
		for (i = 0; i < line_data[YOUDEN_Y_AXIS_LABEL].line_count; i++)
		{
			ypos = x_axis_textarea_pixel_height + y_axis_height / 2 -
						line_data[YOUDEN_X_AXIS_LABEL].line_pixlen[i] / 2;
			xpos += fnthgt;
			moveto(bmpinfo, xpos, ypos);
			while (*ptr != '\0')
				paint_angled_glyph(*ptr++, bmpinfo, 0, 90.0, ANGLE_DEGREES);
			if (fontid > 1 && i < 2)
			{
				set_font(bmpinfo, --fontid);
				fnthgt = get_current_font_height(bmpinfo);
			}
			ptr++;
		}
		/* Title */
		set_font(bmpinfo, fontid = title_font.fontid);
		fnthgt = get_current_font_height(bmpinfo);
		fntwdt = get_current_font_width(bmpinfo);
		ypos = x_axis_textarea_pixel_height + y_axis_height +
							 line_data[YOUDEN_TITLE_LABEL].max_pix_height * 7 / 6;
		ptr = line_data[YOUDEN_TITLE_LABEL].label;
		for (j = 0; j < line_data[YOUDEN_TITLE_LABEL].line_count; j++)
		{
			xpos = y_axis_textarea_pixel_width + (x_axis_width / 2) -
					(line_data[YOUDEN_TITLE_LABEL].line_len[j] * fntwdt) / 2;
			ypos -= fnthgt;
			moveto(bmpinfo, xpos, ypos);
			while (*ptr != '\0')
				paint_glyph(*ptr++, bmpinfo, 0);
			if (fontid > 1 && i < 2)
			{
				set_font(bmpinfo, --fontid);
				fnthgt = get_current_font_height(bmpinfo);
				fntwdt = get_current_font_width(bmpinfo);
			}
			ptr++;
		}
#ifdef DEBUG
		fprintf(log_f, "\n------Data point plotting for Youden-------");
#endif
		/* plotting data points */
		for (i = 0; i < Youden.count; i++)
		{
			xpos = x_axis_width / 2 + (double)(x_axis_width / 6) *
					((Youden.pairs[0][i] -	Youden.mean[0]) / Youden.sd[0]);
			xpos += y_axis_textarea_pixel_width;
			ypos = y_axis_height / 2 + (double)(y_axis_height / 6) *
					((Youden.pairs[1][i] - Youden.mean[1]) / Youden.sd[1]);
			ypos += x_axis_textarea_pixel_height;
			moveto(bmpinfo, xpos - 1, ypos - 1);
#ifdef DEBUG
			xpos = x_axis_width / 2 + (double)(x_axis_width / 6) *
					((Youden.pairs[0][i] -	Youden.mean[0]) / Youden.sd[0]);
			ypos = y_axis_height / 2 + (double)(y_axis_height / 6) *
				   ((Youden.pairs[1][i] - Youden.mean[1]) / Youden.sd[1]);
			fprintf(log_f,
				"\n*** Plot Point #%d ****\n"
				"  xpos = x_axis_width / 2 + (double)(x_axis_width / 6) *\n"
				"     ((Youden.pairs[0][i] - Youden.mean[0]) / Youden.sd[0]):\n"
				"  xpos = %d / 2 + (double)(%d / 6) * ((%f - %f) / %f):\n"
				"  xpos = %d\n"
				"  xpos += y_axis_textarea_pixel_width (= %d)\n"
				"  xpos = %d\n"
				"  ypos = y_axis_height / 2 + (double)(y_axis_height / 6) *\n"
				"     ((Youden.pairs[1][i] - Youden.mean[1]) / Youden.sd[1]):\n"
				"  ypos = %d / 2 + (double)(%d / 6) * ((%f - %f) / %f):\n"
				"  ypos = %d\n"
				"  ypos += x_axis_textarea_pixel_height ( = %d)\n"
				"  ypos = %d\n",
					i, x_axis_width, x_axis_width, Youden.pairs[0][i],
					Youden.mean[0], Youden.sd[0], xpos,
					y_axis_textarea_pixel_width,
					xpos + y_axis_textarea_pixel_width,
					y_axis_height, y_axis_height, Youden.pairs[1][i],
					Youden.mean[1], Youden.sd[1], ypos,
					x_axis_textarea_pixel_height,
					ypos + x_axis_textarea_pixel_height);
#endif
			if (Youden.symbol[i] == DEFAULT_YOUDEN_MARKER)
				paint_region(square3x3, 3, 3, bmpinfo, 0);
			else
			{
				if (Youden.symbol[i] >= 1 && Youden.symbol[i] <= 10)
					set_font(bmpinfo, FNT_MARKERS_7x9);
				else
					set_font(bmpinfo, FNT_6x10);
				paint_glyph(Youden.symbol[i], bmpinfo, 0);
			}
		}
#ifdef DEBUG
		fprintf(log_f, "\n-------------------------------------------");
#endif
		free_Youden(Youden);
	}
	/**********************************************************/
	if ((gi = calloc(1, sizeof(struct gif_image))) == NULL)
	{
#ifdef USER_MODE
		fprintf(stderr,
			"\nMemory allocation failure for GIF record: %s", strerror(errno));
#endif
		return (-1);
	}
	gi.sd.screen_width = bmpinfo.width;
	gi.sd.screen_height = bmpinfo.height;
	gi.sd.is_global_map = TRUE;
	gi.sd.color_res =	gi.sd.bits_per_pixel = BITS_PER_PIXEL;
	gi.sd.bkgd_color_index = BLACK;
#ifdef QC2GIFDEBUG
	/* dump the grid to a file as rgb triplets */
	rgbf = fopen("rgbtest.bin", "wb");
	for (i = 0; i < bmwidth * bmheight; i++)
		fprintf(rgbf, "%c%c%c",
					color_map[bmgrid[i] * 3],
					color_map[bmgrid[i] * 3 + 1],
			 		color_map[bmgrid[i] * 3 + 2]);
	fclose(rgbf);
#endif
	gi.defined_colors = 15;
	gi.global_color_map = color_map;
	gi.image_count = 1;
	if ((gi.id = calloc(1, sizeof(struct image_descriptor))) == NULL)
	{
#ifdef USER_MODE
		fprintf(stderr,
			"\nMemory allocation failure for GIF image descriptor: %s", strerror(errno));
#endif
		return (-1);
	}
	gi.id[0].left_start = gi.id[0].top_start = 0;
	gi.id[0].width = bmpinfo.width;
	gi.id[0].height = bmpinfo.height;
	gi.id[0].use_local_map = gi.id[0].is_interlaced = 0;
	gi.id[0].bits_per_pixel = gi.sd.bits_per_pixel =
				gi.id[0].code_size = BITS_PER_PIXEL;
	gi.id[0].raster_data =	bmgrid;
	len = 0;
	if (outfname == NULL)
	{
		len = strlen(infname);
		for (ptr = infname + len - 1; ptr > infname &&
				*ptr != PATHNAME_SEPARATOR && *ptr != '.'; ptr--)
			;
		if (*ptr == '.' && ptr < infname + len - 4)
			outfname = strdup(infname);
		else
		{
			outfname = malloc(len + 5);
			strcpy(outfname, infname);
		}
		strcpy(outfname + (ptr - infname), ".gif");
	}
	if (store_gif(outfname, gi) != 0)
	{
#ifdef USER_MODE
		fprintf(stderr,
			"\nError in creating the GIF image file: %s", strerror(errno));
#endif
		return (-1);
	}
#ifdef USER_MODE
	if (stat(outfname, &finfo) == 0)
		printf("\nGIF image file '%s' (size=%d bytes) successfully created",
			   outfname, finfo.st_size);
#endif
	if (len > 0)
		free(outfname);
	free(gi.id);
	free(gi);
	free(bmpinfo.color_map);
	free(bmpinfo.grid);
	free(bmpinfo);
#ifdef MSS
	MSS_LEAVE_SCOPE;
	MSS_CHECK_ALL_BLOCKS;
#endif
#ifdef  DEBUG
	fclose(log_f);
#endif
	return (0);
}

function readqc(void *qcref, int reftype, void **plotinfo, int *plottype)
void *qcref;
int reftype;
void **plotinfo;
int *plottype;
{
	char *buf, *ptr, *eptr, *aptr, *bptr, *sptr, *dptr;
	int bufsiz, is_description, seriesnum, count, quote_char, i, first_count, retval;
	double mean, sd, dval;
	void *vptr, *refptr;
	struct dset {
		int          ref;
		int          count;
		double      *values;
		struct dset *next;
	} *datasets, oneset, *datset, *lastdset;
 	struct pointdesc pd, *lastpointdesc, *plot_point, *lstart, *next;
	struct LJplotdesc *LJ;
	struct Youdenplotdesc *Youden;
	fpos_t fptr;
	mpos_t mptr;

#ifdef  VERBOSE
  	fprintf(log_f, "\n===readqc(qcref=%p, reftype=%d)", qcref, reftype);
#endif
	if (qcref == NULL)
   	return (-1);
	if (reftype == TYPE_FILENAME)
   {
		if ((refptr = fopen((const char *)qcref, "r")) == NULL)
			return (-1);
		reftype = TYPE_FILE;
   }
	else if (reftype == TYPE_MEMBLOCK)
		mseek(refptr = qcref, 0, SEEK_SET);
	else
		return (-1);
	datasets = lastdset = NULL;
	is_description = FALSE;
	bufsiz = BUFSIZ;
   if ((bptr = buf = malloc(BUFSIZ)) == NULL)
		return (-1);
	*plottype = quote_char = -1;
   *plotinfo = NULL;
	while ((retval = get_complete_line(&bptr, &bufsiz, refptr, reftype)) == 0)
	{
#ifdef  VERBOSE
   	fprintf(log_f, "\ncompline=%s\nbufsiz=%d\n\n", bptr, bufsiz);
#endif
	 	ptr = bptr;
		if (is_description == FALSE)
 		{
		 	if (*ptr != '[')
			  	continue;
new_plot_descr:
			if (strncmp(ptr, "[LJ]", 4) == 0 ||
							strncmp(ptr, "[Levey-Jennings]", 16) == 0)
			{
			  	is_description = *plottype = IS_LJ;
				LJ = calloc(1, sizeof(struct LJplotdesc));
				*plotinfo = LJ;
				/* we also really need to get the series count too and
				   allocate space for that */
	         if (reftype == TYPE_FILE)
					fgetpos(refptr, &fptr);
            else
              	mgetpos(refptr, &mptr);
				if (get_string(refptr, reftype, "series_count=", ptr) == 0)
				  	LJ.series_count = strtol(ptr + 13, NULL, 10);
            	if (LJ.series_count > 0)
               {
						if (reftype == TYPE_FILE)
							fsetpos(refptr, &fptr);
                  else
							msetpos(refptr, mptr);
					}
			}
			else if (strncmp(ptr, "[Youden]", 8) == 0)
			{
			  	is_description = *plottype = IS_YOUDEN;
				Youden = calloc(1, sizeof(struct Youdenplotdesc));
				*plotinfo = Youden;  /* set it to the youden */
				if (reftype == TYPE_FILE)
					fgetpos(refptr, &fptr);
            else
               mgetpos(refptr, &mptr);
				if (get_string(refptr, reftype, "set1", ptr) == 0)
				{
				 	seriesnum = 0;
next_set:
					if ((eptr = strchr(ptr, '=')) == NULL)
					  	continue;
					count = 0;
               dptr = eptr - 1;
					do {
					  	eptr = strchr(dptr + 1, ',');
                  if (strlen(dptr) > 0)
							count++;
					} while ((dptr = eptr) != NULL);
               if (count == 0)
               	return (-1);
               Youden.pairs[seriesnum] = calloc(count, sizeof(double));
					Youden.count = 0;
					eptr = strchr(ptr, '=');
               dptr = eptr + 1;
					for (i = 0; i < count; i++)
					{
					 	if ((eptr = strchr(dptr, ',')) != NULL)
							*eptr = '\0';
						dval = strtod(dptr, &eptr);
					 	if (eptr > ptr)
						{
							Youden.pairs[seriesnum][i] = dval;
							Youden.count++;
						}
                 	dptr = eptr + 1;
					}
               if (Youden.count < count &&
							  		(vptr = realloc(Youden.pairs[seriesnum],
								  	Youden.count * sizeof(double))) != NULL)
						Youden.pairs[seriesnum] = vptr;
					if (seriesnum == 1)
					{
					 	if (Youden.count < first_count &&
								  	(vptr = realloc(Youden.pairs[seriesnum],
								  	Youden.count * sizeof(double))) != NULL)
							Youden.pairs[seriesnum] = vptr;
						goto uses_sets;
					}
					else
					{
	             	if (reftype == TYPE_FILE)
							fsetpos(refptr, &fptr);
	            	else
					     	msetpos(refptr, mptr);
    					if (get_string(refptr, reftype, "set2", ptr) == 0)
    					{
    					 	seriesnum++;
    						first_count = Youden.count;
    						goto next_set;
    					}
    					free(Youden.pairs[seriesnum]);
    					free(Youden);
					}
				}
            if (reftype == TYPE_FILE)
					fsetpos(refptr, &fptr);
       	   else
	           	msetpos(refptr, mptr);
				/* count the number of pairs defined */
				count = 0;
				ptr = bptr;
				while (get_complete_line(&bptr, &bufsiz, refptr, reftype) == 0)
				{
				 	ptr = bptr;
				  	if (*ptr == '[')
						break;
              	else
 					{
					 	strlwr(ptr);
						if (strncmp(ptr, "pair", 4) == 0)
						{
						 	/* check valid definition */
							ptr = strchr(ptr, '=');
							ptr++;
							for (i = 0; i < 2; i++)
							{
								if ((eptr = strchr(ptr, ',')) != NULL)
								  	*eptr = '\0';
								dval = strtod(ptr, &aptr);
								if (aptr <= ptr)
									break;
								if (i == 1)
									count++;
								ptr = eptr + 1;
							}
            		}
					}
            }
				Youden.count = count;
				Youden.pairs[0] = calloc(2 * count, sizeof(double));
				Youden.pairs[1] = Youden.pairs[0] + count;
uses_sets:
				Youden.symbol = calloc(Youden.count, sizeof(unsigned char));
				for (i = 0; i < Youden.count; i++)
			   	Youden.symbol[i] = DEFAULT_YOUDEN_MARKER;
           	if (reftype == TYPE_FILE)
					fsetpos(refptr, &fptr);
   			else
	           	msetpos(refptr, mptr);
				count = 0;
			}
		  	continue;
		}
		else if (*ptr == '[') /* end of the description */
		{
finish_up:
			if (is_description == IS_LJ)
			{
		    	/* sort the LJ linked list according to series numbers */
		    	sortl(LJ.points, getnext, setnext, cmpseries);
				/* now will sort according to the points inside the series */
		    	lstart = plot_point = LJ.points;
		    	for (i = 0; i < LJ.series_count; i++)
		    	{
		    		while (plot_point.next && plot_point.next.series == i + 1)
    					plot_point = plot_point.next;
					/* since this should be stopping point of next series,
					   NULL it temporarily, and then sort the points */
					next = plot_point.next;
					plot_point.next = NULL;
		    		sortl(lstart, getnext, setnext, cmppoints);
		    		plot_point.next = next;
		    		lstart = plot_point = next;
		    	}
			}
			else if (is_description == IS_YOUDEN)
			{
				get_dataset_params(Youden.count, Youden.pairs[0],
								   &Youden.mean[0], &Youden.sd[0]);
				get_dataset_params(Youden.count, Youden.pairs[1],
								   &Youden.mean[1], &Youden.sd[1]);
			}
        	if (retval < 0)
			{
			 	retval = -2;
			  	break;
         }
		 	is_description = FALSE;
		  	goto new_plot_descr;
		}
		/* parameters (names) are case-insensitive, so make them lowercase */
		if ((eptr = strchr(ptr, '=')) != NULL)
		{
			*eptr = '\0';
			strlwr(ptr);
			*eptr = '=';
		}
		switch (*ptr)
		{
		case 's':
			if (is_description == IS_YOUDEN)
			{
				if (strncmp(ptr, "select", 6) == 0)
    			{
    				ptr = strchr(ptr, '=') + 1;
    				if ((eptr = strchr(ptr, ',')) != NULL)
    				  	*eptr = '\0';
    				i = strtol(ptr, NULL, 10);
    				for (ptr = eptr + 1; !isprint(*ptr) && *ptr != '\0'; ptr++)
    				   	;
    				if (*ptr == '"' || *ptr == '\'')
    				{
    				 	for (eptr = ptr + 1; *eptr != '\0' && *eptr != *ptr &&
    										 		isprint(*eptr); eptr++)
    					   	;
    					if (*eptr == *ptr)
    					{
    					 	*eptr = '\0';
    						Youden.symbol[i] = get_symbol_marker(ptr + 1);
    					}
                 	else
    						Youden.symbol[i] =	*ptr;
   				}
               else if (isdigit(*ptr))
    					Youden.symbol[i] =	strtol(ptr, NULL, 10);
    				else
    					Youden.symbol[i] =	*ptr;
				}
				else if (strncmp(ptr, "size", 4) == 0)
				{
    				ptr = strchr(ptr, '=') + 1;
					Youden.size = strtol(ptr, NULL, 10);
				}
           	break;
         }
			if (strncmp(ptr, "series_count", 12) == 0)
			  	break;
			seriesnum = strtol(ptr + 6, NULL, 10);
			if (seriesnum < 0 || seriesnum > LJ.series_count ||
						(eptr = strchr(ptr, ',')) == NULL)
			  	break;
			*eptr = '\0';
			LJ.series_style[seriesnum - 1][0] = get_symbol_marker(ptr);
			ptr = eptr + 1;
			if ((eptr = strchr(ptr, ',')) != NULL)
			  	*eptr = '\0';
			LJ.series_style[seriesnum - 1][1] = get_line_style(ptr);
        	break;
		case 'a':
			if (strncmp(ptr, "abscissa=", 9) == 0 &&
						         		parse_abscissa_value(LJ, bptr + 9) != 0)
				return (-1);
			if (strncmp(ptr, "abscissa-style=", 15) == 0)
         {
				LJ.abscissa_style = i = strtol(ptr + 15, &eptr, 10);
            if (i == HEAD_CENTERED_ANGLED_TAIL ||
            						i == TAIL_CENTERED_ANGLED_HEAD)
               LJ.abscissa_angle = strtol(eptr + 1, NULL, 10);
         }
    		break;
		case 'r':
		case 'p':
			if (is_description == IS_YOUDEN)
			{
 				if (strncmp(ptr, "pair", 4) == 0)
				{
					ptr = strchr(bptr, '=') + 1; /* point to start of assignment */
					for (i = 0; i < 2; i++)
					{
						if ((eptr = strchr(ptr, ',')) != NULL)
						  	*eptr = '\0';
						dval = strtod(ptr, &eptr);
						if (eptr > ptr)
							Youden.pairs[i][count] = dval;
						ptr = eptr + 1;
					}
    	        	if (isgraph(*ptr))
					  	Youden.symbol[count] = *ptr;
	            	count++;
				}
           	break;
			}
        	/* LJ */
			/* a lab's value can be compared with known statistical parameters
			   or as part of a raw dataset where the parameters are to be
			   calculated */
			if (strncmp(bptr, "parameter=", 10) != 0
									&& strncmp(bptr, "rawdata=", 8) != 0)
			  	break;
			 /* get to the value part of the name=value definition */
			memset(&pd, 0, sizeof(struct pointdesc));
            if (*bptr == 'p')
			  	ptr += 10;
			else
			  	ptr += 8;
			/* all fields comma-separated:  1st field is series number */
			if ((eptr = strchr(ptr, ',')) == NULL)
				break;
			*eptr = '\0';
			pd.series = (char)strtol(ptr, NULL, 10);
			/* 2nd field is	the abscissa position */
			ptr = eptr + 1;
			if ((eptr = strchr(ptr, ',')) == NULL)
				break;
			*eptr = '\0';
			pd.abscissa_posn = (char)strtol(ptr, NULL, 10);
			/* 3rd field is the lab's particular value for the analyte */
			ptr = eptr + 1;
			if ((eptr = strchr(ptr, ',')) == NULL)
				break;
			*eptr = '\0';
			pd.value = strtod(ptr, NULL);
			/* if parameters are given, 4th field is mean and 5th is SD
			   if raw data, 4th field points to the dataset series that
			   is used to compute mean and SD */
			ptr = eptr + 1;
			if (*bptr == 'p')
			{
				if ((eptr = strchr(ptr, ',')) != NULL)
					*eptr = '\0';
				pd.mean = strtod(ptr, NULL);
				ptr = eptr + 1;
				pd.sd = strtod(ptr, NULL);
			}
     		else
			{
			 	int ref;

			 	/* get mean and sd from a dataset */
				ref = strtol(ptr, NULL, 10);
				for (datset = datasets; datset != NULL; datset = datset.next)
				   	if (ref == datset.ref)
					  	break;
            if (datset != NULL &&
	            		get_dataset_params(datset.count, datset.values, &mean, &sd) == 0)
				{
					pd.mean = mean;
					pd.sd = sd;
				}
			}
			if (pd.sd == 0.0 || isnan((pd.value - pd.mean) / pd.sd))
			  	pd.sd = HUGE_VAL;
			/* initialize the points linked list or add the next node */
			if (LJ.points == NULL)
			{
			  	LJ.points = malloc(sizeof(struct pointdesc));
				lastpointdesc = LJ.points;
			}
			else
			{
			  	lastpointdesc.next = malloc(sizeof(struct pointdesc));
				lastpointdesc = lastpointdesc.next;
			}
        	/* copy the temporary to the list node */
			memcpy(lastpointdesc, &pd, sizeof(struct pointdesc));
       	break;
		case 'd':
			if (strncmp(bptr, "date-format=", 12) == 0)
         	LJ.date_format = strtol(bptr + 12, &bptr, 10);
			else if (strncmp(bptr, "dataset=", 8) == 0)
         {
    			ptr = bptr + 8;
    			if ((eptr = strchr(ptr, ';')) == NULL)
    			  	break;
    			*eptr = '\0';
    			oneset.ref = strtol(ptr, NULL, 10);
    			*eptr = ';';
    			sptr = ptr = eptr + 1;
    			/* count discernible values */
    			count = 0;
     			while (*ptr != '\0')
    			{
    				if ((eptr = strchr(ptr, ',')) == NULL)
    					eptr = ptr + strlen(ptr);
    				i = *eptr;
    				*eptr = '\0';
    				dval = strtod(ptr, &dptr);
    				if (dptr != ptr)
    				  	count++;
    				if (i == '\0')
    				  	break;
               	*eptr = i;
    				ptr = eptr + 1;
    			}
            	oneset.count = count;
    			oneset.values = calloc(count, sizeof(double));
    			/* now store the values into an array */
    			ptr = sptr;
    			i = 0;
     			while (*ptr != '\0')
    			{
    				if ((eptr = strchr(ptr, ',')) == NULL)
    					eptr = ptr + strlen(ptr);
    				*eptr = '\0';
    				dval = strtod(ptr, &dptr);
    				if (dptr != ptr)
    					oneset.values[i++] = dval;
    				ptr = eptr + 1;
    			}
            	oneset.next = datset = NULL;
    			/* raw datasets will be saved in a linked list defined locally */
    			if (datasets == NULL)
    			  	datasets = calloc(1, sizeof(struct dset));
    			else
    				for (datset = datasets; datset != NULL; datset = datset.next)
    				  	if (oneset.ref == datset.ref)
    					  	break;
    			if (datset == NULL)
    			{
    			 	if (lastdset != NULL)
    				{
    					lastdset.next = malloc(sizeof(struct dset));
    					lastdset = lastdset.next;
    				}
               	else
    				  	lastdset = datasets;
    				memset(lastdset, 0, sizeof(struct dset));
    				memcpy(lastdset, &oneset, sizeof(struct dset));
    			}
    			else
    			{
    				free(datset.values);
    				datset.count = oneset.count;
    				datset.values = oneset.values;
    			}
            	/* this raw dataset can now be referenced for a lab with its value */
			}
  	   	break;
		case 'x':
			if (is_description == IS_YOUDEN && strncmp(ptr, "x-axis-label=", 13) == 0)
			{
			 	ptr = strchr(ptr, '=') + 1;
				for (dptr = eptr = ptr; *eptr != '\0'; eptr++)
			   	if (*eptr != '"')
					  	*dptr++ = *eptr;
					else if (*eptr == '\\')
					  	eptr++;
				*dptr = '\0';
				if ((Youden.x_axis_label = malloc(strlen(ptr) + 1)) == NULL)
					break;
				strcpy(Youden.x_axis_label, ptr);
			}
        	break;
		case 'y':
			if (is_description == IS_YOUDEN && strncmp(ptr, "y-axis-label=", 13) == 0)
			{
			 	ptr = strchr(ptr, '=') + 1;
				for (dptr = eptr = ptr; *eptr != '\0'; eptr++)
			   	if (*eptr != '"')
					  	*dptr++ = *eptr;
					else if (*eptr == '\\')
					  	eptr++;
				*dptr = '\0';
				if ((Youden.y_axis_label = malloc(strlen(ptr) + 1)) == NULL)
					break;
				strcpy(Youden.y_axis_label, ptr);
			}
        	break;
		case 't':
			if (strncmp(ptr, "title=", 6) == 0)
			{
			 	ptr = strchr(ptr, '=') + 1;
				for (dptr = eptr = ptr; *eptr != '\0'; eptr++)
			   	if (*eptr == '\\' && eptr[1] == '"')
               {
						*dptr++ = '"';
                  eptr++;
               }
               else if (*eptr != '"')
					  	*dptr++ = *eptr;
				*dptr = '\0';
				if ((sptr = malloc(strlen(ptr) + 1)) == NULL)
					break;
            if (is_description == IS_YOUDEN)
               Youden.title = sptr;
            else
            	LJ.title = sptr;
				strcpy(sptr, ptr);
			}
        	break;
		}
		bufsiz = BUFSIZ;
	}
	if (retval == -1)  /* this is a normal return value, not an error!!! */
	  	goto finish_up;
	/* free the datasets used */
	if ((datset = datasets) != NULL)
	 	do {
			lastdset = datset.next;
			free(datset);
			datset = lastdset;
		} while (datset != NULL);
	if (reftype == TYPE_FILE)
		fclose(refptr);
	free(buf);
	return (0);
}

int store_gif(const char *giffname,	struct gif_image *gi);
int compress_raster_line(unsigned char *rasterbuf, unsigned char *codebuf,
			int rbuflen);


function moveto(struct indexed_bitmap_info *bmpinfo, int xpos, int ypos)
{
	if (bmpinfo == NULL)
    	return (-1);
    if (xpos >= bmpinfo.width || ypos >= bmpinfo.height)
    	return (-1);
    bmpinfo.x_point = xpos;
    bmpinfo.y_point = ypos;
    return (0);
}

function line(int x_1, int y_1, int x_2, int y2, struct indexed_bitmap_info *info)
{
 	int i, j, x, y, ex, intcpt, pix_on, pix_off;
	double slope;
	unsigned char fgcolor, bgcolor, *grid, *pixel, color;

	if (x_1 >= info.width || x_2 >= info.width || y_1 >= info.height ||
				y_2 >= info.height || x_1 < 0 || x_2 < 0 || y_1 < 0 || y_2 < 0)
		return (-1);
    if ((grid = info.grid) == NULL)
	  	return (-1);
	fgcolor = info.fore_color_index;
   bgcolor = info.back_color_index;
   pix_off = 0;
   if ((pix_on = info.dash[PIXELS_ON]) == 0 && info.dash[PIXELS_OFF] == 0)
   	pix_on = -1;
   else
   	for (i = 0; i < info.dash[OFFSET]; i++)
         if (pix_on > 0)
         {
            pix_on--;
            if (pix_on == 0)
            	pix_off = info.dash[PIXELS_OFF];
			}
         else if (pix_off > 0)
         {
            pix_off--;
            if (pix_off == 0)
            	pix_on = info.dash[PIXELS_ON];
			}
	if (x_1 - x_2 == 0 || y_1 - y_2 == 0)
	{
		if (x_1 - x_2 == 0) /* vertical line */
		{
			if (y_1 > y_2)
			{
			  	i = y_1 - y_2;
				y = y_2;
			}
			else
			{
			  	i = y_2 - y_1;
				y = y_1;
			}
			pixel = grid + y * info.width + x_1;
         color = fgcolor;
			for (j = 0; j < i; j++)
			{
	         if (pix_on > 0)
   	      {
      	      pix_on--;
         	   if (pix_on == 0)
               {
	            	pix_off = info.dash[PIXELS_OFF];
			         color = bgcolor;
               }
				}
	         else if (pix_off > 0)
   	      {
	            pix_off--;
   	         if (pix_off == 0)
               {
	            	pix_on = info.dash[PIXELS_ON];
			         color = fgcolor;
               }
				}
				*pixel = color;
				pixel += info.width;   /* draws the line up */
			}
		}
		else     /* horizontal line */
		{
			if (x_1 > x_2)
			{
			  	i = x_1 - x_2;
				x = x_2;
			}
			else
			{
			  	i = x_2 - x_1;
				x = x_1;
			}
			pixel = grid + y_2 * info.width + x;
         color = fgcolor;
			for (j = 0; j < i; j++)
			{
	         if (pix_on > 0)
   	      {
      	      pix_on--;
         	   if (pix_on == 0)
               {
	            	pix_off = info.dash[PIXELS_OFF];
			         color = bgcolor;
               }
				}
	         else if (pix_off > 0)
   	      {
	            pix_off--;
   	         if (pix_off == 0)
               {
	            	pix_on = info.dash[PIXELS_ON];
			         color = fgcolor;
               }
				}
			 	*pixel++ = color;
			}
		}
	}
	else  /* a non-vertical or -horizontal line */
	{
		slope = (double)(y_2 - y_1) / (double)(x_2 - x_1);
		intcpt = y_1 - (int)(slope * x_1);
		if (x_1 > x_2)
		{
		  	x = x_2;
			ex = x_1;
			y = y_2;
		}
    	else
		{
		  	x = x_1;
			ex = x_2;
			y = y_1;
		}
      color = fgcolor;
	  	while (x < ex)
		{
		 	y = (int)(slope * x) + intcpt;
			pixel = (char *)info.grid + y * info.width + x;
         if (pix_on > 0)
  	      {
     	      pix_on--;
        	   if (pix_on == 0)
            {
            	pix_off = info.dash[PIXELS_OFF];
		         color = bgcolor;
				}
			}
         else
  	      {
            pix_off--;
  	         if (pix_off == 0)
            {
            	pix_on = info.dash[PIXELS_ON];
		         color = fgcolor;
            }
			}
			*pixel = color;
			x++;
		}
	}
	return (0);
}

int rectangle(int x_1, int y_1, int x_2, int y2, struct indexed_bitmap_info *info);
{
 	if (line(x_1, y_1, x_2, y_1, info) < 0)
	  	return (-1);
	if (line(x_1, y_1, x_1, y_2, info) < 0)
		return (-1);
	if (line(x_2, y_1, x_2, y_2, info) < 0)
		return (-1);
	if (line(x_1, y_2, x_2, y_2, info) < 0)
		return (-1);
    return (0);
}

int circle(int x, int y, int radius, struct indexed_bitmap_info *picinfo);
{
	double dy, dx, delta_theta, theta;
	char *grid;
	int color;

	/* do it by degrees, with resolution of delta_y = 1 pixel:
	    hence delta_theta with this resolution = arcsin (1/r) */
	if (radius <= 0 || picinfo == NULL)
	  	return (-1);
	color = picinfo.fore_color_index;
	grid = picinfo.grid;
	delta_theta = asin(1.0 / (double)radius);
	for (theta = 0.0; theta < 2 * M_PI; theta += delta_theta)
	{
	 	dy = radius * sin(theta);
		dx = radius * cos(theta);
		grid[(int)dx + x + (y + (int)dy) * picinfo.width] = color;
	}
	return (0);
}

int clip_line(int top, int left, int bottom, int right, int *x_1, int *y_1,
			  	int *x_2, int *y_2);
{
 	if (*x_1 < left || *x_1 > right || *y_1 < bottom || *y_1 > top)
	  	return (-1);
	return (0);
}

int paint_glyph(unsigned font_set_index, struct indexed_bitmap_info *pic_info,
					int boolean)
{
	return (paint_angled_glyph(font_set_index, pic_info, boolean, 0.0, ANGLE_DEGREES));
}

int paint_angled_glyph(unsigned font_set_index,
					   	struct indexed_bitmap_info *pic_info,
						int boolean, double angle, int angle_type)
{
 	char *gptr, *bmap, *bptr;
	int bmwidth, fheight, fwidth, x_ref, y_ref, max_color_idx, bkgd, frgd,
		x, y, nx, ny;
	struct fontprop *font;
   float xp, yp;
	double theta;

	/* check for argument range errors */
	if (font_set_index > FONT_SET_INDEX_MAX)
	  	return (-1);
	if ((font = &pic_info.font) == NULL) /* get the font from the bitmap */
	  	return (-1);                      /* info structure */
	if (pic_info == NULL || (bmap = pic_info.grid) == NULL ||
				pic_info.color_map == NULL)
	  	return (-1);
    /****** SPECIAL CHARACTER HANDLING AND MAPPING for Turkish characters
    
   if (font_set_index >= 128)
   {
    	for (x = 0; Turk_Win1252[x].key_code > 0; x++)
        	if (Turk_Win1252[x].key_code == font_set_index)
            {
            	font_set_index = Turk_MSDOS[x].glyph_index;
                break;
            }
		if (Turk_Win1252[x].key_code < 0)
        	return (-1);
   } */
   bmwidth = pic_info.width;  /* width of pic, font height and width */
	fheight = font.height;
	fwidth = font.width;
    /* x_ref is the leftmost point from which to start
       y_ref is the bottommost point from which to start */
   if ((x_ref = pic_info.x_point) < 0 || (y_ref = pic_info.y_point) < 0)
	  	return (-1);
	if (angle_type == ANGLE_DEGREES)
	  	theta = (angle / 180.0) * M_PI;
	else
	  	theta = angle;
	/* calculate the new x,y point for the next glyph */
 	pic_info.x_point += (int)((double)fwidth * cos(theta));
 	pic_info.y_point += (int)((double)fwidth * sin(theta));
   if (pic_info.x_point > bmwidth)
      pic_info.x_point = 0;
   if (pic_info.x_point > bmwidth)
      pic_info.x_point = 0;
   if (pic_info.y_point > pic_info.height)
      pic_info.y_point = 0;
	max_color_idx = 1 << pic_info.bpp;
   if ((bkgd = pic_info.back_color_index) < 0 || bkgd > max_color_idx ||
			(frgd = pic_info.fore_color_index) < 0 || frgd > max_color_idx)
		return (-1);
	/* paint the unrotated glyph
	     1,1,1,1,1,0,
        1,1,1,1,1,0,
        1,0,0,0,0,0,
        1,0,0,0,0,0,    'gptr' is a pointer to the bitmap font at left
        1,1,1,1,0,0,       starting at the top and left, reading
        1,0,0,0,1,0,       from left to right
        1,0,0,0,1,0,
        1,0,0,0,1,0,    'bptr' below is the converted point on the bitmap
        1,1,1,1,0,0,     where the font is placed.  A rotation is applied
        0,0,0,0,0,0,     to it, if necessary
        0,0,0,0,0,0,
        0,0,0,0,0,0  */
	gptr = (char *)font.rdefs + font_set_index * font.width * font.height - 1;
	/* one-pass rotation */
	for (y = y_ref + fheight - 1; y >= y_ref; y--)
   	for (x = x_ref; x < x_ref + fwidth; x++)
		{
		 	gptr++;
         /* rotation transformation */
		 	xp = (float)(x - x_ref) * cos(theta) - (float)(y - y_ref) * sin(theta);
		 	yp = (float)(x - x_ref) * sin(theta) + (float)(y - y_ref) * cos(theta);
			nx = x_ref + round(xp);
			ny = y_ref + round(yp);
			if (nx >= pic_info.width || nx < 0 ||
			            		ny >= pic_info.height || ny < 0)
			  	continue;  /* cannot paint outside the image boundaries */
			bptr = bmap + ny * bmwidth + nx;
		    if (*gptr == 1)
			  	*bptr = frgd;
			else if (*bptr != frgd)
			  	*bptr = bkgd;
		}
	return (0);
}


function paint_region(const char *region, int width, int height,
					struct indexed_bitmap_info *pic_info, int boolean)
{
	char *bmap;
	const char *gptr;
	int row, col;

	if (region == NULL || width <= 0 || height <= 0 || pic_info == NULL)
	  	return (-1);
	if (pic_info == NULL || (bmap = pic_info.grid) == NULL)
	  	return (-1);
	gptr = region;
	for (row = pic_info.y_point + height - 1; row >= pic_info.y_point; row--)
		for (col = pic_info.x_point; col < pic_info.x_point + width; col++)
			if (*gptr++ == 1)
			  	bmap[row * pic_info.width + col] = pic_info.fore_color_index;
			else
				bmap[row * pic_info.width + col] =	pic_info.back_color_index;
	return (0);
}


function set_dash(struct indexed_bitmap_info *bmpinfo, int pixels_on,
		int pixels_off, int offset)
{
	if (bmpinfo == NULL || pixels_on < 0 || pixels_off < 0 || offset < 0)
		return (-1);
	bmpinfo.dash[PIXELS_ON] = pixels_on;
	bmpinfo.dash[PIXELS_OFF] = pixels_off;
	bmpinfo.dash[OFFSET] = pixels_on;
	return (0);
}

static struct fontprop font_properties[] = {
	{ FNT_5x8,	   		5,  8,   8, &Font5x8   		},
	{ FNT_6x9,	   		6,   9,  9, &Font6x9   		},
	{ FNT_6x10,	   		6,  10, 10, &Font6x10  		},
	{ FNT_6x12,	   		6,  12, 12, &Font6x12  		},
	{ FNT_6x13,	   		6,  13, 13, &Font6x13  		},
	{ FNT_6x13B,   		6,  13, 13, &Font6x13B 		},
	{ FNT_7x13,	   		7,  13, 13, &Font7x13  		},
	{ FNT_7x13B,   		7,  13, 13, &Font7x13B 		},
	{ FNT_7x14,	   		7,  14, 14, &Font7x14  		},
	{ FNT_8x13,	   		8,  13, 13, &Font8x13  		},
	{ FNT_8x13B,   		8,  13, 13, &Font8x13B 		},
	{ FNT_8x16,	   		8,  16, 16, &Font8x16  		},
	{ FNT_9x15,	   		9,  15, 15, &Font9x15  		},
	{ FNT_9x15B,   		9,  15, 15, &Font9x15B 		},
	{ FNT_10x20,   		10, 20, 20, &Font10x20 		},
	{ FNT_12x24,   		12, 24, 24, &Font12x24 		},
	{ FNT_MARKERS_7x9,	7,   9,  9, &Markers_7x9	},
	{ FNT_MARKERS_9x12, 9,  12, 12, &Markers_9x12 	},
	{ -1,              -1,  -1, -1, NULL            }
};

static struct font_sel {
	int       max_size;
	int       label_fontid;
	int       axis_text_fontid;
	int       title_fontid;
} font_selections[] = {
  /* maxsiz  label_fontid axis_text  title_fontid */
	{ 250,  FNT_7x13,  FNT_6x10,  FNT_6x12  },
	{ 350,  FNT_8x16,  FNT_6x12,  FNT_7x14  },
	{ 500,  FNT_9x15,  FNT_7x14,  FNT_10x20 },
	{ 750,  FNT_10x20, FNT_8x16,  FNT_12x24 },
	{  -1,        -1,        -1,        -1 },
};

int get_font_properties(fp)
struct fontprop *fp;
{
   struct fontprop *fontprops;
   
	if (fp == NULL)
   	return (-1);
	for (fontprops = font_properties; fontprops.fontid >= 0; fontprops++)
   	if (fp.fontid == fontprops.fontid)
		  	break;
	if (fontprops.fontid < 0)
	  	return (-1);
   memcpy(fp, fontprops, sizeof(struct fontprop));
   return (0);
}

int set_font(bmpinfo, font)
struct indexed_bitmap_info *bmpinfo;
int font;
{
	struct fontprop fp;
   
	if (bmpinfo == NULL)
   	return (-1);
   fp.fontid = font;
   if (get_font_properties(&fp) < 0)
   	return (-1);
   memcpy(&bmpinfo.font, &fp, sizeof(struct fontprop));
	return (0);
}

/* picks a font for title, axis text and axis labels based on the size
   of the (Youden) plot specified, and returns its properties in the
   font argument */
int set_proportioned_font(axis_size, font, option)
int axis_size, option;
struct fontprop *font;
{
 	int i, fontid;

 	if (axis_size <= 0)
	  	return (-1);
	for (i = 0; font_selections[i].max_size >= 0; i++)
		if (axis_size < font_selections[i].max_size)
		  	break;
    if (i > 0)
		i--;
	if (option == TITLE)
		fontid = font_selections[i].title_fontid;
	else if (option == AXIS_TEXT)
		fontid = font_selections[i].axis_text_fontid;
	else if (option == LABEL)
		fontid = font_selections[i].label_fontid;
	else
		return (-1);
	for (i = 0;	font_properties[i].fontid >= 0; i++)
	   	if (fontid == font_properties[i].fontid)
		  	break;
	if (font_properties[i].fontid < 0)
	  	return (-1);
    memcpy(font, &font_properties[i], sizeof(struct fontprop));
   	return (0);
}
