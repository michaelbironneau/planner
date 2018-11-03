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
(function dynamicProgress() {
  function calculateSummaryProgress(task) {
    if (task.type != gantt.config.types.project) return task.progress;
    var totalToDo = 0;
    var totalDone = 0;
    gantt.eachTask(function(child) {
      if (child.type != gantt.config.types.project) {
        totalToDo += child.duration;
        totalDone += (child.progress || 0) * child.duration;
      }
    }, task.id);
    if (!totalToDo) return 0;
    else return totalDone / totalToDo;
  }

  function refreshSummaryProgress(id, submit) {
    if (!gantt.isTaskExists(id)) return;

    var task = gantt.getTask(id);
    task.progress = calculateSummaryProgress(task);

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
      task.progress = calculateSummaryProgress(task);
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
