import React, { Component } from "react";
import Gantt from "../Gantt/Gantt";
import "./Dashboard.scss";
import { Button, Col, Row, ButtonGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { getTasks } from "../../store/selectors";
import { connect } from "react-redux";
import { fetchTasks } from "../../store/actions";

const mapStateToProps = data => {
  return { data };
};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentZoom: "Months",
      messages: []
    };
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.logTaskUpdate = this.logTaskUpdate.bind(this);
    this.logLinkUpdate = this.logLinkUpdate.bind(this);
    this.handleZoomChange = this.handleZoomChange.bind(this);
  }

  addMessage(message) {
    var messages = this.state.messages.slice();
    var prevKey = messages.length ? messages[0].key : 0;

    messages.unshift({ key: prevKey + 1, message });
    if (messages.length > 40) {
      messages.pop();
    }
    this.setState({ messages });
  }

  componentWillMount() {
    this.props.fetchTasks();
  }

  addBlankProject() {}

  logTaskUpdate(id, mode, task) {
    let text = task && task.text ? ` (${task.text})` : "";
    let message = `Task ${mode}: ${id} ${text}`;
    this.addMessage(message);
  }

  logLinkUpdate(id, mode, link) {
    let message = `Link ${mode}: ${id}`;
    if (link) {
      message += ` ( source: ${link.source}, target: ${link.target} )`;
    }
    this.addMessage(message);
  }

  handleZoomChange(zoom) {
    this.setState({
      currentZoom: zoom
    });
  }

  render() {
    console.log(this.props.tasks);
    const tasks = this.props.tasks || [];
    const links = this.props.links || [];
    return (
      <div className="animated fadeIn">
        <Row className="align-items-left mb-1">
          <Col sm xs="12" className="mt-3">
            <Link to="/projects/new">
              <Button color="primary">
                <i className="icon-plus icons mr-1" />
                Add project
              </Button>
            </Link>
            <ButtonGroup className="pull-right">
              <Button
                color="secondary"
                onClick={() => this.handleZoomChange("Hours")}
                active={this.state.currentZoom === "Hours"}
              >
                Hours
              </Button>
              <Button
                color="secondary"
                onClick={() => this.handleZoomChange("Days")}
                active={this.state.currentZoom === "Days"}
              >
                Days
              </Button>
              <Button
                color="secondary"
                onClick={() => this.handleZoomChange("Months")}
                active={this.state.currentZoom === "Months"}
              >
                Months
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        <div className="gantt-container">
          <Gantt
            tasks={{
              data: JSON.parse(JSON.stringify(tasks)),
              links: links
            }}
            zoom={this.state.currentZoom}
            onTaskUpdated={this.logTaskUpdate}
            onLinkUpdated={this.logLinkUpdate}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  { fetchTasks }
)(Dashboard);
