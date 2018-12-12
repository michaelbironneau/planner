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
import { getTaskById, getUsers } from "../../store/selectors";

const mapStateToProps = state => {
  return {
    getTaskById: taskId => getTaskById(state, taskId),
    resources: [{ id: null, text: "Unassigned" }, ...getUsers(state)]
  };
};

class Gantt extends Component {
  constructor(props) {
    super(props);
    this.setColumns = this.setColumns.bind(this);
  }

  componentWillUnmount() {
    //console.log("Unmounted");
    gantt.detachAllEvents();
  }

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
    const self = this;
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
              var owner = self.props.resources.find(
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
    const self = this;
    gantt.attachEvent("onLightboxSave", function(id, task, is_new) {
      task.unscheduled = !task.start_date;
      return true;
    });

    gantt.attachEvent("onAfterTaskAdd", (id, task) => {
      //console.log("Add", task);
      if (task.start_date || task.unscheduled) {
        const immutableTask = JSON.parse(
          JSON.stringify(self.stripHiddenProps(task))
        );
        const oldID = task.id;
        self.props.createTask(immutableTask).then(newID => {
          //console.log("Changing ID", oldID, newID);
          //gantt.changeTaskId(oldID, newID);
        });
      }
    });

    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
      const immutableTask = JSON.parse(JSON.stringify(task));
      //console.log("Update", self.stripHiddenProps(immutableTask));
      //check if to insert or update
      //console.log("Props", JSON.parse(JSON.stringify(self.props.tasks.data)));
      if (self.props.tasks.data.find(f => f.id === id)) {
        //update
        self.props.updateTask(self.stripHiddenProps(immutableTask));
      } else {
        //insert
        const oldID = task.id;
        self.props
          .createTask(self.stripHiddenProps(immutableTask))
          .then(newID => {
            //console.log("Changing ID", oldID, newID);
            //gantt.changeTaskId(oldID, newID);g
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
    gantt.clearAll();
    gantt.parse(
      this.parseDatesInTasks(JSON.parse(JSON.stringify(this.props.tasks)))
    );
  }

  componentDidUpdate() {
    //gantt.init(this.ganttContainer);
    //console.log("Update", JSON.parse(JSON.stringify(this.props.tasks)));
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
        options: this.props.resources.map(resource => {
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
