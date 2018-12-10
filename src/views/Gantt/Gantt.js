/*global gantt*/
import React, { Component } from "react";
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./plugin.js";
//import "./grouping.js";
import "./critical_path.js";
import "./Gantt.scss";
import "./progress_calculation.js";
import { connect } from "react-redux";
import {
  createTask,
  updateTask,
  deleteTask,
  createLink,
  updateLink,
  deleteLink
} from "../../store/actions";
import { getTaskById } from "../../store/selectors";

let resources = [
  { id: undefined, text: "Unassigned" },
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

const mapStateToProps = state => {
  return {
    getTaskById: taskId => getTaskById(state, taskId)
  };
};

class Gantt extends Component {
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
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "%F";
        gantt.config.scale_height = 60;
        gantt.config.subscales = [{ unit: "week", step: 1, date: "#%W" }];
        break;
      default:
        break;
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

  stripHiddenProps(task) {
    const ret = {};
    for (var prop in task) {
      if (prop.startsWith("$")) continue;
      ret[prop] = task[prop];
    }
    return ret;
  }

  initGanttEvents() {
    if (gantt.ganttEventsInitialized) {
      return;
    }
    gantt.ganttEventsInitialized = true;

    gantt.attachEvent("onLightboxSave", function(id, task, is_new) {
      task.unscheduled = !task.start_date;
      return true;
    });

    gantt.attachEvent("onAfterTaskAdd", (id, task) => {
      //console.log("Add", task);
      if (task.start_date && task.end_date) {
        const immutableTask = JSON.parse(
          JSON.stringify(this.stripHiddenProps(task))
        );
        const oldID = task.id;
        this.props.createTask(immutableTask).then(newID => {
          //console.log("Changing ID", oldID, newID);
          //gantt.changeTaskId(oldID, newID);
        });
      }
    });

    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
      const immutableTask = JSON.parse(JSON.stringify(task));
      //console.log("Update", this.stripHiddenProps(immutableTask));
      //check if to insert or update
      if (this.props.getTaskById(id)) {
        //update
        this.props.updateTask(this.stripHiddenProps(immutableTask));
      } else {
        //insert
        const oldID = task.id;
        this.props
          .createTask(this.stripHiddenProps(immutableTask))
          .then(newID => {
            //console.log("Changing ID", oldID, newID);
            //gantt.changeTaskId(oldID, newID);
          });
      }
      //console.log("Update", task, JSON.parse(JSON.stringify(task)));
    });

    gantt.attachEvent("onAfterTaskDelete", id => {
      this.props.deleteTask(id);
      //console.log('Delete');
    });

    gantt.attachEvent("onAfterLinkAdd", (id, link) => {
      this.props.createLink(link);
      if (this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, "inserted", link);
      }
    });

    gantt.attachEvent("onAfterLinkUpdate", (id, link) => {
      this.props.updateLink(link);
      if (this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, "updated", link);
      }
    });

    gantt.attachEvent("onAfterLinkDelete", (id, link) => {
      this.props.deleteLink(id);
      if (this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, "deleted");
      }
    });

    gantt.attachEvent("onError", errorMessage => {
      console.warn("Gantt error", errorMessage);
      return true;
    });
  }

  parseDatesInTasks(tasks) {
    return {
      links: tasks.links,
      data: tasks.data.map(task => {
        const c = task;
        if (task.start_date) {
          c.start_date = new Date(task.start_date);
        }
        if (task.end_date) {
          c.end_date = new Date(task.end_date);
        }
        return c;
      })
    };
  }

  componentDidMount() {
    this.initGanttEvents();
    //console.log("Mounted", JSON.parse(JSON.stringify(this.props.tasks)));
    gantt.init(this.ganttContainer);
    gantt.parse(
      this.parseDatesInTasks(JSON.parse(JSON.stringify(this.props.tasks)))
    );
  }

  componentDidUpdate() {
    //console.log("Updated", JSON.parse(JSON.stringify(this.props.tasks)));
    //gantt.init(this.ganttContainer);
    //gantt.unselectTask();
    gantt.clearAll();
    gantt.resetLightbox();
    gantt.parse(
      this.parseDatesInTasks(JSON.parse(JSON.stringify(this.props.tasks)))
    );
    //gantt.setSizes();
    //gantt.render();
  }

  render() {
    this.setZoom(this.props.zoom);
    this.setColumns(["text", "start_date", "owner", "duration", "add"]);
    gantt.config.highlight_critical_path = true;
    //gantt.config.show_slack = true;
    //gantt.config.autosize = "xy";
    gantt.config.work_time = true;
    gantt.config.show_unscheduled = true;
    gantt.config.open_tree_initially = true;
    gantt.locale.labels.time_enable_button = "Schedule";
    gantt.locale.labels.time_disable_button = "Unschedule";
    gantt.locale.labels.section_owner = "Assigned to";
    gantt.config.lightbox.sections = [
      {
        name: "description",
        height: 70,
        map_to: "text",
        type: "textarea",
        focus: true
      },
      { name: "time", map_to: "auto", button: true, type: "duration_optional" },
      {
        name: "owner",
        height: 22,
        map_to: "owner_id",
        type: "select",
        options: resources.map(resource => {
          return { key: resource.id, label: resource.text };
        })
      }
    ];
    gantt.templates.task_class = function(start, end, task) {
      if (task.type === gantt.config.types.project) {
        return "task-project";
      } else {
        return "task-task";
      }
    };
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

export default connect(
  mapStateToProps,
  { createTask, updateTask, deleteTask, createLink, updateLink, deleteLink }
)(Gantt);
