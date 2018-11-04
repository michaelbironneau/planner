import data from "./testdata.json";

let nextTaskId = 1234;
let tasks = data.data;
let links = data.links;

export class LocalStore {
  loadStore = () => {
    return {
      tasks: tasks,
      links: links
    };
  };

  addTaskReturningId = task => {
    tasks.push({
      id: ++nextTaskId,
      task
    });
    return nextTaskId;
  };

  removeTaskById = taskId => {
    const index = tasks.findIndex(task => task.id == taskId);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  };

  updateTask = task => {
    const index = tasks.findIndex(task => task.id == task.id);
    if (index === -1) return false;
    tasks[index] = task;
    return true;
  };
}
