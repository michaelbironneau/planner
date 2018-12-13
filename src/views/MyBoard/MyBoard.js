// @flow
import React, { Component } from "react";
import styled from "react-emotion";
import { action } from "@storybook/addon-actions";
import addons, { mockChannel } from "@storybook/addons";
import { Button, Row, Col, Form, FormGroup, Input } from "reactstrap";
import { DragDropContext } from "react-beautiful-dnd";
import TaskList from "./TaskList";
import { colors, grid } from "./constants";
import {
  getTasksForUser,
  getTasksMap,
  getTasks,
  getUserByEmail,
  getCurrentuser
} from "../../store/selectors";
import { setTaskProgress, createTask } from "../../store/actions";
import { connect } from "react-redux";
import * as moment from "moment";
import { getEndDate } from "../../store/endDate";
const today = moment();

const orderByDate = tasks => {
  return tasks.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
};

const getTaskMapByProgress = (tasks, weekStart) => {
  const ret = { todo: [], inprog: [], done: [] };
  for (var i = 0; i < tasks.length; i++) {
    const progress = isNaN(tasks[i].progress) ? 0 : tasks[i].progress;
    if (!isTaskInCurrentWeek(tasks[i], weekStart)) continue; //only include tasks in current week
    if (progress == 0) {
      ret.todo.push(tasks[i]);
    } else if (progress > 0 && progress < 1) {
      ret.inprog.push(tasks[i]);
    } else {
      ret.done.push(tasks[i]);
    }
  }
  return {
    todo: orderByDate(ret.todo),
    inprog: orderByDate(ret.inprog),
    done: orderByDate(ret.done)
  };
};

const isTaskInCurrentWeek = (task, weekStart) => {
  const weekEnd = weekStart.clone().add(5, "days");
  //task starts after week end
  if (moment(task.start_date).isAfter(weekEnd)) {
    return false;
  }
  //task ends before week start
  if (moment(getEndDate(task)).isBefore(weekStart)) {
    return false;
  }
  return true;
};

const mapStateToProps = state => {
  const userEmail = getCurrentuser(state);
  let currentUser = getUserByEmail(state, userEmail.email);
  if (!currentUser) currentUser = { email: "Loading...", id: null };
  const userTasks = getTasksForUser(state, currentUser.id);
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
    //if (!isTaskInCurrentWeek(userTasks[i])) continue; //only include tasks in the week
    if (userTasks[i].parent) {
      userTasks[i].project = { name: taskMap[userTasks[i].parent].text };
    } else {
      userTasks[i].project = { name: "" };
    }
    ret.push(userTasks[i]);
  }
  return {
    taskMap: weekStart => getTaskMapByProgress(ret, weekStart),
    currentUser: currentUser
  };
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

const WeekScrollBar = styled("div")`
  display: block;
  width: 100%;
  font-size: 1.3em;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: rgba(0, 0, 0, 0.8);
  padding: 1em;
  text-align: center;
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

  constructor(props) {
    super(props);

    this.state = {
      //userTasks: this.props.initial
      userTasks: initialTasks,
      weekStart: moment(today).startOf("isoWeek")
    };
    this.incrementWeek = this.incrementWeek.bind(this);
  }

  incrementWeek(delta) {
    this.setState({
      userTasks: this.state.userTasks,
      weekStart: moment(this.state.weekStart)
        .clone()
        .add(delta, "week")
    });
  }

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
        setTaskProgress(
          this.props.taskMap(this.state.weekStart).todo[source.index].id,
          0.1
        )
      );
    } else if (
      source.droppableId === "todo" &&
      destination.droppableId === "done"
    ) {
      this.props.dispatch(
        setTaskProgress(
          this.props.taskMap(this.state.weekStart).todo[source.index].id,
          1
        )
      );
    } else if (
      source.droppableId === "inprog" &&
      destination.droppableId === "done"
    ) {
      this.props.dispatch(
        setTaskProgress(
          this.props.taskMap(this.state.weekStart).inprog[source.index].id,
          1
        )
      );
    } else if (
      source.droppableId === "inprog" &&
      destination.droppableId === "todo"
    ) {
      this.props.dispatch(
        setTaskProgress(
          this.props.taskMap(this.state.weekStart).inprog[source.index].id,
          0
        )
      );
    } else if (
      source.droppableId === "done" &&
      destination.droppableId === "todo"
    ) {
      this.props.dispatch(
        setTaskProgress(
          this.props.taskMap(this.state.weekStart).done[source.index].id,
          0
        )
      );
    } else if (
      source.droppableId === "done" &&
      destination.droppableId === "inprog"
    ) {
      this.props.dispatch(
        setTaskProgress(
          this.props.taskMap(this.state.weekStart).done[source.index].id,
          0.5
        )
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

  addQuickTask(text) {
    const task = {
      start_date: this.state.weekStart.toISOString(),
      duration: 1,
      text: text,
      owner_id: this.props.currentUser.id,
      progress: 0,
      type: "task"
    };
    this.props.dispatch(createTask(task));
  }

  renderAddTask() {
    let newTaskText = "New task";
    return (
      <div style={{ width: "250px" }}>
        <Row>
          <Col m={12}>
            <Form inline>
              <FormGroup>
                <Input
                  placeholder="New task"
                  bsSize="m"
                  onChange={e => (newTaskText = e.target.value)}
                />
                <Button onClick={() => this.addQuickTask(newTaskText)}>
                  Add
                </Button>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const disabledDroppable = "TODO";
    const taskMap = this.props.taskMap(this.state.weekStart);
    const weekNumber = moment(this.state.weekStart).week();
    const isThisWeek = weekNumber == moment(today).week();
    return (
      <div>
        <small>{this.props.currentUser.email}</small>
        <WeekScrollBar>
          <Button className="pull-left" onClick={() => this.incrementWeek(-1)}>
            &lt;
          </Button>
          <span>
            Week #{weekNumber}
            {isThisWeek ? " (this week)" : ""}
          </span>
          <Button className="pull-right" onClick={() => this.incrementWeek(1)}>
            &gt;
          </Button>
        </WeekScrollBar>
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
                  enableAddTask={true}
                />
                {this.renderAddTask()}
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
      </div>
    );
  }
}

export default connect(mapStateToProps)(TaskApp);
