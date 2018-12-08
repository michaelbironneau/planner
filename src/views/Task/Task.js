import React, { Component } from "react";
import {
  Row,
  Form,
  ButtonGroup,
  FormGroup,
  Label,
  Card,
  CardHeader,
  CardBody,
  Col,
  Input,
  Button
} from "reactstrap";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";
import * as moment from "moment";
import { connect } from "react-redux";
import { getTaskById, getUsers, getOwnerOfTask } from "../../store/selectors";
import { updateTask, deleteTask } from "../../store/actions";
import PropTypes from "prop-types";

const mapStateToProps = store => {
  return {
    getTaskById: id => getTaskById(store, id),
    users: getUsers(store),
    getOwnerOfTask: id => getOwnerOfTask(store, id)
  };
};

class Task extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = { task: {} };
    this.cancel = this.cancel.bind(this);
    this.editDescription = this.editDescription.bind(this);
    this.renderUsers = this.renderUsers.bind(this);
    this.changeAssignee = this.changeAssignee.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.changeDuration = this.changeDuration.bind(this);
  }

  componentWillMount() {
    const taskID = this.props.match.params.id;
    const t = this.props.getTaskById(taskID);
    if (t === undefined) {
      console.warn("Undefined task"); //TODO: show 404 or something
      return;
    }
    const task = JSON.parse(JSON.stringify(t));
    this.setState({ task });
  }

  changeAssignee(e) {
    const newOwner = this.props.users.find(
      user => user.text === e.target.value
    );
    this.state.task.owner_id = newOwner.id;
    this.setState({ task: this.state.task });
  }

  changeDuration(e) {
    const task = Object.assign({}, this.state.task);
    task.duration = e.target.value;
    this.setState({ task });
  }

  incrementProgress(delta) {
    const task = Object.assign({}, this.state.task);
    task.progress = Math.max(0, Math.min(1, task.progress + delta));
    this.setState({ task });
  }

  save() {
    const task = Object.assign({}, this.state.task);
    task.duration = parseFloat(task.duration);
    if (isNaN(task.duration)) {
      console.warn("Invalid duration", task); //TODO: Error message
      return;
    }
    this.props.updateTask(this.state.task);
    this.context.router.history.goBack();
  }

  delete() {
    this.props.deleteTask(this.state.task.id);
    this.context.router.history.goBack();
  }

  cancel() {
    this.context.router.history.goBack();
  }

  editDescription(e) {
    this.state.task.description = e.target.value;
    this.setState({ task: this.state.task });
  }

  renderUsers() {
    const taskID = this.props.match.params.id;
    const owner = this.props.getOwnerOfTask(taskID);
    return [
      <option key="n">None</option>,
      ...this.props.users.map(user => (
        <option key={user.id}>{user.text}</option>
      ))
    ];
  }

  render() {
    const modelTask = this.state.task;
    if (isNaN(modelTask.progress)) modelTask.progress = 0;
    const owner = this.props.users.find(
      user => user.id === this.state.task.owner_id
    ) || { text: "None" };
    return (
      <Card>
        <CardHeader>
          {modelTask.text} -{" "}
          {modelTask.start_date
            ? "Scheduled to start " + moment(modelTask.start_date).calendar()
            : "Unscheduled"}
          <Button onClick={this.delete} color="danger" className="pull-right">
            <i className="icon-minus icons mr-1" />
            Delete
          </Button>
        </CardHeader>
        <CardBody>
          <Row>
            <Col m="12" xs="12">
              <Label>Progress:</Label>
              <ButtonGroup style={{ marginBottom: "5px" }}>
                <Button onClick={() => this.incrementProgress(-0.1)} size="sm">
                  -
                </Button>
                <Progress
                  style={{ width: "200px", marginRight: "5px" }}
                  percent={Math.round(100 * modelTask.progress)}
                  status={modelTask.progress === 1 ? "success" : ""}
                />
                <Button onClick={() => this.incrementProgress(0.1)} size="sm">
                  +
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col m="6">
              <Form>
                <FormGroup row>
                  <Label m={2} sm={2}>
                    Duration (days):
                  </Label>
                  <Col m={1} sm={2}>
                    <Input
                      type="text"
                      value={modelTask.duration}
                      onChange={this.changeDuration}
                    />
                  </Col>
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col m={6}>
              <Form>
                <FormGroup row>
                  <Label m={2} sm={2} for="asigneeSelect">
                    Assignee:
                  </Label>
                  <Col m={3} sm={6}>
                    <Input
                      type="select"
                      name="asigneeSelect"
                      id="asigneeSelect"
                      value={owner.text}
                      onChange={this.changeAssignee}
                    >
                      {this.renderUsers()}
                    </Input>
                  </Col>
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col m={8}>
              <Form>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    type="textarea"
                    name="description"
                    id="description"
                    value={modelTask.description || ""}
                    onChange={this.editDescription}
                  />
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col m={12}>
              <Button onClick={this.save} color="success">
                <i className="icon-check icons mr-1" />
                Save
              </Button>
              <Button onClick={this.cancel}>Cancel</Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

export default connect(
  mapStateToProps,
  { updateTask, deleteTask }
)(Task);
