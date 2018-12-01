import React, { Component } from "react";
import {
  Row,
  Form,
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

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const taskID = this.props.match.params.id;
    return (
      <Container style={{ border: "1px solid grey" }}>
        <Row>
          <Col m="12" xs="12">
            <FormGroup row>
              <Button>+</Button>
              <Button>-</Button>
              <div style={{ float: "left" }}>Progress bar</div>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <h1>{testTask.text}</h1>
        </Row>
        <Row>
          <Col m={6}>
            <Form>
              <FormGroup row>
                <Label m={2} sm={2} for="asigneeSelect">
                  Assignee:
                </Label>
                <Col m={3} sm={6}>
                  <Input type="select" name="asigneeSelect" id="asigneeSelect">
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
      </Container>
    );
  }
}

export default Task;
