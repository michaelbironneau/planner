import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  LOAD_ALL_TASKS,
  CREATE_TASKS,
  SET_TASK_PROGRESS,
  CREATE_LINK,
  UPDATE_LINK,
  DELETE_LINK,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  SET_CURRENT_USER
} from "../actionTypes";

const initialState = {
  tasks: [],
  links: [],
  users: [],
  currentUser: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return JSON.parse(
        JSON.stringify({
          currentUser: action.payload,
          tasks: state.tasks,
          links: state.links,
          users: state.users
        })
      );
    case CREATE_LINK:
      return JSON.parse(
        JSON.stringify({
          tasks: state.tasks,
          links: [...state.links, action.payload],
          users: state.users,
          currentUser: state.currentUser
        })
      );
    case CREATE_TASK:
      return JSON.parse(
        JSON.stringify({
          tasks: [...state.tasks, action.payload],
          links: state.links,
          users: state.users,
          currentUser: state.currentUser
        })
      );
    case CREATE_USER:
      return JSON.parse(
        JSON.stringify({
          users: [...state.users, action.payload],
          links: state.links,
          tasks: state.tasks,
          currentUser: state.currentUser
        })
      );

    case SET_TASK_PROGRESS:
      let index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index === -1) {
        console.warn(
          "SET_TASK_PROGRESS failed with unknown ID",
          action.payload.id
        );
        return JSON.parse(JSON.stringify(state));
      }
      state.tasks[index].progress = action.payload.progress;
      return {
        tasks: JSON.parse(JSON.stringify(state.tasks)),
        links: JSON.parse(JSON.stringify(state.links)),
        users: JSON.parse(JSON.stringify(state.users)),
        currentUser: state.currentUser
      };
    case UPDATE_TASK:
      index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index === -1) {
        console.warn("UPDATE_TASK failed with unknown ID", action.payload.id);
        return JSON.parse(JSON.stringify(state));
      }
      state.tasks[index] = action.payload;
      return {
        tasks: JSON.parse(JSON.stringify(state.tasks)),
        links: JSON.parse(JSON.stringify(state.links)),
        users: JSON.parse(JSON.stringify(state.users)),
        currentUser: state.currentUser
      };
    case UPDATE_LINK:
      index = state.links.findIndex(link => link.id === action.payload.id);
      if (index === -1) {
        console.warn("UPDATE_LINK failed with unknown ID", action.payload.id);
        return JSON.parse(JSON.stringify(state));
      }
      state.links[index] = action.payload;
      return {
        tasks: JSON.parse(JSON.stringify(state.tasks)),
        links: JSON.parse(JSON.stringify(state.links)),
        users: JSON.parse(JSON.stringify(state.users)),
        currentUser: state.currentUser
      };
    case UPDATE_USER:
      index = state.users.findIndex(user => user.id === action.payload.id);
      if (index === -1) {
        console.warn("UPDATE_USER failed with unknown ID", action.payload.id);
        return JSON.parse(JSON.stringify(state));
      }
      state.users[index] = action.payload;
      return {
        tasks: JSON.parse(JSON.stringify(state.tasks)),
        links: JSON.parse(JSON.stringify(state.links)),
        users: JSON.parse(JSON.stringify(state.users)),
        currentUser: state.currentUser
      };
    case DELETE_TASK:
      index = state.tasks.findIndex(task => task.id === action.payload);
      if (index === -1) {
        console.warn("DELETE_TASK failed with unknown ID", action.payload);
        return JSON.parse(JSON.stringify(state));
      }
      state.tasks.splice(index, 1);
      return {
        tasks: state.tasks,
        links: state.links,
        users: state.users,
        currentUser: state.currentUser
      };
    case DELETE_LINK:
      index = state.links.findIndex(link => link.id === action.payload);
      if (index === -1) {
        console.warn("DELETE_LINK failed with unknown ID", action.payload);
        return JSON.parse(JSON.stringify(state));
      }
      state.links.splice(index, 1);
      return {
        tasks: state.tasks,
        links: state.links,
        users: state.users,
        currentUser: state.currentUser
      };
    case DELETE_USER:
      index = state.users.findIndex(user => user.id === action.payload);
      if (index === -1) {
        console.warn("DELETE_USER failed with unknown ID", action.payload);
        return JSON.parse(JSON.stringify(state));
      }
      state.users.splice(index, 1);
      return {
        tasks: state.tasks,
        links: state.links,
        users: state.users,
        currentUser: state.currentUser
      };
    case LOAD_ALL_TASKS:
      return action.payload;
    case CREATE_TASKS:
      return JSON.parse(
        JSON.stringify({
          links: state.links,
          tasks: [...state.tasks, ...action.payload],
          users: JSON.parse(JSON.stringify(state.users)),
          currentUser: state.currentUser
        })
      );
    default:
      return JSON.parse(JSON.stringify(state));
  }
}
