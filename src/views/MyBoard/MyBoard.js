// @flow
import React, { Component } from "react";
import styled from "react-emotion";
import { action } from "@storybook/addon-actions";
import addons, { mockChannel } from "@storybook/addons";

import { DragDropContext } from "react-beautiful-dnd";
import TaskList from "./TaskList";
import { colors, grid } from "./constants";
import { reorderTaskMap } from "./reorder";
import { tasks } from "./tasks";

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
  todo: tasks.slice(0, 4),
  inprog: tasks.slice(4, 6),
  done: tasks.slice(6, 9)
};

export default class TaskApp extends Component {
  /* eslint-disable react/sort-comp */

  state = {
    //taskMap: this.props.initial
    taskMap: initialTasks
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

    this.setState(
      reorderTaskMap({
        taskMap: this.state.taskMap,
        source,
        destination
      })
    );
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
    const { taskMap } = this.state;
    const disabledDroppable = "TODO";

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
