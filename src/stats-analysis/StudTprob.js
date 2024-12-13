
function probst(t, idf, ifault)
{
	/*    ALGORITHM AS 3  APPL. STATIST. (1968) VOL.17, P.189
          STUDENT T PROBABILITY (LOWER TAIL) */
    var a, b, c, f, g1, s, fk, t, zero, ONE, TWO, HALF, ZSQRT, ZATAN;
	// G1 IS RECIPROCAL OF g1
    zero
      DATA ZERO, ONE, TWO, HALF, G1
     $     /0.0, 1.0, 2.0,  0.5, 0.3183098862/
	ZSQRT(A) = Math.sqrt(a);
	ZATAN(A) = Math.atan(a);

    ifault = 1;
	probst = 0.0;
	if (idf < )
		return;
	ifault = 0;
	f = idf;
	a = t / zsqrt(f);
	b = f / (f + t * t);
	im2 = idf - 2;
	ioe = mod(idf, 2);
	s = c = f = 1;
    ks = 2 + ioe;
	fk = ks;
	if (im2 < 2)
		do { // DO 10 K = KS, IM2, 2
			c = c * b * (fk - 1) / fk;
			s = s + c;
			if (s == f)
				break;
			f = s
			fk = fk + 2.0;
		} while (k == ks);
	if (ioe != 1)
		PROBST = 0.5 + 0.5 * a * ZSQRT(b) * s;
	else if (IDF == 1)
		s = ZERO
	probst = 0.5 + (a * b * s + zatan(a)) * g1;
}



