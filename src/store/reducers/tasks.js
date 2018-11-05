import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  LOAD_ALL_TASKS,
  CREATE_TASKS
} from "../actionTypes";

import { LocalStore } from "../localStorage";

const initialState = new LocalStore().loadStore();

export default function(state = initialState, action) {
  switch (action.type) {
    case CREATE_TASK:
      return JSON.parse(
        JSON.stringify({
          tasks: [...state.tasks, action.payload],
          links: state.links
        })
      );
    case UPDATE_TASK:
      const index = state.tasks.findIndex(task => task.id == action.payload.id);
      if (index === -1) {
        console.warn("UPDATE_TASK failed with unknown ID", action.payload.id);
        return JSON.parse(JSON.stringify(state));
      }
      state.tasks[index] = action.payload;
      return { tasks: JSON.parse(JSON.stringify(state.tasks)), links: JSON.parse(JSON.stringify(state.links)) };
    case DELETE_TASK:
      index = state.tasks.findIndex(task => task.id == action.payload.id);
      if (index === -1) {
        console.warn("DELETE_TASK failed with unknown ID", action.payload.id);
        return JSON.parse(JSON.stringify(state));
      }
      state.tasks.splice(index, 1);
      return { tasks: state.tasks, links: state.links };
    case LOAD_ALL_TASKS:
      return action.payload;
    case CREATE_TASKS:
      return JSON.parse(
        JSON.stringify({
          links: state.links,
          tasks: [...state.tasks, ...action.payload]
        })
      );
    default:
      return JSON.parse(JSON.stringify(state));
  }
}
