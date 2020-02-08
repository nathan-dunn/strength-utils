// inports

const constants = require('./constants');
const { DEFAULT_OPTIONS, PLATES_EASY, LOADS_EASY, LOADS_PRECISE } = constants;

// helpers
function powerSet(arr) {
  let results = [null];

  for (let i = 0; i < arr.length; i++) {
    let len = results.length;
    for (let j = 0; j < len; j++) {
      results.push(arr[i] + results[j]);
    }
  }

  results.shift();
  results = results.sort((a, b) => (a < b ? -1 : 1));
  return results;
}

function nudgeWeight(load, precision, direction = 'flat') {
  let result;
  const originalWeight = load;

  let platesToUse = { ...plates, 5: 2, 2.5: 2 }; // default
  if (precision === 10) platesToUse = plates;
  else if (precision === 5) platesToUse = { ...plates, 5: 2 };
  else if (precision === 2.5) platesToUse = { ...plates, 5: 2, 2.5: 2 };
  else if (precision === 1.25)
    platesToUse = { ...plates, 5: 2, 2.5: 2, 1.25: 2 };
  else console.log('PRECISION options are: 10, 5, 2,5, 1.25');

  const loads = makePossibleLoads(platesToUse);

  const minLoad = loads[0];
  const maxLoad = loads[loads.length - 1];
  let counter = 0;

  //recursively move the wt up and down to find a matching easyload
  const recurse = (load, s = true) => {
    load = roundTo(load);
    //base cases
    if (loads.includes(load)) {
      result = load;
      return;
    } else if (load < minLoad) {
      result = roundTo(originalWeight, 2.5);
      return;
    } else if (load > maxLoad) {
      result = roundTo(originalWeight, 5);
      return;
    }

    //recursive cases
    if (direction === 'down') {
      load--;
      recurse(load);
    } else if (direction === 'up') {
      load++;
      recurse(load);
    } else if (direction === 'flat') {
      if (s) {
        counter++;
        recurse(load + counter, !s);
      } else if (!s) {
        counter++;
        recurse(load + counter * -1, !s);
      }
    }
  };

  recurse(load);

  return result;
}

function endsInFive(n) {
  return n % 10 === 5;
}

function isConvenient(n) {
  const convenient = makePossibleLoads(PLATES_EASY);
  return convenient.includes(n);
}

function makePercentage(percentage, places = 2) {
  return Number(percentage.toPrecision(places));
}

function roundTo(number, round = 1, direction = 'round') {
  const dir =
    direction === 'up' ? 'ceil' : direction === 'down' ? 'floor' : 'round';
  return Number(Math[dir](number / round) * round);
}

function calculateWeightNeeded(reps, max) {
  reps = Number(reps);
  max = Number(max);
  if (!reps || !max) return '';
  return roundTo(max / (reps * 0.033 + 1), 2.5, 'ceil');
}

function calculateRepsNeeded(weight, max) {
  weight = Number(weight);
  max = Number(max);
  if (!weight || !max) return '';
  if (weight > max) return 1;
  const result = roundTo((max - weight) / (weight * 0.033), 1, 'ceil');
  return result <= 0 ? '1*' : result;
}

function calculateMax(weight, reps) {
  weight = Number(weight);
  reps = Number(reps);
  if (!weight || !reps) return '';
  return roundTo(weight * reps * 0.033 + weight, 5, 'floor');
}

function makePossibleLoads(plates, barWeight = 45, cutOff = null) {
  const makePlatesArr = plates => {
    const results = [];

    for (let weight in plates) {
      for (let i = 0; i < plates[weight]; i++) {
        results.push(Number(weight));
      }
    }
    return results;
  };

  let results = [barWeight];
  const ps = powerSet(makePlatesArr(plates));

  for (let p of ps) {
    results.push(barWeight + 2 * p);
  }

  if (cutOff) {
    results = results.filter(result => result <= cutOff);
  }

  return Array.from(new Set(results));
}

