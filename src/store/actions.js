import firebase from "firebase";

import config from "./firebaseConfig";

import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  CREATE_TASKS,
  LOAD_ALL_TASKS,
  SET_TASK_PROGRESS
} from "./actionTypes";

firebase.initializeApp(config);
const databaseRef = firebase.database().ref();
const tasksRef = databaseRef.child("data");
const linksRef = databaseRef.child("links");
const usersRef = databaseRef.child("users");

export const createTask = task => {
  tasksRef.push().set(task);
};

export const setTaskProgress = (taskId, progress) => {
  tasksRef.child(taskId).update({
    progress: progress
  });
};

export const createProject = projectAndTasks => {
  let { project, tasks } = projectAndTasks;

  const projectID = tasksRef.push(project).key;
  project.id = projectID;

  tasks.forEach((task, index) => async dispatch => {
    tasks[index].parent = projectID;
    tasksRef.push(task);
  });
};

export const updateTask = task => async dispatch => {
  tasksRef.child(task.id).update(task);
};

export const deleteTask = taskId => async dispatch => {
  tasksRef.child(taskId).remove();
};

let fetching = false;
export const fetchTasks = () => async dispatch => {
  if (fetching) {
    console.warn("Already fetching");
    return;
  }
  fetching = true;
  console.log("Fetch tasks instance");

  const ref = firebase
    .database()
    .ref("/data")
    .orderByChild("start_date")
    .limitToLast(1000);
  ref.on("child_added", function(data) {
    dispatch({
      type: CREATE_TASK,
      payload: {
        ...data.val(),
        id: data.key
      }
    });
    //console.log("Add", data.key, data.val());
  });

  ref.on("child_changed", function(data) {
    dispatch({
      type: UPDATE_TASK,
      payload: {
        ...data.val(),
        id: data.key
      }
    });
    //console.log("Update", data.key, data.val());
  });

  ref.on("child_removed", function(data) {
    dispatch({
      type: DELETE_TASK,
      payload: data.key
    });
    //console.log("Removed", data.key);
  });
};
