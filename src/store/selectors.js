import * as moment from "moment";
import { getEndDate } from "./endDate";

import { getWorkloadInPeriod, getTaskCostsPerWeek } from "./kpis";

export const getTasks = store => JSON.parse(JSON.stringify(store.tasks));

export const getLinks = store => JSON.parse(JSON.stringify(store.links));

export const getUsers = store => JSON.parse(JSON.stringify(store.tasks.users));

export const getProjects = store =>
  JSON.parse(
    JSON.stringify(store.tasks.tasks.filter(task => task.type === "project"))
  );

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
  const parent = store.tasks.tasks.find(
    maybeParent => maybeParent.id === task.parent
  );
  return parent.text + " > " + task.text;
};

export const getProjectKPIs = (store, taskId) => {
  const projectTask = getTaskById(store, taskId);
  //0. Get project real start and end dates from project task
  let startDate = projectTask.start_date;
  let endDate = getEndDate(projectTask);

  //0. Get mean day rate in case any tasks are unscheduled
  const defaultOwner = {
    id: null,
    text: "Unassigned",
    rate: 0
  };

  if (store.tasks.users.length) {
    const sum = store.tasks.users.reduce(function(a, b) {
      return a + b.rate;
    }, 0);
    defaultOwner.rate = sum / store.tasks.users.length;
  }

  //1. Enumerate child tasks
  const children = {};

  store.tasks.tasks.forEach(task => {
    if (!task.parent) return;
    if (!children[task.parent]) {
      children[task.parent] = [task];
    } else {
      children[task.parent].push(task);
    }
  });

  //2. Now, find the ones that actually belong to the project
  const recurseToChildren = (childMap, key) => {
    let rootChildren = [];
    if (!childMap[key]) return rootChildren;
    childMap[key].forEach(child => {
      if (!childMap[child.id]) {
        rootChildren.push(child);
      } else {
        rootChildren = [
          ...rootChildren,
          ...recurseToChildren(childMap, child.id)
        ];
      }
    });
    return rootChildren;
  };

  const rootChildren = recurseToChildren(children, taskId);

  //2. Get stats
  const stats = rootChildren.map(child => {
    if (moment(child.start_date).isBefore(startDate))
      startDate = child.start_date;
    if (moment(getEndDate(child)).isAfter(endDate)) endDate = getEndDate(child);
    let owner = getOwnerOfTask(store, child.id);
    if (!owner.id) owner = defaultOwner;
    const taskStats = getTaskCostsPerWeek(child, owner, startDate, endDate);
    return {
      name: getTaskDisplayName(store, child.id),
      owner: owner,
      stats: taskStats
    };
  });

  //3. Format return
  const scheduling = {
    start: startDate,
    finish: endDate
  };

  return { scheduling, stats };
};
