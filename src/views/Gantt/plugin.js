/*global gantt*/
/* eslint-disable */

/**Enable plugins */
gantt._ganttPlugin = [];
gantt.plugin = function(t) {
  gantt._ganttPlugin.push(t);
  t(gantt);
};

/** Other bits and bobs we're missing from pro version */
gantt._getHorizontalScrollbar = function() {
  return gantt.$ui.getView("scrollHor");
};
