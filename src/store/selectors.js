export const getTasks = store => store.tasks;

export const getLinks = store => store.links;

export const getTaskById = (store, id) => {
  return store.tasks.tasks.find(task => task.id === id);
};

export const getTasksMap = store => {
  const ret = {};
  store.tasks.tasks.forEach(task => {
    ret[task.id] = JSON.parse(JSON.stringify(task));
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
