import * as moment from "moment";

/**
 * Calculate the workload in period
 * @param {start of task, moment compatible} taskStart
 * @param {duration of task} taskDuration
 * @param {start of period, moment compatible} periodStart
 * @param {finish of period, moment compatible} periodFinish
 */
export const getWorkloadInPeriod = (
  taskStart,
  taskDuration,
  periodStart,
  periodFinish
) => {
  if (!taskStart || !taskDuration || !periodStart || !periodFinish) return 0;
  let taskStartInPeriod = moment.max(taskStart, periodStart);
  let taskFinishInPeriod = moment.min(
    moment(taskStart).add(taskDuration * 24, "hours"),
    periodFinish
  );
  if (moment(taskFinishInPeriod).isBefore(taskStartInPeriod)) return 0; //this would arise if the task is not, in fact in period
  return (
    Math.round(10 * taskFinishInPeriod.diff(taskStartInPeriod, "days", true)) /
    10
  );
};

/**
 * Returns the fraction of task that lies in the week starting at weekStart.
 * @returns a number between 0 and 1.
 */
const apportionTaskToWeek = (task, weekStart) => {
  const finish = moment(weekStart)
    .clone()
    .add(5, "days"); //work week is 5 days
  const apportionedWorkload = getWorkloadInPeriod(
    moment(task.start_date),
    task.duration,
    moment(weekStart),
    finish
  );
  return Math.min(1, apportionedWorkload / 5); //5 working days per week
};

/**
 * Calculates task costs for each week of the task.
 * @param {Task object} task
 * @param {User object for the task owner} taskOwner
 */
export const getTaskCostsPerWeek = (task, taskOwner) => {
  const start = moment(task.start_date).startOf("week");
  const finish = moment(task.start_date).add(24 * task.duration, "hours");
  const ret = [];
  let current = start;
  while (current.isBefore(finish)) {
    const frac = apportionTaskToWeek(task, current);
    ret.push({
      weekStart: current.clone(),
      internalCost: frac * (taskOwner.rate || 0),
      externalCost: frac * (task.external_cost || 0),
      apportionedDuration: frac * task.duration
    });
    current.add(1, "week"); //Moment mutates the object. Caveat emptor.
  }
  return ret;
};
