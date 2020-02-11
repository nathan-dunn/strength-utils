// inports
const findLastIndex = require('lodash/findLastIndex');
const find = require('lodash/find');
const uniqBy = require('lodash/uniqBy');

const constants = require('./constants');
const { DEFAULT_OPTIONS, LOADS, CHEAT_SHEET } = constants;

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

function findBase(lift, workWeight) {
  let barWeight = 45;
  if (workWeight < 90) barWeight = 25;
  if (workWeight < 50) barWeight = 15;

  let base = barWeight;

  const isDeadlift = ['DL', 'DEADLIFT'].includes(String(lift).toUpperCase());

  if (isDeadlift) {
    let riserPlates = 90;
    if ((barWeight + riserPlates) / workWeight > 0.5) riserPlates = 50;
    if ((barWeight + riserPlates) / workWeight > 0.5) riserPlates = 20;
    base = barWeight + riserPlates;
  }

  return base;
}

function handleWarmupErrors(lift, workWeight, method) {
  const lifts = ['SQ', 'PR', 'BP', 'DL', 'PC', 'OTHER'];
  if (!lifts.includes(String(lift).toUpperCase())) {
    throw new Error(
      `Error: You provided a lift of ${lift}. Valid lifts include: [${lifts}]`
    );
  }

  if (!workWeight) {
    throw new Error(
      `Error: You provided a workWeight of ${workWeight}.  Valid workWeights must be numbers greater than zero.`
    );
  }

  const methods = [1, 2, 3];
  if (!methods.includes(Number(method))) {
    throw new Error(
      `Error: You provided a method of ${method}. Valid methods include: [${methods}]`
    );
  }
}

function findLevel(loads, load) {
  const level = find(LOADS, obj => obj.load === load).level;
  return level;
}

function findBestLoad(range = [], weight) {
  const [low, high] = range;
  let index = -1;
  let level = 1;

  while (index < 0 && level <= 3) {
    index = findLastIndex(LOADS, obj => {
      return obj.level == level && obj.load >= low && obj.load <= high;
    });
    level++;
  }

  if (index > 0) {
    return LOADS[index].load;
  }

  // fallback
  return weight || roundTo(range[0] + range[1] / 2);
}

function findRange(weight, diff, cutOff = Infinity) {
  const lower = roundTo(weight - diff, 5, 'down');
  const upper = roundTo(weight + diff, 5, 'up');

  const range = [lower, Math.min(upper, cutOff)];
  return range;
}

function findWarmupsMethod1(lift, workWeight, options) {
  const base = findBase(lift, workWeight);
  const repsArr = [5, 3, 2];

  let exactLoads = [];

  const cheat = find(CHEAT_SHEET, {
    lift: String(lift).toUpperCase(),
    workWeight,
  });

  if (cheat) {
    exactLoads = cheat.warmups;
  } else {
    const diff = workWeight - base;
    let numberOfJumps = 4;
    let jump = diff / numberOfJumps;
    const maxJump = options.maxJump;

    while (jump > maxJump) {
      numberOfJumps++;
      jump = diff / numberOfJumps;
    }

    for (let i = 1; i < numberOfJumps; i++) {
      const last = exactLoads[exactLoads.length - 1] || base;
      const weight = roundTo(last + jump, 1);
      exactLoads.push(weight);
    }
  }

  const baseObj = {
    load: base,
    reps: 5,
    percentage: makePercentage(base / workWeight),
    level: findLevel(LOADS, base),
    sets: 2,
  };

  const warmupsWithoutBase = exactLoads.map((exactLoad, index) => {
    const range = findRange(exactLoad, 5, workWeight * 0.9);
    const load = cheat ? exactLoad : findBestLoad(range, exactLoad);
    const reps = repsArr[index] || 1;
    const percentage = makePercentage(load / workWeight);
    const level = findLevel(LOADS, load);
    const sets = 1;
    return { load, reps, percentage, level, sets };
  });

  const warmups = [baseObj, ...warmupsWithoutBase];
  return warmups;
}

function findWarmupsMethod2(lift, workWeight, options) {
  const base = findBase(lift, workWeight);
  const warmupPercentage = [0.45, 0.65, 0.85];
  const repsArr = [5, 3, 2];

  const exactLoads = warmupPercentage.map(perc => {
    return roundTo(workWeight * perc);
  });

  const baseObj = {
    load: base,
    reps: 5,
    percentage: makePercentage(base / workWeight),
    level: findLevel(LOADS, base),
    sets: 2,
  };

  const warmupsWithoutBase = exactLoads.map((exactLoad, index) => {
    const range = findRange(exactLoad, 5, workWeight * 0.9);
    const load = findBestLoad(range, exactLoad);
    const reps = repsArr[index] || 1;
    const percentage = makePercentage(load / workWeight);
    const level = findLevel(LOADS, load);
    const sets = 1;
    return { load, reps, percentage, level, sets };
  });

  const warmups = [baseObj, ...warmupsWithoutBase];
  return warmups;
}

function findWarmupsMethod3(lift, workWeight, options) {
  const base = findBase(lift, workWeight);
  const repsArr = [5, 3, 1];
  const lastSet = roundTo(workWeight * 0.9, 5, 'down');

  const loads = [lastSet];
  let range = [];

  for (let i = 0; i < 4; i++) {
    range = [
      roundTo(loads[0] - workWeight * 0.2),
      roundTo(loads[0] - workWeight * 0.15),
    ];

    if (base < range[0]) {
      const bestLoad = findBestLoad(range);
      loads.unshift(bestLoad);
    }
  }

  const baseObj = {
    load: base,
    reps: 5,
    percentage: makePercentage(base / workWeight),
    level: findLevel(LOADS, base),
    sets: 2,
  };

  const warmupsWithoutBase = loads.map((load, index) => {
    const reps = repsArr[index] || 1;
    const percentage = makePercentage(load / workWeight);
    const level = findLevel(LOADS, load);
    const sets = 1;
    return { load, reps, percentage, level, sets };
  });

  const warmups = [baseObj, ...warmupsWithoutBase];
  return warmups;
}

function findWarmups(
  lift = '',
  workWeight = 0,
  method = 1,
  options = DEFAULT_OPTIONS
) {
  handleWarmupErrors(lift, workWeight, method);

  let warmups = [];

  if (method === 1) {
    warmups = findWarmupsMethod1(lift, workWeight, options);
  } else if (method === 2) {
    warmups = findWarmupsMethod2(lift, workWeight, options);
  } else if (method === 3) {
    warmups = findWarmupsMethod3(lift, workWeight, options);
  }

  warmups = uniqBy(warmups.reverse(), 'load').reverse();

  return warmups;
}

// exports
module.exports = {
  loads: LOADS,
  findWarmups,
  calculateWeightNeeded,
  calculateRepsNeeded,
  calculateMax,
};
