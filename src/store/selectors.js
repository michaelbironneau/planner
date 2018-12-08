import * as moment from "moment";

import { getWorkloadInPeriod, getTaskCostsPerWeek } from "./kpis";

export const getTasks = store => JSON.parse(JSON.stringify(store.tasks));

export const getLinks = store => JSON.parse(JSON.stringify(store.links));

export const getUsers = store => JSON.parse(JSON.stringify(store.tasks.users));

export const getTaskById = (store, id) => {
  return store.tasks.tasks.find(task => task.id === id);
};

export const getUserById = (store, id) => {
  return store.tasks.users.find(user => user.id === id);
};

export const getTasksMap = store => {
  const ret = {};
  store.tasks.tasks.forEach(task => {
    ret[task.id] = JSON.parse(JSON.stringify(task));
  });
  return ret;
};

const isTaskBetween = (task, start, finish) => {
  if (moment(task.start_date).isAfter(finish)) {
    return false;
  }
  if (
    moment(task.start_date)
      .clone()
      .add(task.duration, "days")
      .isBefore(start)
  ) {
    return false;
  }

  return true;
};

// Get all tasks that are children (have no children of their own).
export const getAllChildTasks = (store, start, finish) => {
  let tasks = [];

  if (start === undefined) {
    tasks = getTasks(store).tasks;
  } else {
    tasks = getTasks(store).tasks.filter(task =>
      isTaskBetween(moment(start), moment(finish))
    );
  }

  let ret = [];

  ret = tasks.filter(task => {
    const child = tasks.find(childTask => childTask.parent === task.id);
    return child === undefined;
  });

  return ret;
};

export const getUserWorkload = (store, start, finish) => {
  const ret = {};

  const tasks = getAllChildTasks(store, start, finish);

  tasks.forEach(task => {
    if (ret[task.owner_id] === undefined) {
      ret[task.owner_id] = getWorkloadInPeriod(
        task.start_date,
        task.duration,
        start,
        finish
      );
    } else {
      ret[task.owner_id] += getWorkloadInPeriod(
        task.start_date,
        task.duration,
        start,
        finish
      );
    }
  });

  return ret;
};

export const getTasksForUser = (store, userId, start, finish) => {
  if (start && finish) {
    return store.tasks.tasks.filter(task => {
      const taskStart = new Date(task.start_date);
      const taskFinish = new Date(task.start_date); //copy
      taskFinish.setDate(taskFinish.getDate() + task.duration);
      return (
        task.owner_id === userId && taskStart >= start && finish <= taskFinish
      );
    });
  } else {
    return store.tasks.tasks.filter(task => task.owner_id === userId);
  }
};

export const getOwnerOfTask = (store, taskId) => {
  const task = store.tasks.tasks.find(task => task.id === taskId);
  if (task === undefined) return { text: "None" };
  return (
    store.tasks.users.find(user => user.id === task.owner_id) || {
      text: "None"
    }
  );
};

export const getTaskDisplayName = (store, taskId) => {
  const task = store.tasks.tasks.find(task => task.id === taskId);
  if (task === undefined) return "Unknown";
  if (!task.parent) return task.text;
  const parent = store.tasks.tasks.find((parent = parent.id === task.parent));
  return parent.text + " > " + task.text;
};
