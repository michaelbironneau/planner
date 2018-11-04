let nextTaskId = 0;
let tasks = [];
let links = [];
let users = [];

// Add new task and return its ID
export const addTaskReturningId = task => {
  tasks.push({
    id: ++nextTaskId,
    task
  });
  return nextTaskId;
};

// Remove task given ID. Return true if successful.
export const removeTaskById = taskId => {
  const index = tasks.findIndex(task => task.id == taskId);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};

// Update task. Returns true if successful.
export const updateTask = task => {
  const index = tasks.findIndex(task => task.id == task.id);
  if (index === -1) return false;
  tasks[index] = task;
  return true;
};
