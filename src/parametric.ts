"use strict";

interface parametricsValues {
	dataset: number[];
	count: number;
	min: number;
	max: number;
	sum: number;
	sum_squares: number;	// sum of X squared
	mean: number;
	mode: number | number[];
	median: number;
	stdevp: number;
	stdev: number;
	variance: number;
	var: number;
	range: number;
	interquartileRange: number;
	iqr: number;
	skewness: number;
	kurtosis: number;
	diffXfromMeanSquared: number;
}

export class Parametrics {
	datasetX: number[];
	datasetY: number[];
	private parametrics: parametricsValues[] = [];
	private XYparametrics: {
		sumXY: number;
		correlation: number;
		covariance: number;
		slope: number;
		intercept: number;
		sumsq_residuals: number;
		sumsq_regression: number;
	} = {
		sumXY: NaN,
		correlation: NaN,
		covariance: NaN,
		slope: NaN,
		intercept: NaN,
		sumsq_residuals: NaN,
		sumsq_regression: NaN
	};

	constructor(datasetX: number[], datasetY?: number[]) {
		this.datasetX = datasetX;
		this.datasetY = datasetY ?? [];
		this.processDatasets();
	}

	private processDatasets(): void {
		if (this.datasetX.length > 0)
			this.analyzeDataset(this.datasetX, 0);
		if (this.datasetY.length > 0)
			this.analyzeDataset(this.datasetY, 1);
		if (this.datasetX.length > 0 && this.datasetY.length > 0)
			this.analyzePairedDatasets();
	}

	/**
	 *
	 * @param dataset
	 * @param index  number = 0: X dataset, = 1: Y dataset
	 */
	private analyzeDataset(dataset: number[], index: 0 | 1): void {
		// index sets whether X or Y dataset
		const sorted = dataset.sort((a: number, b: number) => {
			return a > b ? 1 : a < b ? -1 : 0;  
		});
		const selected = this.parametrics[index];
		selected.dataset = dataset;
		selected.count = dataset.length;
		selected.min = Math.min(...dataset);
		selected.max = Math.max(...dataset);
		selected.sum = 0;
		selected.sum_squares = 0;
		for (let i = 0; i < dataset.length; i++) {
			selected.sum += dataset[i];
			selected.sum += dataset[i] * dataset[i];
		}
		this.parametrics[index].sum_squares = selected.sum_squares;
		this.parametrics[index].mean = selected.sum / dataset.length;
		this.parametrics[index].diffXfromMeanSquared = 0;
		for (let i = 0; i < dataset.length; i++) {
			const diffXfromMean = dataset[i] - this.parametrics[index].mean;
			this.parametrics[index].diffXfromMeanSquared += diffXfromMean * diffXfromMean;
		}
		this.parametrics[index].variance = this.parametrics[index].diffXfromMeanSquared / dataset.length;
		this.parametrics[index].var = this.parametrics[index].variance;
		this.parametrics[index].stdevp = Math.sqrt(this.parametrics[index].var);
		this.parametrics[index].stdev = Math.sqrt(this.parametrics[index].diffXfromMeanSquared / (dataset.length - 1));
		let cubedDeviation = 0,
			quadDeviation = 0;
		for (let i = 0; i < dataset.length; i++) {
			const zValue = (dataset[i] - this.parametrics[index].mean) / this.parametrics[index].stdevp;
			cubedDeviation += Math.pow(zValue, 3);
			quadDeviation += Math.pow(zValue, 4);
		}
		this.parametrics[index].skewness = cubedDeviation / dataset.length;
		this.parametrics[index].kurtosis = quadDeviation / dataset.length - 3;
		const setidx = Math.floor(dataset.length / 2);
		this.parametrics[index].median = sorted.length % 2 == 1 ?
			sorted[setidx] : (sorted[setidx] + sorted[setidx + 1]) / 2;
		this.parametrics[index].range = selected.max - selected.min;
		this.parametrics[index].mode = this.datasetMode(dataset);
	}

	private analyzePairedDatasets(): void {
		//if (this.parametrics[0].count == 0 || this.parametrics[0].count != this.parametrics[1].count)
		//	throw "requires X,Y paired datasets of more than 1 count and equal correspondiing values";
		const setX = this.parametrics[0],
			setY = this.parametrics[1];
		let sumXY = 0.0,
			covariance = 0.0,
			sumsq_residuals = 0.0,
			sumsq_regression = 0.0;

		for (let i = 0; i < setX.count; i++) {
			sumXY += setX.dataset[i] * setY.dataset[i];
			covariance += (setX.dataset[i] - setX.mean) * (setY.dataset[i] - setY.mean);
		}
		this.XYparametrics.sumXY = sumXY;
		this.XYparametrics.covariance = covariance;
		this.XYparametrics.correlation = covariance / (setX.stdev * setY.stdev);
		if (this.XYparametrics.correlation > 1.0) this.XYparametrics.correlation = 1.0;
		if (this.XYparametrics.correlation < -1.0) this.XYparametrics.correlation = -1.0;
		this.XYparametrics.slope = covariance / setX.diffXfromMeanSquared;
		this.XYparametrics.intercept = setY.mean - this.XYparametrics.slope * setX.mean;
		for (let i = 0; i < setX.count; i++) {
			const residual = setY.dataset[i] - (this.XYparametrics.slope * setX.dataset[i] + this.XYparametrics.intercept);
			sumsq_residuals += residual * residual;
			const regression = this.XYparametrics.slope * setX.dataset[i] + this.XYparametrics.intercept - setY.mean;
			sumsq_regression += regression * regression;
		}
		this.XYparametrics.sumsq_residuals = sumsq_residuals;
		this.XYparametrics.sumsq_regression = sumsq_regression;
	}

	private datasetMode (dataset: number[]): number | number[] {
		const frequencyMap: Record<number, number> = {};
		dataset.forEach(num => {  // Build frequency map
			frequencyMap[num] = (frequencyMap[num] || 0) + 1;
		});

		// Find the maximum frequency
		let maxFrequency = 0;
		let modes: number[] = [];
		for (const [key, value] of Object.entries(frequencyMap)) {
			if (value > maxFrequency) {
				maxFrequency = value;
				modes = [Number(key)];
			} else if (value === maxFrequency) {
				modes.push(Number(key));
			}
		}
		return modes.length === 1 ? modes[0] : modes; // Single mode or array of modes
	}
}