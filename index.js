export const titleCase = str => {
  return str
    .split(" ")
    .map(word =>
      word
        .split("")
        .map((char, i) => (i === 0 ? char.toUpperCase() : char))
        .join("")
    )
    .join(" ");
};

export const longestWordInArray = arr => {
  return arr.reduce((maxLen, word) => {
    const len = word.word.length;
    return len > maxLen ? len : maxLen;
  }, 0);
};

export const roundTo = (number, round = 1, direction = "round") => {
  if (direction) return Number(Math[direction](number / round) * round);
};

export class Week {
  constructor(week) {
    this.week = week;
    this.exercises = [];
  }

  addExercise(day, rx, bullet, percentage = []) {
    if (day === "DAY") {
      console.error(`You forgot to change the day on week ${this.week}`);
      return;
    }
    const order = this.exercises.length;

    let lift = "";
    if (percentage.length) {
      if (rx.toLowerCase().includes("bench")) lift = "bench";
      else if (rx.toLowerCase().includes("press")) lift = "press";
      else if (rx.toLowerCase().includes("squat")) lift = "squat";
      else if (rx.toLowerCase().includes("deadlift")) lift = "deadlift";
      else console.warning("NO LIFT!!!", rx);
    }

    const exercise = {
      week: String(this.week),
      day,
      order,
      rx: String(rx),
      bullet,
      lift,
      percentage,
      instruction: null,
      key: `${this.week}${day}${order}`
    };
    this.exercises[order] = exercise;
  }

  addInstruction(message) {
    this.exercises.forEach(
      exercise =>
        (exercise.instruction = {
          week: this.week,
          message
        })
    );
  }
}

export const logWarmupPercentages = (lift, workWeight, warmups) => {
  warmups
    .split(", ")
    .map(wu => ((wu.slice(0, wu.indexOf("x")) / workWeight) * 100).toFixed(1));
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

export function boxMullerRandom() {
  let phase = false,
    x1,
    x2,
    w,
    z;

  return (function() {
    if ((phase = !phase)) {
      do {
        x1 = 2.0 * Math.random() - 1.0;
        x2 = 2.0 * Math.random() - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);

      w = Math.sqrt((-2.0 * Math.log(w)) / w);
      return x1 * w;
    } else {
      return x2 * w;
    }
  })();
}
