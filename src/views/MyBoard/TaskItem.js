// @flow
import React from "react";
import styled from "react-emotion";
import { borderRadius, colors, grid } from "./constants";
import * as moment from "moment";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

const getBackgroundColor = (isDragging, isGroupedOver) => {
  if (isDragging) {
    return colors.green;
  }

  if (isGroupedOver) {
    return colors.grey.N30;
  }

  return colors.white;
};

const Container = styled("a")`
  border-radius: ${borderRadius}px;
  border: 1px solid grey;
  background-color: ${props =>
    getBackgroundColor(props.isDragging, props.isGroupedOver)};
  box-shadow: ${({ isDragging }) =>
    isDragging ? `2px 2px 1px ${colors.shadow}` : "none"};
  padding: ${grid}px;
  min-height: 40px;
  margin-bottom: ${grid}px;
  user-select: none;

  /* anchor overrides */
  color: ${colors.black};

  &:hover,
  &:active {
    color: ${colors.black};
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid ${colors.purple};
    box-shadow: none;
  }

  /* flexbox */
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const Content = styled("div")`
  /* flex child */
  flex-grow: 1;

  /*
    Needed to wrap text in ie11
    https://stackoverflow.com/questions/35111090/why-ie11-doesnt-wrap-the-text-in-flexbox
  */
  flex-basis: 100%;
  flex-flow: row wrap;

  /* flex parent */
  display: flex;
  flex-direction: column;
`;

const progressStyle = {
  margin: "5px"
};

const BlockTask = styled("div")``;

const Footer = styled("div")`
  display: flex;
  flex-wrap: wrap;
  margin-top: ${grid}px;
`;

const TaskSpan = styled("small")`
  flex-grow: 0;
  margin: 0;

  &.overdue {
    color: red;
  }
`;

const Attribution = styled("small")`
  margin: 0;
  margin-left: ${grid}px;
  text-align: right;
  flex-grow: 1;
`;

// Previously this extended React.Component
// That was a good thing, because using React.PureComponent can hide
// issues with the selectors. However, moving it over does can considerable
// performance improvements when reordering big lists (400ms => 200ms)
// Need to be super sure we are not relying on PureComponent here for
// things we should be doing in the selector as we do not know if consumers
// will be using PureComponent
export default class TaskItem extends React.PureComponent {
  render() {
    const { task, isDragging, isGroupedOver, provided } = this.props;

    return (
      <Container
        //href={task.author.url}
        isDragging={isDragging}
        isGroupedOver={isGroupedOver}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content>
          <BlockTask>{task.text}</BlockTask>
          <Footer>
            <TaskSpan
              className={
                this.props.showOverdue &&
                moment(task.start_date) < moment().startOf("day")
                  ? "overdue"
                  : ""
              }
            >
              {moment(task.start_date).calendar()}
            </TaskSpan>

            <Attribution>{task.project.name}</Attribution>
            <Progress
              style={progressStyle}
              percent={Math.round(100 * task.progress)}
              status={task.progress === 1 ? "success" : ""}
            />
          </Footer>
        </Content>
      </Container>
    );
  }
}
