const blankTask = {
  text: "",
  type: "task",
  progress: 0
};

const blankUnscheduledTask = {
  text: "",
  type: "task",
  progress: 0,
  unscheduled: true
};

export const newTask = props => {
  if ((props.type ? props.type : "task") == "task" && !props.start_date) {
    return Object.assign({}, blankUnscheduledTask, props);
  }
  if (props.type == "project" && !props.start_date) {
    return Object.assign({}, blankUnscheduledTask, props);
  }
  console.log(props);
  return Object.assign({}, blankTask, props);
};
