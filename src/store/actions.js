import firebase from "firebase";

import config from "./firebaseConfig";

import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  CREATE_LINK,
  UPDATE_LINK,
  DELETE_LINK
} from "./actionTypes";

firebase.initializeApp(config);
const databaseRef = firebase.database().ref();
const tasksRef = databaseRef.child("data");
const linksRef = databaseRef.child("links");
const usersRef = databaseRef.child("users");

export const createTask = task => async dispatch => {
  const toInsert = Object.assign({}, task);
  delete toInsert["id"]; //otherwise this creates two tasks - one with local ID and one with remote ID...
  const newTaskRef = tasksRef.push(toInsert);
  return newTaskRef.key;
};

export const createLink = link => async dispatch => {
  const toInsert = Object.assign({}, link);
  delete toInsert["id"]; //otherwise this creates two links - one with local ID and one with remote ID...
  linksRef.push().set(toInsert);
};

export const setTaskProgress = (taskId, progress) => async dispatch => {
  tasksRef.child(taskId).update({
    progress: progress
  });
};

export const createProject = projectAndTasks => async dispatch => {
  let { project, tasks } = projectAndTasks;

  const projectID = tasksRef.push(project).key;
  project.id = projectID;

  tasks.forEach((task, index) => async dispatch => {
    tasks[index].parent = projectID;
    tasksRef.push(task);
  });
};

export const updateLink = link => async dispatch => {
  linksRef.child(link.id).update(link);
};

export const updateTask = task => async dispatch => {
  tasksRef.child(task.id).update(task);
};

export const deleteLink = linkId => async dispatch => {
  linksRef.child(linkId).remove();
};

export const deleteTask = taskId => async dispatch => {
  tasksRef.child(taskId).remove();
};

let fetchingTasks = false;
export const fetchTasks = () => async dispatch => {
  if (fetchingTasks) {
    console.warn("Already fetching tasks");
    return;
  }
  fetchingTasks = true;
  console.log("Fetch tasks instance");

  const ref = tasksRef;
  ref.on("child_added", function(data) {
    dispatch({
      type: CREATE_TASK,
      payload: {
        ...data.val(),
        id: data.key
      }
    });
  });

  ref.on("child_changed", function(data) {
    dispatch({
      type: UPDATE_TASK,
      payload: {
        ...data.val(),
        id: data.key
      }
    });
  });

  ref.on("child_removed", function(data) {
    dispatch({
      type: DELETE_TASK,
      payload: data.key
    });
  });
};

let fetchingLinks = false;
export const fetchLinks = () => async dispatch => {
  if (fetchingLinks) {
    console.warn("Already fetching links");
    return;
  }
  fetchingLinks = true;
  console.log("Fetch links instance");

  const ref = linksRef;
  ref.on("child_added", function(data) {
    dispatch({
      type: CREATE_LINK,
      payload: {
        ...data.val(),
        id: data.key
      }
    });
  });

  ref.on("child_changed", function(data) {
    dispatch({
      type: UPDATE_LINK,
      payload: {
        ...data.val(),
        id: data.key
      }
    });
  });

  ref.on("child_removed", function(data) {
    dispatch({
      type: DELETE_LINK,
      payload: data.key
    });
  });
};
