/*global gantt*/
import React, { Component } from "react";
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./plugin.js";
//import "./grouping.js";
import "./critical_path.js";

let resources = [
  { id: "0", text: "Alexandra" },
  { id: "1", text: "Bob" },
  { id: "2", text: "Charlie" },
  { id: "3", text: "Dominic" },
  { id: "4", text: "Eugene" },
  { id: "5", text: "Fred" },
  { id: "6", text: "George" },
  { id: "7", text: "Harry" },
  { id: "8", text: "Irene" }
];

export default class Gantt extends Component {
  setZoom(value) {
    switch (value) {
      case "Hours":
        gantt.config.scale_unit = "day";
        gantt.config.date_scale = "%d %M";

        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 30;
        gantt.config.subscales = [{ unit: "hour", step: 1, date: "%H" }];
        break;
      case "Days":
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "#%W";
        gantt.config.subscales = [{ unit: "day", step: 1, date: "%d %M" }];
        gantt.config.scale_height = 60;
        break;
      case "Months":
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F";
        gantt.config.scale_height = 60;
        gantt.config.subscales = [{ unit: "week", step: 1, date: "#%W" }];
        break;
      default:
        break;
    }
  }

  toggleGroups() {
    gantt.$groupMode = !gantt.$groupMode;
    if (gantt.$groupMode) {
      var groups = resources.map(function(item) {
        var group = gantt.copy(item);
        group.group_id = group.id;
        group.id = gantt.uid();
        return group;
      });

      gantt.groupBy({
        groups: groups,
        relation_property: gantt.config.resource_property,
        group_id: "group_id",
        group_text: "text"
      });
    } else {
      gantt.groupBy(false);
    }
  }

  //Set columns from an array of names eg ["name", "duration", "owner"]
  setColumns(cols) {
    let c = [];
    cols.forEach(col => {
      switch (col) {
        case "text":
          c.push({ name: "text", tree: true, width: 200, resize: true });
          break;
        case "start_date":
          c.push({
            name: "start_date",
            align: "center",
            width: 80,
            resize: true
          });
          break;
        case "owner":
          c.push({
            name: "owner",
            align: "center",
            width: 80,
            label: "Owner",
            template: function(task) {
              if (task.type === gantt.config.types.project) {
                return "";
              }
              var owner = resources.find(
                item => item.id === task[gantt.config.resource_property]
              );

              if (owner) {
                return owner.text;
              } else {
                return "Unassigned";
              }
            },
            resize: true
          });
          break;
        case "duration":
          c.push({
            name: "duration",
            width: 60,
            align: "center",
            resize: true
          });
          break;
        case "add":
          c.push({ name: "add", width: 44 });
          break;
        default:
          console.warning("Unknown column", col);
      }
    });
    gantt.config.columns = c;
  }

  shouldComponentUpdate(nextProps) {
    return this.props.zoom !== nextProps.zoom;
  }

  componentDidUpdate() {
    gantt.render();
  }

  initGanttEvents() {
    if (gantt.ganttEventsInitialized) {
      return;
    }
    gantt.ganttEventsInitialized = true;

    gantt.attachEvent("onAfterTaskAdd", (id, task) => {
      if (this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, "inserted", task);
      }
    });

    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
      if (this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, "updated", task);
      }
    });

    gantt.attachEvent("onAfterTaskDelete", id => {
      if (this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, "deleted");
      }
    });

    gantt.attachEvent("onAfterLinkAdd", (id, link) => {
      if (this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, "inserted", link);
      }
    });

    gantt.attachEvent("onAfterLinkUpdate", (id, link) => {
      if (this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, "updated", link);
      }
    });

    gantt.attachEvent("onAfterLinkDelete", (id, link) => {
      if (this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, "deleted");
      }
    });
  }

  componentDidMount() {
    this.initGanttEvents();
    gantt.init(this.ganttContainer);
    gantt.parse(this.props.tasks);
  }

  render() {
    this.setZoom(this.props.zoom);
    this.setColumns(["text", "start_date", "owner", "duration", "add"]);
    gantt.config.highlight_critical_path = true;
    return (
      <div
        ref={input => {
          this.ganttContainer = input;
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
}
