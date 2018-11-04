/*global gantt*/
/* eslint-disable */

(function dynamicTaskType() {
  var delTaskParent;

  function checkParents(id) {
    setTaskType(id);
    var parent = gantt.getParent(id);
    if (parent != gantt.config.root_id) {
      checkParents(parent);
    }
  }

  function setTaskType(id) {
    id = id.id ? id.id : id;
    var task = gantt.getTask(id);
    var type = gantt.hasChild(task.id)
      ? gantt.config.types.project
      : gantt.config.types.task;
    if (type != task.type) {
      task.type = type;
      gantt.updateTask(id);
    }
  }

  gantt.attachEvent("onParse", function() {
    gantt.eachTask(function(task) {
      setTaskType(task);
    });
  });

  gantt.attachEvent("onAfterTaskAdd", function onAfterTaskAdd(id) {
    gantt.batchUpdate(checkParents(id));
  });

  gantt.attachEvent("onBeforeTaskDelete", function onBeforeTaskDelete(
    id,
    task
  ) {
    delTaskParent = gantt.getParent(id);
    return true;
  });

  gantt.attachEvent("onAfterTaskDelete", function onAfterTaskDelete(id, task) {
    if (delTaskParent != gantt.config.root_id) {
      gantt.batchUpdate(checkParents(delTaskParent));
    }
  });
})();

// recalculate progress of summary tasks when the progress of subtasks changes
// also recalculate total duration when the duration of subtasks changes
// also recaculate the end date
(function dynamicProgress() {
  function calculateSummaryProgress(task) {
    if (task.type != gantt.config.types.project)
      return {
        progress: task.progress,
        duration: task.duration,
        end_date: task.end_date
      };
    var totalToDo = 0;
    var totalDone = 0;
    var totalDuration = 0;
    var latestEndDate = new Date(0);
    gantt.eachTask(function(child) {
      if (child.start_date) {
        const s = new Date(child.start_date.getTime());
        s.setDate(s.getDate() + child.duration);
        latestEndDate =
          latestEndDate.getMilliseconds() > s.getMilliseconds()
            ? latestEndDate
            : s;
      }
      if (child.type != gantt.config.types.project) {
        totalToDo += child.duration;
        totalDone += (child.progress || 0) * child.duration;
        totalDuration += child.duration || 0;
      }
    }, task.id);
    if (!totalToDo)
      return { progress: 0, duration: task.duration, end_date: task.end_date };
    else
      return {
        progress: totalDone / totalToDo,
        duration: totalDuration,
        end_date: latestEndDate
      };
  }

  function refreshSummaryProgress(id, submit) {
    if (!gantt.isTaskExists(id)) return;

    var task = gantt.getTask(id);
    const summary = calculateSummaryProgress(task);

    task.progress = summary.progress;
    task.duration = summary.duration;
    task.end_date = summary.end_date;

    if (!submit) {
      gantt.refreshTask(id);
    } else {
      gantt.updateTask(id);
    }

    if (!submit && gantt.getParent(id) !== gantt.config.root_id) {
      refreshSummaryProgress(gantt.getParent(id), submit);
    }
  }

  gantt.attachEvent("onParse", function() {
    gantt.eachTask(function(task) {
      const summary = calculateSummaryProgress(task);
      task.progress = summary.progress;
      task.duration = summary.duration;
      task.end_date = summary.end_date;
    });
  });

  gantt.attachEvent("onAfterTaskUpdate", function(id) {
    refreshSummaryProgress(gantt.getParent(id), true);
  });

  gantt.attachEvent("onTaskDrag", function(id) {
    refreshSummaryProgress(gantt.getParent(id), false);
  });
  gantt.attachEvent("onAfterTaskAdd", function(id) {
    refreshSummaryProgress(gantt.getParent(id), true);
  });

  (function() {
    var idParentBeforeDeleteTask = 0;
    gantt.attachEvent("onBeforeTaskDelete", function(id) {
      idParentBeforeDeleteTask = gantt.getParent(id);
    });
    gantt.attachEvent("onAfterTaskDelete", function() {
      refreshSummaryProgress(idParentBeforeDeleteTask, true);
    });
  })();
})();

gantt.templates.progress_text = function(start, end, task) {
  return (
    "<span style='text-align:left;'>" +
    Math.round(task.progress * 100) +
    "% </span>"
  );
};