function normalizeOptions(options) {
  const entries = Object.entries(options);
  const normalized = entries.map(entry => {
    let [key, value] = entry;
    key = key.toUpperCase();
    if (typeof value === 'string') value = value.toUpperCase();
    if (value === 'TRUE') value = true;
    if (value === 'FALSE') value = false;
    if (value == Number(value)) value = Number(value);

    return [key, value];
  });

  const normalizedOptions = Object.fromEntries(normalized);
  return normalizedOptions;
}

function findBarWeight(workWeight) {
  let barWeight = 45;
  if (workWeight < 90) {
    barWeight = 25;
  }
  return barWeight;
}

function findBase(workWeight, liftName) {
  const barWeight = findBarWeight(workWeight);
  let base = barWeight;

  const isDeadlift = ['DL', 'DEADLIFT'].includes(
    String(liftName).toUpperCase()
  );

  if (isDeadlift) {
    let riserPlates = 90;
    if ((barWeight + riserPlates) / workWeight > 0.5) riserPlates = 50;
    if ((barWeight + riserPlates) / workWeight > 0.5) riserPlates = 20;
    base = barWeight + riserPlates;
  }

  return base;
}

function findExactWeights(workWeight, base) {
  const exactWeights = [base, base];

  const diff = workWeight - base;
  let numberOfJumps = 4;
  let jump = diff / numberOfJumps;
  const maxJump = 90;

  while (jump > maxJump) {
    numberOfJumps++;
    jump = diff / numberOfJumps;
  }

  for (let i = 1; i < numberOfJumps; i++) {
    const last = exactWeights[exactWeights.length - 1];
    const weight = roundTo(last + jump, 1);
    exactWeights.push(weight);
  }

  return exactWeights;
}

function findLowAndHigh(weight, loads) {
  let low = null;
  let hi = null;

  for (let i = 0; i < loads.length; i++) {
    let load = loads[i];
    if (load > weight) {
      hi = load;
      if (i > 0) {
        low = loads[i - 1];
      }
      break;
    }
  }

  return [low, hi];
}

function findNearestLoad(weight, workWeight, last = false) {
  let nearestLoad = weight;

  const exactPercentage = weight / workWeight;
  const defaultRange = 0.05;
  const lowerPercentage = last ? 0.8 : exactPercentage - defaultRange;
  const upperPercentage = last ? 0.9 : exactPercentage + defaultRange;

  // let percentage = nearest / workWeight;
  let [low, high] = findLowAndHigh(weight, LOADS_EASY);
  nearestLoad = high - weight < weight - low ? high : low;
  const percentage = nearestLoad / weight;

  // TODO: - !!
  return nearestLoad;

  if (percentage >= lowerPercentage && percentage <= upperPercentage) {
    return nearestLoad;
  } else {
    [low, high] = findLowAndHigh(weight, LOADS_PRECISE);
    nearestLoad = high - weight < weight - low ? high : low;
    return nearestLoad;
  }
}

function findWarmups(workWeight, liftName = '', options = {}) {
  options = normalizeOptions({
    ...DEFAULT_OPTIONS,
    ...options,
    workWeight,
    liftName,
  });

  const base = findBase(workWeight, liftName);

  const exactWeights = findExactWeights(workWeight, base);

  const exactPercentages = exactWeights.map(weight =>
    makePercentage(weight / workWeight)
  );

  const repsArr = [5, 5, 5, 3, 2, 1];

  const roundedWeights = exactWeights.map((exactWeight, index, arr) => {
    const last = index === arr.length - 1;

    const weight = findNearestLoad(exactWeight, workWeight, last);
    return weight;
  });

  const roundedPercentages = roundedWeights.map(weight =>
    makePercentage(weight / workWeight)
  );

  const warmups = roundedWeights.map((weight, index) => {
    const reps = repsArr[index] || 1;
    const percentage = roundedPercentages[index];
    const exactWeight = exactWeights[index];
    const exactPercentage = exactPercentages[index];

    return { weight, reps, percentage, exactWeight, exactPercentage };
  });

  const text = `${liftName} ${warmups
    .map(warmup => `${warmup.weight}x${warmup.reps}`)
    .concat([`${workWeight}xRX`])
    .join(',')}`;

  return {
    warmups,
    text,
  };
}

// exports
module.exports = {
  findWarmups,
  calculateWeightNeeded,
  calculateRepsNeeded,
  calculateMax,
};
