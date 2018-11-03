/*global gantt*/
/* eslint-disable */

calculateRelationSlack(task) {
    var minSlack = 0,
      slack,
      links = task.$source;

    for (var i = 0; i < links.length; i++) {
      slack = this.calculateLinkSlack(links[i]);
      if (minSlack > slack || i === 0) {
        minSlack = slack;
      }
    }

    return minSlack;
  }

  calculateTaskSlack(taskId) {
    if (!gantt.isTaskExists(taskId)) return 0;
    var slack;

    var task = gantt.getTask(taskId);
    if (task.$source && task.$source.length) {
      slack = this.calculateRelationSlack(task);
    } else {
      slack = this.calculateHierarchySlack(task);
    }

    return slack;
  }

  calculateLinkSlack(linkId) {
    var link = gantt.getLink(linkId);
    var slack = 0;
    if (gantt.isTaskExists(link.source) && gantt.isTaskExists(link.target)) {
      slack = gantt.getSlack(
        gantt.getTask(link.source),
        gantt.getTask(link.target)
      );
    }
    return slack;
  }

  calculateHierarchySlack(task) {
    var slack = 0;
    if (gantt.isTaskExists(task.parent)) {
      var parent = gantt.getTask(task.parent);
      var from = gantt.getSubtaskDates(task.id).end_date || task.end_date;
      var to = gantt.getSubtaskDates(parent.id).end_date || parent.end_date;
      slack = Math.max(gantt.calculateDuration(from, to), 0);
    }

    return slack;
  }

  updateSlack() {
    var changedTasks = {},
      changed = false;

    gantt.eachTask(function(task) {
      var newSlack = this.calculateTaskSlack(task.id);
      if (newSlack != task.slack) {
        task.slack = this.calculateTaskSlack(task.id);
        changedTasks[task.id] = true;
        changed = true;
      }
    });

    if (changed) {
      gantt.batchUpdate(function() {
        for (var i in changedTasks) {
          if (changedTasks[i] === true) {
            gantt.updateTask(i);
          }
        }
      });
    }
  }