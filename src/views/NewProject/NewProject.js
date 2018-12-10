import React, { Component } from "react";
import {
  Row,
  FormGroup,
  Label,
  Card,
  CardHeader,
  CardBody,
  Col,
  Input,
  Button,
  Jumbotron
} from "reactstrap";
import "./NewProject.scss";

import { createProject } from "../../store/actions";
import { connect } from "react-redux";
import { newTask } from "../../models/task";
import * as moment from "moment";

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      tasks: []
    };

    this.onAddTask = this.onAddTask.bind(this);
    this.onRemoveTask = this.onRemoveTask.bind(this);
    this.onChangeTaskName = this.onChangeTaskName.bind(this);
    this.onChangeTaskDuration = this.onChangeTaskDuration.bind(this);
    this.onChangeProjectName = this.onChangeProjectName.bind(this);
    this.onSaveProject = this.onSaveProject.bind(this);
    this.onResetProject = this.onResetProject.bind(this);
  }

  onAddTask() {
    this.state.tasks.push({
      text: "",
      duration: 1,
      start_date: moment()
        .startOf("day")
        .toISOString(),
      end_date: moment()
        .startOf("day")
        .toISOString(),
      unscheduled: true,
      owner_id: null,
      progress: 0
    });
    this.setState({ tasks: [...this.state.tasks] });
  }

  onResetProject() {
    this.setState({
      name: "",
      tasks: []
    });
  }

  onSaveProject() {
    if (this.state.name.length === 0) return;
    for (var i = 0; i < this.state.tasks.length; i++) {
      if (this.state.tasks[i].text.length === 0) return;
    }
    try {
      this.props.createProject({
        project: newTask({
          text: this.state.name,
          type: "project",
          parent: 0, //root
          owner_id: null,
          progress: 0,
          duration: 0,
          start_date: moment()
            .startOf("day")
            .toISOString(),
          end_date: moment()
            .startOf("day")
            .toISOString(),
          unscheduled: true
        }),
        tasks: this.state.tasks.map(task => newTask(task))
      });
      this.onResetProject();
      this.props.history.push("/dashboard");
    } catch (e) {
      console.warn(e);
    }
  }

  onChangeProjectName(newName) {
    this.setState({ name: newName });
  }

  onRemoveTask(index) {
    this.state.tasks.splice(index, 1);
    this.setState({ tasks: [...this.state.tasks] });
  }

  onChangeTaskName(index, newName) {
    this.state.tasks[index].text = newName;
    this.setState({ tasks: [...this.state.tasks] });
  }

  onChangeTaskDuration(index, newDuration) {
    if (!newDuration.match(/^-?\d*\.?\d*$/)) {
      return;
    }
    this.state.tasks[index].duration = newDuration;
    this.setState({ tasks: [...this.state.tasks] });
  }

  renderTasks() {
    if (this.state.tasks.length === 0) {
      return (
        <Row>
          <Col xs="12">
            <Jumbotron className="text-center">
              <p>
                <i className="icon-frame icons" />
              </p>
              <p>
                <em>You don't have any tasks. Click '+' to get started.</em>
              </p>
            </Jumbotron>
          </Col>
        </Row>
      );
    }
    return this.state.tasks.map((task, index) => {
      return (
        <Row key={index}>
          <Col xs="9" m="9">
            <FormGroup>
              <Input
                type="text"
                placeholder="Task description"
                onChange={e => this.onChangeTaskName(index, e.target.value)}
                value={task.text}
              />
            </FormGroup>
          </Col>
          <Col xs="2" m="2">
            <FormGroup>
              <Input
                type="text"
                placeholder="Effort (days)"
                value={task.duration}
                onChange={e => this.onChangeTaskDuration(index, e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col xs="1" m="1">
            <Button
              onClick={() => this.onRemoveTask(index)}
              className="btn-danger"
            >
              -
            </Button>
          </Col>
        </Row>
      );
    });
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Card className="card-wide">
            <CardHeader>
              <h3>New Project</h3>
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" m="12">
                  <FormGroup>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="Project name"
                      value={this.state.name}
                      onChange={e => {
                        this.onChangeProjectName(e.target.value);
                      }}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h4>
                    Tasks
                    <Button
                      size="sm"
                      className="btn-success ml-1 mb-1 mt-1"
                      onClick={() => this.onAddTask()}
                    >
                      +
                    </Button>
                  </h4>
                </Col>
              </Row>

              {/* Tasks */}
              <Row>
                <Col xs="9" m="9">
                  <h6>Name</h6>
                </Col>
                <Col xs="2" m="2">
                  <h6>Effort (d)</h6>
                </Col>
              </Row>

              {this.renderTasks()}
              {/* Save/cancel button */}

              <Row>
                <Col />
                <Col col="3" xs="3" m="2" className="mb-3">
                  <Button
                    block
                    outline
                    color="primary"
                    onClick={() => this.onSaveProject()}
                  >
                    Save
                  </Button>
                </Col>
                <Col col="3" xs="3" m="2" className="mb-3">
                  <Button
                    block
                    outline
                    color="secondary"
                    onClick={() => this.onResetProject()}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Row>
      </div>
    );
  }
}

export default connect(
  null,
  { createProject }
)(NewProject);
