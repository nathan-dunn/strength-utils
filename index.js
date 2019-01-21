// imports
const indexOf = require("lodash/indexOf");
const lastIndexOf = require("lodash/lastIndexOf");

// helpers
const plates = {
  45: 10,
  25: 1
};

const roundTo = (number, round = 2.5, direction) => {
  const dir =
    direction === "up" ? "ceil" : (direction = "down" ? "floor" : "round");
  return Number(Math[direction](number / round) * round);
};

const powerSet = arr => {
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
};

const makePossibleLoads = (plates, barWeight = 45) => {
  const makePlatesArr = plates => {
    const results = [];

    for (let weight in plates) {
      for (let i = 0; i < plates[weight]; i++) {
        results.push(Number(weight));
      }
    }
    return results;
  };

  const results = [barWeight];
  const ps = powerSet(makePlatesArr(plates));

  for (let p of ps) {
    results.push(barWeight + 2 * p);
  }

  return Array.from(new Set(results));
};

const nudgeWeight = (load, precision, direction = "flat") => {
  let result;
  const originalWeight = load;

  let platesToUse = { ...plates, 5: 2, 2.5: 2 }; // default
  if (precision === 10) platesToUse = plates;
  else if (precision === 5) platesToUse = { ...plates, 5: 2 };
  else if (precision === 2.5) platesToUse = { ...plates, 5: 2, 2.5: 2 };
  else if (precision === 1.25)
    platesToUse = { ...plates, 5: 2, 2.5: 2, 1.25: 2 };
  else console.log("PRECISION options are: 10, 5, 2,5, 1.25");

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
    if (direction === "down") {
      load--;
      recurse(load);
    } else if (direction === "up") {
      load++;
      recurse(load);
    } else if (direction === "flat") {
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
};

const checkWorkWeight = workWeight => {
  if (workWeight < 20 || isNaN(workWeight / 1)) {
    throw new Error("Must provide valid workWeight > 20");
  }
};

const combineLoadsAndReps = (loads, reps) => {
  if (!reps || !reps.length) return loads;

  const uniqueIndices = [];
  for (let i = 0; i < loads.length; i++) {
    const idx = indexOf(loads, loads[i]);
    if (!uniqueIndices.includes(idx)) uniqueIndices.push(idx);
  }

  const uniqueLoadsAndReps = uniqueIndices.map(uniqueIndex => {
    return `${loads[uniqueIndex]}x${reps[uniqueIndex]}`;
  });

  return uniqueLoadsAndReps;
};

const makeWarmupObj = (weight, workWeight, extra) => {
  const percentage = (weight / workWeight).toFixed(2);
  const reps =
    percentage <= 0.7 ? 5 : percentage <= 0.8 ? 3 : percentage <= 0.9 ? 2 : 1;

  const obj = {
    weight,
    reps,
    percentage
  };

  return Object.assign({}, obj, extra && { [extra]: extra });
};

const endsInFive = n => n % 10 === 5;

const nearestFive = weight => {
  if (!weight) return weight;
  weight = Math.round(weight);
  if (endsInFive(weight)) return weight;

  let upper = weight;
  let lower = weight;

  do {
    upper++;
    lower--;
  } while (!endsInFive(upper) && !endsInFive(lower));

  return endsInFive(upper) ? upper : lower;
};

// exports
export const roundTo = (number, round = 1, direction = "round") => {
  if (direction) return Number(Math[direction](number / round) * round);
};

export const calculateWeight = (reps, max) => {
  reps = Number(reps);
  max = Number(max);
  if (!reps || !max) return "";
  return roundTo(max / (reps * 0.033 + 1), 2.5, "ceil");
};

export const calculateReps = (weight, max) => {
  weight = Number(weight);
  max = Number(max);
  if (!weight || !max) return "";
  if (weight > max) return 1;
  const result = roundTo((max - weight) / (weight * 0.033), 1, "ceil");
  return result <= 0 ? "1*" : result;
};

export const calculateMax = (weight, reps) => {
  weight = Number(weight);
  reps = Number(reps);
  if (!weight || !reps) return "";
  return roundTo(weight * reps * 0.033 + weight, 5, "floor");
};

export const warmupIntensity = workWeight => {
  checkWorkWeight(workWeight);
  const percentages = [0.44, 0.55, 0.66, 0.77, 0.88];
  const reps = [5, 4, 3, 2, 1];

  const loads = percentages.map(percentage => workWeight * percentage);
  const nudgedLoads = loads.map(load => nearestFive(load));
  const warmups = nudgedLoads.map((weight, i) => {
    return {
      weight,
      reps: reps[i],
      percentage: Number((weight / workWeight).toPrecision(2))
    };
  });
  return warmups;
};

export const warmupVolume = workWeight => {
  checkWorkWeight(workWeight);
  const reps = [4, 2];
  const percentages = [0.6, 0.8];
  const loads = percentages.map(percentage => {
    return nudgeWeight(workWeight * percentage, percentage >= 0.9);
  });
  return combineLoadsAndReps(loads, reps);
};

export const warmupEasy = workWeight => {
  checkWorkWeight(workWeight);
  const reps = [5, 3, 2];
  const percentages = [0.5, 0.75, 0.85];
  const loads = percentages.map(percentage => {
    return nudgeWeight(workWeight * percentage, percentage >= 0.9);
  });
  return combineLoadsAndReps(loads, reps);
};

export const warmupSteps = (workWeight, precision = 5) => {
  const platesModerate = {
    ...plates,
    35: 1,
    10: 1
  };

  let loads = makePossibleLoads(platesEasy, 135)
    .filter(load => load <= workWeight * 0.95)
    .map((weight, i) => {
      const percentage = weight / workWeight;
      return makeWarmupObj(weight, workWeight);
    });

  let lightLoads = makePossibleLoads(platesModerate, 45)
    .filter(load => load <= workWeight * 0.95)
    .map((weight, i) => {
      const percentage = weight / workWeight;
      return makeWarmupObj(weight, workWeight);
    });

  // ADDING TO THE BACK
  const lastLoad = loads.length ? loads[loads.length - 1] : {};

  if (lastLoad.percentage <= 0.75) {
    const weight_1 = roundTo(workWeight * 0.85, 5, "round");
    loads = [...loads, makeWarmupObj(weight_1, workWeight, "*")];
  }

  if (lastLoad.percentage <= 0.88) {
    const weight = roundTo(workWeight * 0.95, 5, "down");
    loads = [...loads, makeWarmupObj(weight, workWeight, "*")];
  }

  // ADDING TO THE FRONT
  switch (loads.length) {
    case 0:
      return lightLoads;
      return [
        makeWarmupObj(roundTo(workWeight * 0.6, 5), workWeight, "*"),
        makeWarmupObj(roundTo(workWeight * 0.7, 5), workWeight, "*"),
        makeWarmupObj(roundTo(workWeight * 0.8, 5), workWeight, "*"),
        makeWarmupObj(roundTo(workWeight * 0.9, 5), workWeight, "*")
      ]; // TO DO
    case 1:
      return [
        makeWarmupObj(65, workWeight, "*"),
        makeWarmupObj(95, workWeight, "*"),
        makeWarmupObj(115, workWeight, "*"),
        ...loads
      ];
    case 2:
      return [
        makeWarmupObj(95, workWeight, "*"),
        makeWarmupObj(115, workWeight, "*"),
        ...loads
      ];
    case 3:
      return [makeWarmupObj(95, workWeight, "*"), ...loads];
    default:
      return loads;
  }
};

// testing
// console.log(warmupIntensity(320));
