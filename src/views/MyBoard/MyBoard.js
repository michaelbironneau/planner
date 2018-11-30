// @flow
import React, { Component } from "react";
import styled from "react-emotion";
import { action } from "@storybook/addon-actions";
import addons, { mockChannel } from "@storybook/addons";

import { DragDropContext } from "react-beautiful-dnd";
import TaskList from "./TaskList";
import { colors, grid } from "./constants";
import { getTasksForUser, getTasksMap, getTasks } from "../../store/selectors";
import { setTaskProgress } from "../../store/actions";
import { connect } from "react-redux";

const testUserId = "5";

const getTaskMapByProgress = tasks => {
  const ret = { todo: [], inprog: [], done: [] };
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].progress == 0) {
      ret.todo.push(tasks[i]);
    } else if (tasks[i].progress > 0 && tasks[i].progress < 1) {
      ret.inprog.push(tasks[i]);
    } else {
      ret.done.push(tasks[i]);
    }
  }
  return ret;
};

const mapStateToProps = state => {
  const userTasks = getTasksForUser(state, testUserId);
  const allTasks = getTasks(state).tasks;
  const ret = [];
  const taskMap = getTasksMap(state);
  for (var i = 0; i < userTasks.length; i++) {
    let hasChildren = false;
    for (var j = 0; j < allTasks.length; j++) {
      if (allTasks[j].parent === userTasks[i].id) {
        hasChildren = true;
        break;
      }
    }
    if (hasChildren) continue; //don't add tasks with children - just add the children
    if (userTasks[i].parent) {
      userTasks[i].project = { name: taskMap[userTasks[i].parent].text };
    } else {
      userTasks[i].project = { name: "" };
    }
    ret.push(userTasks[i]);
  }
  return { taskMap: getTaskMapByProgress(ret) };
};

addons.setChannel(mockChannel());

const publishOnDragStart = action("onDragStart");
const publishOnDragEnd = action("onDragEnd");

const Root = styled("div")`
  //background-color: ${colors.blue.deep};
  box-sizing: border-box;
  padding: ${grid * 2}px;
  min-height: 100vh;

  /* flexbox */
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Column = styled("div")`
  margin: 0 ${grid * 2}px;
`;

const HorizontalScrollContainer = styled("div")`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  //background: rgba(0, 0, 0, 0.1);
  padding: ${grid}px;
  //max-width: 400px;
  overflow: auto;
`;

const VerticalScrollContainer = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.1);
  padding: ${grid}px;
  max-height: 800px;
  overflow: auto;
`;

const PushDown = styled("div")`
  height: 200px;
`;

const initialTasks = {
  todo: [],
  inprog: [],
  done: []
};

class TaskApp extends Component {
  /* eslint-disable react/sort-comp */

  state = {
    //userTasks: this.props.initial
    userTasks: initialTasks
  };

  onDragStart = initial => {
    publishOnDragStart(initial);
    // this.setState({
    //   disabledDroppable: this.getDisabledDroppable(initial.source.droppableId),
    // });
  };

  onDragEnd = result => {
    publishOnDragEnd(result);

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;
    if (source.droppableId === "todo" && destination.droppableId === "inprog") {
      this.props.dispatch(
        setTaskProgress(this.props.taskMap.todo[source.index].id, 0.1)
      );
    } else if (
      source.droppableId === "todo" &&
      destination.droppableId === "done"
    ) {
      this.props.dispatch(
        setTaskProgress(this.props.taskMap.todo[source.index].id, 1)
      );
    } else if (
      source.droppableId === "inprog" &&
      destination.droppableId === "done"
    ) {
      this.props.dispatch(
        setTaskProgress(this.props.taskMap.inprog[source.index].id, 1)
      );
    } else if (
      source.droppableId === "inprog" &&
      destination.droppableId === "todo"
    ) {
      this.props.dispatch(
        setTaskProgress(this.props.taskMap.inprog[source.index].id, 0)
      );
    } else if (
      source.droppableId === "done" &&
      destination.droppableId === "todo"
    ) {
      this.props.dispatch(
        setTaskProgress(this.props.taskMap.done[source.index].id, 0)
      );
    } else if (
      source.droppableId === "done" &&
      destination.droppableId === "inprog"
    ) {
      this.props.dispatch(
        setTaskProgress(this.props.taskMap.done[source.index].id, 0.5)
      );
    } else {
      console.warn("Unknown source/destination for drop", source, destination);
    }
    /**this.setState(;
      reorderTaskMap({
        taskMap: this.props.taskMap,
        source,
        destination
      })
    ); */
  };

  // TODO
  getDisabledDroppable = sourceDroppable => {
    if (!sourceDroppable) {
      return null;
    }

    const droppables = ["todo", "inprog", "done"];
    const sourceIndex = droppables.indexOf(sourceDroppable);
    const disabledDroppableIndex = (sourceIndex + 1) % droppables.length;

    return droppables[disabledDroppableIndex];
  };

  render() {
    const disabledDroppable = "TODO";
    const taskMap = this.props.taskMap;
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      >
        <Root className="list-container">
          <HorizontalScrollContainer>
            <Column>
              <TaskList
                color="#B29CA3"
                title="Todo"
                listId="todo"
                listType="card"
                showOverdue={true}
                isDropDisabled={disabledDroppable === "todo"}
                tasks={taskMap.todo}
              />
            </Column>
            <Column>
              <TaskList
                color="#FFF9B3"
                title="In Progress"
                listId="inprog"
                listType="card"
                showOverdue={false}
                isDropDisabled={disabledDroppable === "inprog"}
                tasks={taskMap.inprog}
              />
            </Column>
            <Column>
              <TaskList
                color="#77BACC"
                title="Done"
                listId="done"
                listType="card"
                showOverdue={false}
                isDropDisabled={disabledDroppable === "done"}
                tasks={taskMap.done}
              />
            </Column>
          </HorizontalScrollContainer>
        </Root>
      </DragDropContext>
    );
  }
}

export default connect(mapStateToProps)(TaskApp);
