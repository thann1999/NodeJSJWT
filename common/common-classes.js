class FileColumn {
  constructor(name, type, analysis, description) {
    this.name = name;
    this.type = type;
    this.analysis = analysis;
    this.description = description;
  }
}

class ColumnAnalysis {
  constructor(
    valid,
    wrongType,
    missing,
    unique,
    timeValueAppearChunk,
    mostFrequently,
    percentageMostFrequently,
    max,
    variance,
    standardDeviation,
    mean,
    quartile,
    range,
    min
  ) {
    this.valid = valid;
    this.wrongType = wrongType;
    this.missing = missing;
    this.unique = unique;
    this.timeValueAppearChunk = timeValueAppearChunk;
    this.mostFrequently = mostFrequently;
    this.percentageMostFrequently = percentageMostFrequently;
    this.max = max;
    this.variance = variance;
    this.standardDeviation = standardDeviation;
    this.mean = mean;
    this.quartile = quartile;
    this.range = range;
    this.min = min;
  }
}

class Tags {
  constructor(name, datasetId) {
    this.name = name;
    this.datasets = [datasetId];
    this.datasetsLength = 1;
  }
}

class DatasetSummary {
  constructor(fileTypes) {
    this.fileTypes = fileTypes;
  }
}

module.exports = {
  FileColumn: FileColumn,
  Tags: Tags,
  DatasetSummary: DatasetSummary,
  ColumnAnalysis: ColumnAnalysis,
};
