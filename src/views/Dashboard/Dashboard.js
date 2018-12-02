import React, { Component } from "react";
import Gantt from "../Gantt/Gantt";
import "./Dashboard.scss";
import { Button, Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { getTasks } from "../../store/selectors";
import { connect } from "react-redux";

const mapStateToProps = state => {
  const tasks = getTasks(state);
  return { tasks: tasks.tasks, links: tasks.links };
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

  componentDidMount() {}

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
          </Col>
        </Row>
        <div className="gantt-container">
          <Gantt
            tasks={{
              data: JSON.parse(JSON.stringify(this.props.tasks)),
              links: this.props.links
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

export default connect(mapStateToProps)(Dashboard);
