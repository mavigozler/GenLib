"use strict";

export function exponentialFit(
	n: number,  // number of x and y values
	x: number[], // dataset x, n values
	y: number[],  // dataset y, n values
	w: number[], // weights, n values
	ic: number[],  // 3 values integer
	cv: number[], // 4 values
	p: number[],  // 3 values
	rss: number,
	z: number[]  // n values
): { p: [number, number, number], rss: number } {
	const EPS1 = 1.0e-6; // epsilon 1
	const EPS2 = 1.0e-4; // epsilon 2
	const EXPMAX = 300.0;
	const MAXIT = 20;
	const ZERO = 0.0;
	const ONE = 1.0;
	const HALF = 0.5;
	const FIVE = 5.0;

	let iter: number,
		rssMax: number,
		rssMin: number,
		powMin: number,
		powNew: number;
	let xLoc: number,
		zBar: number,
		yBar: number,
		szz: number,
		szy: number,
		sw: number,
		b1: number,
		b0: number;

	// Preprocessing
	if (n <= 0 || w.some(weight => weight < ZERO)) {
		throw new Error("Invalid inputs.");
	}
	// check for valid parameters, find overall min and max of x
	let ndifx = 0,
		ifault = 5,
		Xmax0 = x[1],
		Xmin0 = Xmax0,
		xMaxP,
		xMinP;

	for (let i = 0; i < n; i++) {
		if (w[i] < 0)
			return;
		Xmax0 = Amax1(x[i], Xmax0);
		Xmin0 = Amin1(x[i], Xmin0);
		if (w[i] == 0)
			continue;
		// accumulate min and max with non-zero weights & check for
		// enough distinct values of this type
		if (ndifx == 0) {
			xMaxP = x[i];
			xMinP = xMaxP;
			ndifx = 1;
		} else if (x[i] != xMinP && x[i] != xMaxP) {
			ndifx++;
			xMaxP = Amax1(x[i], xMaxP);
			xMinP = Amin1(x[i], xMinP);
		}
	}
	//	if (n <= 0)
	ifault = 4;
	let npar = 3;
	for (let i = 0; i < 3; i++)
		npar--;
	if (ndifx < Max0(npar, 2))
		return;
	//	const xMaxP = Math.max(...x);
	//	const xMinP = Math.min(...x);
	let stepMx = 5.0 / (xMaxP - xMinP);

	const powMax = 0.5 * EXPMAX / Math.max(xMaxP - Math.min(...x), xMaxP, -xMinP);

	// Initialize power
	powNew = ic[2] === 0 ? 0 : cv[3];
	if (Math.abs(powNew) > powMax) {
		throw new Error("Power exceeds maximum limit.");
	}

	// Iterative fitting loop
	for (iter = 1; iter <= MAXIT; iter++) {
		zBar = ZERO;
		yBar = ZERO;
		szz = ZERO;
		szy = ZERO;
		sw = ZERO;
		xLoc = xMaxP;

		// Update transformed Z and accumulate sums
		for (let i = 0; i < n; i++) {
			if (ic[0] !== 0) {
				z[i] = Math.exp((x[i] - xLoc) * powNew);
			} else {
				z[i] = BXCX0(x[i] - xLoc, powNew);
			}

			const weight = w[i];
			if (weight > ZERO) {
				const zDiff = z[i] - zBar;
				const yDiff = y[i] - yBar;

				sw += weight;
				szz += zDiff * zDiff * weight;
				szy += zDiff * yDiff * weight;
			}
		}

		// Compute coefficients
		b1 = szy / szz;
		b0 = yBar - b1 * zBar;

		// Compute RSS
		const rssNew = y.reduce((sum, yi, i) => sum + Math.pow(yi - (b0 + b1 * z[i]), 2), 0);
		if (rssNew < rssMin) {
			rssMin = rssNew;
			powMin = powNew;
		}

		// Check convergence
		if (iter === MAXIT || Math.abs(rssNew - rssMin) < EPS1 * rssMax) {
			break;
		}

		// Update power
		powNew -= 0.1 * (rssNew - rssMin); // Simplified power update logic
	}

	return { p: [b0, b1, powMin], rss: rssMin };
}


function BXCX0(x: number, p: number) {
	const EPS = 1.0e-10;
	const XP = x * p;

	if (Math.abs(XP) >= 1.0) {
		return (Math.exp(XP) - 1) / p;
	}

	let term = 1.0;
	let series = 1.0;
	let AI = 1.0;

	while (Math.abs(term) > EPS) {
		AI += 1.0;
		term *= XP / AI;
		series += term;
	}
	return series * x;
}

function BXCX1(x: number, p: number) {
	const EPS = 1.0e-10;
	const XP = x * p;

	if (Math.abs(XP) >= 1.0) {
		return ((XP - 1) * Math.exp(XP) + 1) / (p * p);
	}

	let term = 0.5;
	let series = 0.5;
	let AI = 1.0;

	while (Math.abs(term) > EPS) {
		term *= (AI + 1) / AI / (AI + 2) * XP;
		series += term;
		AI += 1.0;
	}

	return series * (x * x);
}

function BXCX2(x: number, p: number): number {
	const EPS = 1.0e-10;
	const XP = x * p;

	if (Math.abs(XP) >= 1.0) {
		return (((XP - 2) * XP + 2) * Math.exp(XP) - 2) / (p * p * p);
	}

	let term = 1.0 / 3.0;
	let series = term;
	let AI = 1.0;

	while (Math.abs(term) > EPS) {
		term *= (AI + 2) / AI / (AI + 3) * XP;
		series += term;
		AI += 1.0;
	}
	return series * (x * x * x);
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
	const n = 10;
	const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const y = [2.3, 2.5, 3.0, 3.8, 4.1, 5.0, 5.5, 6.2, 7.1, 8.0];
	const w = Array(n).fill(1);
	const ic = [0, 0, 0];
	const cv = [0, 0, 0, 0];
	const p = [0, 0, 0];
	const rss = 0;
	const z = Array(n).fill(0);

	const result = exponentialFit(n, x, y, w, ic, cv, p, rss, z);
	console.log(result);
}