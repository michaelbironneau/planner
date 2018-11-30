import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  CREATE_TASKS,
  LOAD_ALL_TASKS,
  SET_TASK_PROGRESS
} from "./actionTypes";
import { LocalStore } from "./localStorage";

const Store = new LocalStore();

export const createTask = task => {
  const id = Store.addTaskReturningId(task);
  if (!id) throw "Error creating task!";
  return {
    type: CREATE_TASK,
    payload: {
      id: id,
      ...task
    }
  };
};

export const setTaskProgress = (taskId, progress) => {
  Store.setTaskProgress(taskId, progress);
  return {
    type: SET_TASK_PROGRESS,
    payload: {
      id: taskId,
      progress: progress
    }
  };
};

export const createProject = projectAndTasks => {
  let { project, tasks } = projectAndTasks;

  const projectID = Store.addTaskReturningId(project);
  project.id = projectID;

  if (!projectID) throw "Error creating Project!";

  tasks.forEach((task, index) => {
    tasks[index].parent = projectID;
    const taskID = Store.addTaskReturningId(task);
    if (!taskID) throw "Error creating task!";
    tasks[index].id = taskID;
  });
  return {
    type: CREATE_TASKS,
    payload: [project, ...tasks]
  };
};

export const updateTask = task => {
  if (!Store.updateTask(task)) throw "Error updating task!";
  return {
    type: UPDATE_TASK,
    payload: task
  };
};

export const deleteTask = taskId => {
  if (!Store.removeTaskById(taskId)) throw "Error deleting task!";
  return {
    type: DELETE_TASK,
    payload: taskId
  };
};

export const loadAllTasks = () => {
  return {
    type: LOAD_ALL_TASKS,
    payload: Store.loadStore().tasks
  };
};
