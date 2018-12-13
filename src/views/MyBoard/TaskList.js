// @flow
import React from "react";
import styled from "react-emotion";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskItem from "./TaskItem";
import { grid, colors } from "./constants";
import Title from "./Title";
import { lighten, darken } from "polished";
import { Input, Button, Form, FormGroup, Row, Col } from "reactstrap";

const Wrapper = styled("div")`
  background-color: ${({ isDraggingOver, backgroundColor }) =>
    isDraggingOver ? lighten(0.1, backgroundColor) : backgroundColor};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : "inherit")};
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.1s ease, opacity 0.1s ease;
  user-select: none;
  width: 250px;
`;

const scrollContainerHeight = 250;

const DropZone = styled("div")`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;

  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  margin-bottom: ${grid}px;
`;

const ScrollContainer = styled("div")`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: ${scrollContainerHeight}px;
`;

/* stylelint-disable block-no-empty */
const Container = styled("div")``;
/* stylelint-enable */

class InnerTaskList extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.tasks !== this.props.tasks) {
      return true;
    }

    return false;
  }

  render() {
    return this.props.tasks.map((task, index) => (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(dragProvided, dragSnapshot) => (
          <TaskItem
            key={task.id}
            task={task}
            isDragging={dragSnapshot.isDragging}
            showOverdue={this.props.showOverdue}
            isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
            provided={dragProvided}
          />
        )}
      </Draggable>
    ));
  }
}

class InnerList extends React.Component {
  render() {
    const { tasks, dropProvided } = this.props;
    const title = this.props.title ? <Title>{this.props.title}</Title> : null;
    const showOverdue = this.props.showOverdue;

    return (
      <Container>
        {title}
        <DropZone innerRef={dropProvided.innerRef}>
          <InnerTaskList tasks={tasks} showOverdue={showOverdue} />
          {dropProvided.placeholder}
        </DropZone>
      </Container>
    );
  }
}

class TaskList extends React.Component {
  static defaultProps = {
    listId: "LIST"
  };

  render() {
    const {
      ignoreContainerClipping,
      internalScroll,
      scrollContainerStyle,
      isDropDisabled,
      isCombineEnabled,
      listId,
      listType,
      style,
      tasks,
      title,
      color,
      showOverdue
    } = this.props;

    return (
      <Droppable
        droppableId={listId}
        type={listType}
        ignoreContainerClipping={ignoreContainerClipping}
        isDropDisabled={isDropDisabled}
        isCombineEnabled={isCombineEnabled}
      >
        {(dropProvided, dropSnapshot) => (
          <Wrapper
            backgroundColor={color}
            style={style}
            isDraggingOver={dropSnapshot.isDraggingOver}
            isDropDisabled={isDropDisabled}
            {...dropProvided.droppableProps}
          >
            {internalScroll ? (
              <ScrollContainer style={scrollContainerStyle}>
                <InnerList
                  tasks={tasks}
                  title={title}
                  dropProvided={dropProvided}
                />
              </ScrollContainer>
            ) : (
              <InnerList
                tasks={tasks}
                title={title}
                showOverdue={showOverdue}
                dropProvided={dropProvided}
              />
            )}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}

export default TaskList;
