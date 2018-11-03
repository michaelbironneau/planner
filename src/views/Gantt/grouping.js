/*
@license

dhtmlxGantt v.5.2.0 Professional
This software can be used only as part of dhtmlx.com site.
You are not allowed to use it on any other site

(c) Dinamenta, UAB.

*/

/*global gantt*/
/* eslint-disable */
gantt.plugin(function(t) {
  t._groups = {
    relation_property: null,
    relation_id_property: "$group_id",
    group_id: null,
    group_text: null,
    loading: !1,
    loaded: 0,
    init: function(t) {
      var e = this;
      t.attachEvent("onClear", function() {
        e.clear();
      }),
        e.clear();
      var r = t.$data.tasksStore.getParent;
      t.$data.tasksStore.getParent = function(n) {
        return e.is_active() ? e.get_parent(t, n) : r.apply(this, arguments);
      };
      var n = t.$data.tasksStore.setParent;
      (t.$data.tasksStore.setParent = function(r, i) {
        if (!e.is_active()) return n.apply(this, arguments);
        if (t.isTaskExists(i)) {
          var o = t.getTask(i);
          (r[e.relation_property] = o[e.relation_id_property]),
            this._setParentInner.apply(this, arguments);
        }
      }),
        t.attachEvent("onBeforeTaskDisplay", function(r, n) {
          return !(
            e.is_active() &&
            n.type == t.config.types.project &&
            !n.$virtual
          );
        }),
        t.attachEvent("onBeforeParse", function() {
          e.loading = !0;
        }),
        t.attachEvent("onTaskLoading", function() {
          return (
            e.is_active() &&
              (e.loaded--,
              e.loaded <= 0 &&
                ((e.loading = !1),
                t.eachTask(
                  t.bind(function(e) {
                    this.get_parent(t, e);
                  }, e)
                ))),
            !0
          );
        }),
        t.attachEvent("onParse", function() {
          (e.loading = !1), (e.loaded = 0);
        });
    },
    get_parent: function(t, e, r) {
      void 0 === e.id && (e = t.getTask(e));
      var n = e[this.relation_property];
      if (void 0 !== this._groups_pull[n]) return this._groups_pull[n];
      var i = t.config.root_id;
      return (
        this.loading ||
          ((i = this.find_parent(
            r || t.getTaskByTime(),
            n,
            this.relation_id_property,
            t.config.root_id
          )),
          (this._groups_pull[n] = i)),
        i
      );
    },
    find_parent: function(t, e, r, n) {
      for (var i = 0; i < t.length; i++) {
        var o = t[i];
        if (void 0 !== o[r] && o[r] == e) return o.id;
      }
      return n;
    },
    clear: function() {
      (this._groups_pull = {}),
        (this.relation_property = null),
        (this.group_id = null),
        (this.group_text = null);
    },
    is_active: function() {
      return !!this.relation_property;
    },
    generate_sections: function(e, r) {
      for (var n = [], i = 0; i < e.length; i++) {
        var o = t.copy(e[i]);
        (o.type = r),
          (o.open = !0),
          (o.$virtual = !0),
          (o.readonly = !0),
          (o[this.relation_id_property] = o[this.group_id]),
          (o.text = o[this.group_text]),
          n.push(o);
      }
      return n;
    },
    clear_temp_tasks: function(t) {
      for (var e = 0; e < t.length; e++) t[e].$virtual && (t.splice(e, 1), e--);
    },
    generate_data: function(t, e) {
      var r = t.getLinks(),
        n = t.getTaskByTime();
      this.clear_temp_tasks(n);
      var i = [];
      this.is_active() &&
        e &&
        e.length &&
        (i = this.generate_sections(e, t.config.types.project));
      var o = { links: r };
      return (o.data = i.concat(n)), o;
    },
    update_settings: function(t, e, r) {
      this.clear(),
        (this.relation_property = t),
        (this.group_id = e),
        (this.group_text = r);
    },
    group_tasks: function(t, e, r, n, i) {
      this.update_settings(r, n, i);
      var o = this.generate_data(t, e);
      (this.loaded = o.data.length), t._clear_data(), t.parse(o);
    }
  };
  t._groups.init(t);
  t.groupBy = function(t) {
    var e = (t = t || {}).groups || null,
      r = t.relation_property || null,
      n = t.group_id || "key",
      i = t.group_text || "label";
    this._groups.group_tasks(this, e, r, n, i);
  };
});
