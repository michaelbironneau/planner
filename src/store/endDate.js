/*global gantt*/
import "dhtmlx-gantt";

gantt.config.work_time = true;
//gantt.init("gantt_here");

/**
 * Calculate the "real" end date of a task including weekends.
 * @param {Task object} task
 */
export const getEndDate = task => {
  return gantt.calculateEndDate({
    start_date: new Date(task.start_date),
    duration: task.duration
  });
};
