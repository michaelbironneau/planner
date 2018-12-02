import React, { Component } from "react";
import {
  Row,
  Form,
  ButtonGroup,
  FormGroup,
  Container,
  Label,
  Card,
  CardHeader,
  CardBody,
  Col,
  Input,
  Button,
  Jumbotron
} from "reactstrap";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";
import * as moment from "moment";
import { connect } from "react-redux";
import { getTaskById } from "../../store/selectors";

const testTask = {
  id: 14,
  text: "Database design",
  progress: 0.5,
  start_date: "2018-11-23T00:00:00Z",
  duration: 7,
  description:
    "Create the database design.\n This should involve both creating all the tables and producing a design specification including how the data flows in and out.",
  owner_id: "5"
};

const mapStateToProps = store => {
  return {
    getTaskById: id => getTaskById(store, id)
  };
};

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = { task: {} };
    this.cancel = this.cancel.bind(this);
    this.editDescription = this.editDescription.bind(this);
  }

  componentWillMount() {
    const taskID = this.props.match.params.id;
    const task = JSON.parse(JSON.stringify(this.props.getTaskById(taskID)));
    this.setState({ task });
  }

  incrementProgress(delta) {
    const task = Object.assign({}, this.state.task);
    task.progress = Math.max(0, Math.min(1, task.progress + delta));
    this.setState({ task });
  }

  cancel() {
    const taskID = this.props.match.params.id;
    const task = JSON.parse(JSON.stringify(this.props.getTaskById(taskID)));
    console.log(task);
    this.setState({ task });
  }

  editDescription(e) {
    this.state.task.description = e.target.value;
    this.setState({ task: this.state.task });
  }

  render() {
    const modelTask = this.state.task;
    return (
      <Card>
        <CardHeader>
          {modelTask.text} -{" "}
          {modelTask.start_date
            ? "Scheduled to start " + moment(modelTask.start_date).calendar()
            : "Unscheduled"}
          <Button color="danger" className="pull-right">
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
                    >
                      <option>Bob</option>
                      <option>Is</option>
                      <option>Your</option>
                      <option>Uncle</option>
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
              <Button color="success">
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

export default connect(mapStateToProps)(Task);
