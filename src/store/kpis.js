import * as moment from "moment";

import { getEndDate } from "./endDate";

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
    moment(getEndDate({ start_date: taskStart, duration: taskDuration })),
    periodFinish
  );
  if (moment(taskFinishInPeriod).isBefore(taskStartInPeriod)) return 0; //this would arise if the task is not, in fact in period
  return (
    Math.round(10 * taskFinishInPeriod.diff(taskStartInPeriod, "days", true)) /
    10
  );
};

/**
 * Returns the duration of the task that lies in the week starting at weekStart.
 * @returns a number less than task.duration.
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
  return apportionedWorkload;
};

/**
 * Calculates task costs for each week of the task.
 * @param {Task object} task
 * @param {User object for the task owner} taskOwner
 */
export const getTaskCostsPerWeek = (
  task,
  taskOwner,
  projectStart,
  projectFinish
) => {
  const start = moment(projectStart).startOf("isoWeek");
  const finish = moment(projectFinish)
    .startOf("isoWeek")
    .add(1, "week");
  const ret = [];
  let current = start;
  while (current.isBefore(finish)) {
    const frac = apportionTaskToWeek(task, current);
    const duration = task.duration === 0 ? 1 : task.duration;
    ret.push({
      weekStart: current.clone().week(),
      internalCost: frac * (taskOwner.rate || 0),
      externalCost: (frac / duration) * (task.external_cost || 0),
      chargeableRate: frac * (taskOwner.chargeableRate || 0),
      apportionedDuration: frac
    });
    current.add(1, "week"); //Moment mutates the object. Caveat emptor.
  }
  return ret;
};
