import { CREATE_TASK, UPDATE_TASK, DELETE_TASK } from "./actionTypes";
import { addTaskReturningId, updateTask, removeTaskById } from "./localStorage";

export const createTask = task => {
  const id = addTaskReturningId(task);
  if (!id) throw "Error creating task!";
  return {
    type: CREATE_TASK,
    payload: {
      id: id,
      task
    }
  };
};

export const updateTask = task => {
  if (!updateTask(task)) throw "Error updating task!";
  return {
    type: UPDATE_TASK,
    payload: task
  };
};

export const DELETE_TASK = taskId => {
  if (!removeTaskById(taskId)) throw "Error deleting task!";
  return {
    type: DELETE_TASK,
    payload: taskId
  };
};
