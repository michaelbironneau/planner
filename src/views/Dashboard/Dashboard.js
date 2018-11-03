import React, { Component } from "react";
import Gantt from "../Gantt/Gantt";
import "./Dashboard.scss";
import data from "./data.json";

/**let data = {
  data: [
    {
      id: 1,
      text: "Task #1",
      start_date: "15-04-2017",
      duration: 3,
      progress: 0.6,
      type: "project"
    },
    {
      id: 2,
      text: "Task #2",
      start_date: "18-04-2017",
      duration: 3,
      progress: 0.4
    }
  ],
  links: [{ id: 1, source: 1, target: 2, type: "0" }]
}; */

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentZoom: "Days",
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
      <div className="gantt-container">
        <Gantt
          tasks={data}
          zoom={this.state.currentZoom}
          onTaskUpdated={this.logTaskUpdate}
          onLinkUpdated={this.logLinkUpdate}
        />
      </div>
    );
  }
}

export default Dashboard;
