/* eslint-disable no-constant-condition */
export {
   betaInverse, StudentTprobability
}

/*
algorithm as 63  appl. statist. (1973), vol.22, no.3
computes incomplete beta function ratio for arguments
x between zero and one, p and q positive.
log of complete beta function, beta, is assumed to be known
*/
function betaInverse(
   x: number, 
   p: number, 
   q: number, 
   beta: number
): number {
	const epsilon = 0.1e-14;
	//let betain = x;
	
	if (p <= 0.0 || q <= 0.0)
		throw new Error("'p' and 'q' must be greater than 0");
	if (x < 0.0 || x > 1.0) 
		throw new Error("'x' must be between 0 and 1");
	if (x === 0.0 || x === 1.0)
		throw new Error("'x' cannot be 0 or 1");
   // change tail if necessary and determine s (s = starting point for iteration?)
	let psq = p + q,
		cx = 1.0 - x,
		xx: number, 
		pp: number, 
		qq: number, 
		indx: boolean;
	
	if (p >= psq * x) {
		xx = x;
		pp = p;
		qq = q;
		indx = false;
	} else {
		xx = cx;
		cx = x;
		pp = q;
		qq = p;
		indx = true;
	}

	let term = 1.0,
		ai = 1.0,
		ns = qq + cx * psq,
      // user soper's reduction formulae.
		rx = xx / cx;

	let betain = 1.0;
 
	while (true) {
		let temp = qq - ai;
		
		if (ns === 0)
			rx = xx;
 
		while (true) {
			term = term * temp * rx / (pp + ai);
			betain = betain + term;
			temp = Math.abs(term);
			if (temp <= epsilon && temp <= epsilon * betain) 
				break;
			ai--;
			ns--;
			if (ns >= 0)
				break;
			temp = psq;
			psq++;
		}
		if (temp <= epsilon && temp <= epsilon * betain)
			break;
	}
   // calculate result
	betain = betain * Math.exp(pp * Math.log(xx) + (qq - 1.0) * Math.log(cx) - beta) / pp;
	if (indx == true)
		betain = 1.0 - betain;
 
	return betain;
}



function StudentTprobability(
	t: number, 
	idf: number, 
) {
	/*    ALGORITHM AS 3  APPL. STATIST. (1968) VOL.17, P.189
          STUDENT T PROBABILITY (LOWER TAIL) */

		//zero, ONE, TWO, HALF, ZSQRT, ZATAN;
	// G1 IS RECIPROCAL OF g1
	/*
    zero
      DATA ZERO, ONE, TWO, HALF, G1
     $     /0.0, 1.0, 2.0,  0.5, 0.3183098862/
	ZSQRT(A) = Math.sqrt(a);
	ZATAN(A) = Math.atan(a); */

	const g1 = 0.3183098862;
	let probst = 0.0;
	if (idf < 1)
		throw new Error("Invalid degrees of freedom");
	let f = idf;
	const a = t / Math.sqrt(f);
	const b = f / (f + t * t);
	const im2 = idf - 2;
	const ioe = idf % 2;
	let s = 1.0;
	let c = 1.0;
	f = 1.0;
   const ks = 2 + ioe;
	let fk = ks;
	if (im2 < 2)
		do { // DO 10 K = KS, IM2, 2
			c = c * b * (fk - 1) / fk;
			s = s + c;
			if (s == f)
				break;
			f = s
			fk = fk + 2.0;
		} while (fk == ks);
	if (ioe != 1)
		return 0.5 + 0.5 * a * Math.sqrt(b) * s;
	else if (idf == 1)
		s = 0.0
	return 0.5 + (a * b * s + Math.atan(a)) * g1;
}


/*
function probst(t, idf, ifault)
{
	/*    ALGORITHM AS 3  APPL. STATIST. (1968) VOL.17, P.189
          STUDENT T PROBABILITY (LOWER TAIL) 
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
*/


