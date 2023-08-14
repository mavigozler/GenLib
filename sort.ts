
function arraySort(
   datavals: number[] | string[],
   sortMethod?: "StraightInsertion" | "ShellsMethod" | "QuickSort"
): number[] | null {
   const  theArray = Object.assign([], datavals);
   let N: "<20" | "<50" | null = null;

	if (!sortMethod) {
		if (datavals.length < 20)
			N = "<20";
		else if (datavals.length < 50)
			N = "<50";
   } else if (sortMethod) {
      if (sortMethod == "StraightInsertion" || N == "<20")
		   StraightInsertion(theArray);
	   else if (sortMethod == "ShellsMethod" || N == "<20")
		   ShellsMethod(theArray);
      else if (sortMethod == "QuickSort")
		   QuickSort(theArray);
   } else
      theArray.sort((elem1, elem2) => {
         return elem1 > elem2 ? 1 : elem1 < elem2 ? -1 : 0;
      });
	return theArray;
}

// from Chapter 8.1 Numerical Recipes in C
function StraightInsertion(theArray: number[] | string[]) {
	let i, j, x;

   for (j = 0; j < theArray.length; j++) {
		x = theArray[j];
		i = j - 1;
		while (i >= 0 && theArray[i] > x)
		{
			theArray[i + 1] = theArray[i];
			i--;
		}
		theArray[i + 1] = x;
	}
	return;
}

function ShellsMethod(theArray: number[] | string[]) {
	var i, j, inc, v;

	inc = 1;  // Determine the starting increment.
	do {
		inc = (inc * 3) + 1;
	} while (inc <= theArray.length);
	do {  // Loop over the partial sorts.
		inc /= 3;
		for (i = inc; i < theArray.length; i++) {   // Outer loop of straight insertion.
			v = theArray[i];
			j = i;
			while (theArray[j - inc] > v)
			{  // Inner loop of straight insertion.
				theArray[j] = theArray[j - inc];
				j -= inc;
				if (j <= inc)
					break;
			}
			theArray[j] = v;
		}
	} while (inc > 1);
}

// from Chapter 8.2 Numerical Recipes in C
function QuickSort(theArray: number[]) {
	const NSTACK = 50,
	      M = 7;

	let a: number,
      i: number,
      j: number,
      x: number,
      n: number,
      ir: number,
      k,
      l: number,
      istack: number[],
      jstack: number,
      t;

	ir = n = theArray.length;
	l = 1;
	jstack = 0;
	istack = new Array(NSTACK);
	for ( ; ; ) {    //  Insertion sort when subarray small enough.
		if (ir - l < M) {
			for (j = l; j < ir; j++) {
				x = theArray[j];
				for (i = j - 1; i >= l; i--)
				{
					if (theArray[i] <= x)
						break;
               theArray[i + 1] = theArray[i];
				}
				theArray[i + 1] = a!;
			}
			if (jstack == 0)
				break;
			ir = istack[jstack--];  //Pop stack and begin a new round of partitioning
			l = istack[jstack--];
		} else {
			k = (l + ir) >> 1; // Choose median of left, center, and right elements
					// as partitioning element x. Also rearrange so that a[l] � a[l+1] � a[ir].
			t = theArray[k]; theArray[k] = theArray[l + 1]; theArray[l + 1] = t;
			if (theArray[l] > theArray[ir])
				{t = theArray[l]; theArray[l] = theArray[ir]; theArray[ir] = t;}
			if (theArray[l + 1] > theArray[ir])
				{t = theArray[l + 1]; theArray[l + 1] = theArray[ir]; theArray[ir] = t;}
			if (theArray[l] > theArray[l+1])
				{t = theArray[l]; theArray[l] = theArray[l + 1]; theArray[l + 1] = t;}
			i = l + 1;  // Initialize pointers for partitioning.
			j = ir;
			a = theArray[l + 1];   // Partitioning element.
			for ( ; ; ) {   // Beginning of innermost loop.
				do
					i++;
				while (theArray[i] < x!); // Scan up to element > x.
				do
					j--;
				while (theArray[j] > x!);  // Scan down to element < x.
				if (j < i)
					break;   // Pointers crossed. Partitioning complete.
				t = theArray[i]; theArray[i] = theArray[j]; theArray[j] = t;  // Exchange elements.
			} // End of innermost loop.
			theArray[l + 1] = theArray[j];  // Insert partitioning element.
			theArray[j] = x!;
			jstack += 2;
			// Push pointers to larger subarray on stack, process smaller subarray immediately.
			if (jstack > NSTACK)
				alert("NSTACK too small in sort.");
			if (ir - i + 1 >= j - l) {
				istack[jstack] = ir;
				istack[jstack - 1] = i;
				ir =j - 1;
			} else {
				istack[jstack] = j - 1;
				istack[jstack - 1] = l;
				l = i;
			}
		}
	}
	return;
}

function randomizeArrayElements(theArray: any[]): any[] {
   let currentIndex: number = theArray.length,
      randomIndex: number;
   const newArray: any[] = Object.assign([], theArray);

   while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [newArray[currentIndex], newArray[randomIndex]] =
         [newArray[randomIndex], newArray[currentIndex]];
   }
   return newArray;
}