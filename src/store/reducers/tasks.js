import { CREATE_TASK, UPDATE_TASK, DELETE_TASK } from "../actionTypes";

const initialState = { tasks: [] };

export default function(state = initialState, action) {
  switch (action.type) {
    case CREATE_TASK:
      return {
        tasks: [...state.tasks, action.payload]
      };
    case UPDATE_TASK:
      const index = state.tasks.findIndex(task => task.id == action.payload.id);
      if (index === -1) {
        console.warn("UPDATE_TASK failed with unknown ID", action.payload.id);
        return state;
      }
      state.tasks[index] = action.payload;
      return JSON.parse(JSON.stringify(state.tasks));
    case DELETE_TASK:
      index = state.tasks.findIndex(task => task.id == action.payload.id);
      if (index === -1) {
        console.warn("DELETE_TASK failed with unknown ID", action.payload.id);
        return state;
      }
      state.tasks.splice(index, 1);
      return JSON.parse(JSON.stringify(state.tasks));
    default:
      return state;
  }
}
