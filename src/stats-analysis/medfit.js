

/*
   x             x array
   y             y array
   ndata         count of pairs
   a, b, abdev   returned parameters.
  Fits y = a + bx by the criterion of least absolute deviations.
  The arrays x[1..ndata] and y[1..ndata] are the input experimental points.
  The parameters a and b are output, along with abdev, which is the mean
  absolute deviation (in y) of the experimental points from
  the line. This routine uses the routine rofunc, with communication
  via global variables.
*/

var ndatat, xt, yt, aa, abdevt;

function medfit(dataset)
{
   float rofunc(float b);
   var j, bb, b1, b2, del, f, f1, f2, sigb, temp, n;
   var sx = sy = sxy = sxx = chisq = 0.0;

   ndatat = n = dataset.n;
   xt = dataset.x;
   yt = dataset.y;
   for (j = 0; j < n; j++)
   {  /* As a guess for a and b, we will the leastsquares fitting line */
      sx += dataset.x[j];
      sy += dataset.y[j];
      sxy += dataset.x[j] * dataset.y[j];
      sxx += dataset.x[j] * dataset.x[j];
   }
   // Least-squares solutions
   del = n * sxx - sx * sx;
   aa = (sxx * sy - sx * sxy) / del;
   bb = (n * sxy - sx * sy) / del;
   for (j = 0;j < n; j++)
       chisq += (temp = y[j] - (aa + bb * x[j]), temp * temp);
   /* The standard deviation will give some idea of how big an
   iteration step to take */
   sigb = Math.sqrt(chisq / del);
   b1 = bb;
   f1 = rofunc(b1);
   b2 = bb + SIGN(3.0 * sigb, f1);
   /* Guess bracket as 3-sigma away, in the downhill direction known from f1. */
   f2 = rofunc(b2);
   if (b2 == b1)
   {
      *a=aa;
      *b=bb;
      *abdev=abdevt/n;
      return;
   }
   while (f1 * f2 > 0.0)
   {  // Bracketing
      bb = b2 + 1.6 * (b2 - b1);
      b1 = b2;
      f1 = f2;
      b2 = bb;
      f2 = rofunc(b2);
   }
   sigb = 0.01 * sigb;
   // Reuntil error a negligible number of standard deviations.
   while (fabs(b2 - b1) > sigb)
   {
      bb = b1 + 0.5 * (b2 - b1); // Bisection.
      if (bb == b1 || bb == b2)
         break;
      f = rofunc(bb);
      if (f * f1 >= 0.0)
      {
         f1 = f;
         b1 = bb;
      }
      else
      {
         f2 = f;
         b2 = bb;
      }
   }
   *a = aa;
   *b = bb;
   *abdev=abdevt/ndata;
}

/*
   Evaluates the right-hand side of equation (15.7.16) for a
   given value of b. Communication with
   the routine medfit is through global variables. */

function rofunc(b)
{
   var j, arr, d, sum = 0.0;
   arr = vector(1, ndatat);
   for (j = 0; j < ndatat; j++)
       arr[j] = yt[j] - b * xt[j];
   if (ndatat & 1)
      aa = select((ndatat+1) >> 1, ndatat, arr);
   else
   {
      j = ndatat >> 1;
      aa = 0.5 * (select(j, ndatat, arr) + select(j + 1, ndatat, arr));
   }
   abdevt = 0.0;
   for (j = 0; j < ndatat; j++)
   {
      d = yt[j] - (b * xt[j] + aa);
      abdevt += fabs(d);
      if (yt[j] != 0.0)
         d /= fabs(yt[j]);
      if (fabs(d) > EPS)
         sum += (d >= 0.0 ? xt[j] : -xt[j]);
   }
   free_vector(arr, 1, ndatat);
   return (sum);
}

/*
      Returns the kth smallest value in the array dataset[1..n].
      The input array will be rearranged to have this value in
      location dataset[k], with all smaller elements moved to
      dataset[1..k-1] (in arbitrary order) and all larger elements
      in dataset[k+1..n] (also in arbitrary order).
*/

function select(dataset, k)
{
   var i, ir, j, l, mid, a, temp;

   l = 1;
   ir = dataset.n;
   for ( ; ; )
   {
      if (ir <= l + 1) // Active partition contains 1 or 2 elements.
      {
         if (ir == l + 1 && arr[ir] < arr[l]) // Case of 2 elements.
            SWAP(arr[l],arr[ir])
         return arr[k];
      }
      else
      {
         mid = ( l + ir) >> 1; /* Choose median of left, center, and
                         right elements as partitioning element a.
                        Also rearrange so that dataset[l]  dataset[l+1],
                       dataset[l+1]. */
         SWAP(arr[mid], arr[l+1]);
         if (arr[l] > arr[ir])
            SWAP(arr[l], arr[ir]);
         if (arr[l+1] > arr[ir])
            SWAP(arr[l+1],arr[ir]);
         if (arr[l] > arr[l+1])
            SWAP(arr[l], arr[l+1]);
         i = l + 1;  // Initialize pointers for partitioning.
         j = ir;
         a = dataset.x[l + 1]; // Partitioning element.
         for ( ; ; )
         {   // Beginning of innermost loop.
            do
               i++;
            while (dataset.x[i] < a); // Scan up to nd element > a.
            do
              j--;
            while (arr[j] > a);  // Scan down to nd element < a.
            if (j < i)
               break;    // Pointers crossed. Partitioning complete.
            SWAP(arr[i], arr[j]);
         } // End of innermost loop.
         arr[l + 1] = arr[j]; // Insert partitioning element.
         arr[j] = a;
         if (j >= k)
            ir = j - 1;  /* Keep active the partition that contains the
              kth element.*/
         if (j <= k)
            l = i;
      }
   }
}
