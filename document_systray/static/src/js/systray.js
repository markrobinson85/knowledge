odoo.define('document_systray.systray', function (require) {
"use strict";

var core = require('web.core');
var SystrayMenu = require('web.SystrayMenu');
var webclient = require('web.web_client');
var Widget = require('web.Widget');
var DocumentDialogCommon = require('document_systray.dialog');
var KnowledgeDialog = DocumentDialogCommon.KnowledgeDialog;
//var chat_manager = require('mail.chat_manager');

var QWeb = core.qweb;

function parse_query_string(query) {
  var vars = query.replace("#", '').split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}

/**
 * Menu item appended in the systray part of the navbar, redirects to the Inbox in Discuss
 * Also displays the needaction counter (= Inbox counter)
 */
var Knowledge = Widget.extend({
    template:'document_systray.quickhelp',
    events: {
        "click": "on_click",
    },
    start: function () {
        return this._super();
    },
    init: function(parent, data){
        this.data = data;
        this.parent = parent;
        this.knowledge_by_menu = {};
        this._super.apply(this, arguments);
    },
//    willStart:function(){
//        var self = this;
////        return new Model('document.page').query().all().then(function(res) {
////            self.planners = res;
////            _.each(self.planners, function(planner) {
////                self.planner_by_menu[planner.menu_id[0]] = planner;
////                self.planner_by_menu[planner.menu_id[0]].data = $.parseJSON(planner.data) || {};
////            });
////            self.set_overall_progress();
////        });
////        self.knowledge_by_menu[136].view_id
//    },
    on_click: function (e) {
        event.preventDefault();
        var query = window.location.hash;
        var qs = parse_query_string(query);
        var model = qs.model;
        // Setup the planner if we didn't do it yet
        if (this.model && this.model == model) {
            this.model = null
            this.setup_knowledge_dialog(model);
            // TODO: Find a better way to reload the content.
//            this.dialog.$el.modal('show');
        }
        else {
            this.setup_knowledge_dialog(model);
        }
    },
    setup_knowledge_dialog: function(model){
        var self = this;
        this.model = model;
        if (this.dialog) {
            this.dialog.destroy();
        }
        this.dialog = new KnowledgeDialog(this, this.model);

        this.dialog.appendTo(webclient.$el).then(function() {
            self.dialog.$el.modal('show');
        });
    },
});

SystrayMenu.Items.push(Knowledge);

});
