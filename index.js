// inports
const { find, findLast } = require('lodash');

const constants = require('./constants');
const { DEFAULT_OPTIONS, LOADS } = constants;

// helpers
function endsInFive(n) {
  return n % 10 === 5;
}

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

function roundToNearestFive(number, direction = 'round') {
  const dir =
    direction === 'up' ? 'ceil' : direction === 'down' ? 'floor' : 'round';

  let nearestRound = null;
  let nearestUp = Math[dir](number);
  let nearestDown = Math[dir](number);

  while (!endsInFive(nearestUp) || !endsInFive(nearestDown)) {
    if (!endsInFive(nearestUp)) {
      nearestUp += 1;
    } else if (nearestRound === null) {
      nearestRound = nearestUp;
    }

    if (!endsInFive(nearestDown)) {
      nearestDown -= 1;
    } else if (nearestRound === null) {
      nearestRound = nearestDown;
    }
  }

  if (direction === 'up') return nearestUp;
  else if (direction === 'down') return nearestDown;
  else return nearestRound;
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

function findLastWarmup(workWeight) {
  return findLast(
    LOADS,
    obj => obj.load < workWeight * 0.9 && endsInFive(obj.load)
  );
}

function findWarmups(lift = '', workWeight = 0) {
  const isDeadlift = ['DL', 'DEADLIFT'].includes(String(lift).toUpperCase());
  const workWeightRounded = roundTo(workWeight, 5, 'down');

  // limits
  let nullObj = { lift, workWeight, warmups: [] };
  if (isDeadlift && workWeightRounded < 95) return nullObj;
  else if (!isDeadlift && workWeight < 65) return nullObj;
  if (workWeightRounded > 1000) return nullObj;

  let warmups = [];
  let bar = isDeadlift ? 135 : 45;
  let acceptableLoadEase = [1];
  let setLimit = 10;
  let jump = roundTo(workWeightRounded * 0.1, 5, 'up');

  if (isDeadlift && jump > 90) jump = 90;
  else if (!isDeadlift && jump > 40 && jump <= 90) jump = 40;
  else if (!isDeadlift && jump > 90) jump = 90;

  // adjustments
  if (isDeadlift) {
    if (workWeightRounded <= 245) {
      setLimit = 2;
      acceptableLoadEase = [1, 2];
    }

    if (workWeightRounded <= 225 && workWeightRounded > 215) {
      acceptableLoadEase = [1, 2, 3];
    }

    if (workWeightRounded <= 215 && workWeightRounded > 165) {
      acceptableLoadEase = [1];
    }

    if (workWeightRounded <= 145) {
      jump = 10;
      acceptableLoadEase = [1, 2, 3];
    }

    if (workWeightRounded < 225) {
      bar = 95;
    }

    if (workWeightRounded < 135) {
      bar = 65;
    }
  } else if (!isDeadlift) {
    if (workWeightRounded <= 165) {
      setLimit = 3;
      acceptableLoadEase = [1, 2];
    }

    if (workWeightRounded <= 115) {
      jump = 10;
    }

    if (workWeightRounded < 115) {
      acceptableLoadEase = [1, 2, 3];
    }

    if (workWeightRounded <= 75) {
      bar = 25;
    }

    if (workWeightRounded <= 55) {
      bar = 15;
    }
  }

  // establist last warmup ~ 90%
  const lastWarmup = findLastWarmup(workWeight);
  warmups.push(lastWarmup);

  // fill in backwards until you get to the bar
  while (warmups[0].load > bar) {
    const load = findLast(LOADS, obj => {
      const limit = warmups[0].load - jump;
      return (
        obj.load <= limit &&
        acceptableLoadEase.includes(obj.ease) &&
        endsInFive(obj.load)
      );
    });

    if (load && load.load > bar && warmups.length < setLimit) {
      warmups.unshift(load);
    } else {
      break;
    }
  }

  // add percentages
  warmups = warmups.map(obj => {
    return { ...obj, percentage: makePercentage(obj.load / workWeight) };
  });

  // cut out the super light weights unless there aren't enough sets
  if (warmups.length > 4) {
    warmups = warmups.filter(obj => {
      return obj.percentage >= 0.45 || obj.load >= isDeadlift
        ? 135
        : 45 || obj.base;
    });
  }

  // add the reps
  warmups = warmups.map((obj, index) => {
    let reps = 1;
    if (index === 0) reps = 5;
    if (index === 1) reps = 3;
    if (index === 2 && obj.percentage <= 0.85) reps = 2;

    return { ...obj, reps };
  });

  // add the bar/base warmups to the front
  const barObj = find(LOADS, { load: bar });
  const warmupObj = {
    ...barObj,
    percentage: makePercentage(barObj.load / workWeight),
    reps: 5,
    base: true,
  };
  warmups.unshift(warmupObj);
  if (!isDeadlift) warmups.unshift(warmupObj);

  // final return
  return {
    lift,
    workWeight,
    sets: warmups.length,
    jump,
    acceptableLoadEase,
    warmups,
  };
}

// exports
module.exports = {
  loads: LOADS,
  findWarmups,
  calculateWeightNeeded,
  calculateRepsNeeded,
  calculateMax,
};
