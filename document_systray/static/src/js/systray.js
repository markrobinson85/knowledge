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
            this.dialog.$el.modal('show');
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
//        this.dialog.on("planner_progress_changed", this, function(percent) {
//            self.kb.progress = percent;
//            self.update_planner_progress();
//        });
        this.dialog.appendTo(webclient.$el).then(function() {
            self.dialog.$el.modal('show');
        });
    },
//    _display_page: function(page_id) {
//        var self = this;
//        var mark_as_done_button = this.$('button.mark_as_done');
//        var next_button = this.$('a.btn-next');
//        var page = this._find_page_by_id(page_id);
//        if (this.currently_active_menu_item) {
//            $(this.currently_active_menu_item).removeClass('active');
//        }
//
//        var menu_item = this._find_menu_item_by_page_id(page_id);
//        $(menu_item).addClass('active');
//        this.currently_active_menu_item = menu_item;
//
//        if (this.currently_shown_page) {
//            $(this.currently_shown_page.dom).removeClass('show');
//        }
//
//        $(page.dom).addClass('show');
//        this.currently_shown_page = page;
//
//        if (! this.get_next_page_id()) {
//            next_button.hide();
//        } else {
//            next_button.show();
//        }
//
//        if (page.hide_mark_as_done) {
//            mark_as_done_button.hide();
//        } else {
//            mark_as_done_button.show();
//        }
//
//        this._render_done_page(this.currently_shown_page);
//
//        this.planner.data.last_open_page = page_id;
//        utils.set_cookie(this.cookie_name, page_id, 8*60*60); // create cookie for 8h
//        this.$(".modal-body").scrollTop("0");
//
//        this.$('textarea').each(function () {
//            dom_utils.autoresize($(this), {parent: self});
//        });
//
//        this.$('.o_kb_current_page').text(this.currently_shown_page.title);
//    },
});

SystrayMenu.Items.push(Knowledge);



/**
 * Menu item appended in the systray part of the navbar
 *
 * The menu item indicates the counter of needactions + unread messages in chat channels. When
 * clicking on it, it toggles a dropdown containing a preview of each pinned channels (except
 * static and mass mailing channels) with a quick link to open them in chat windows. It also
 * contains a direct link to the Inbox in Discuss.
 **/
//var MessagingMenu = Widget.extend({
//        template:'mail.chat.MessagingMenu',
//        events: {
//            "click": "on_click",
//            "click .o_filter_button": "on_click_filter_button",
//            "click .o_new_message": "on_click_new_message",
//            "click .o_mail_channel_preview": "on_click_channel",
//        },
//        start: function () {
//            this.$filter_buttons = this.$('.o_filter_button');
//            this.$channels_preview = this.$('.o_mail_navbar_dropdown_channels');
//            this.filter = false;
//            chat_manager.bus.on("update_channel_unread_counter", this, this.update_counter);
//            chat_manager.is_ready.then(this.update_counter.bind(this));
//            return this._super();
//        },
//        is_open: function () {
//            return this.$el.hasClass('open');
//        },
//        update_counter: function () {
//            var counter = chat_manager.get_unread_conversation_counter();
//            this.$('.o_notification_counter').text(counter);
//            this.$el.toggleClass('o_no_notification', !counter);
//            this.$el.toggleClass('o_unread_chat', !!chat_manager.get_chat_unread_counter());
//            if (this.is_open()) {
//                this.update_channels_preview();
//            }
//        },
//        update_channels_preview: function () {
//            var self = this;
//
//            // Display spinner while waiting for channels preview
//            this.$channels_preview.html(QWeb.render('mail.chat.Spinner'));
//
//            chat_manager.is_ready.then(function () {
//                var channels = _.filter(chat_manager.get_channels(), function (channel) {
//                    if (self.filter === 'chat') {
//                        return channel.is_chat;
//                    } else if (self.filter === 'channels') {
//                        return !channel.is_chat && channel.type !== 'static';
//                    } else {
//                        return channel.type !== 'static';
//                    }
//                });
//
//                chat_manager.get_channels_preview(channels).then(self._render_channels_preview.bind(self));
//            });
//        },
//        _render_channels_preview: function (channels_preview) {
//            // Sort channels: 1. channels with unread messages, 2. chat, 3. by date of last msg
//            channels_preview.sort(function (c1, c2) {
//                return Math.min(1, c2.unread_counter) - Math.min(1, c1.unread_counter) ||
//                       c2.is_chat - c1.is_chat ||
//                       c2.last_message.date.diff(c1.last_message.date);
//            });
//
//            // Generate last message preview (inline message body and compute date to display)
//            _.each(channels_preview, function (channel) {
//                channel.last_message_preview = chat_manager.get_message_body_preview(channel.last_message.body);
//                if (channel.last_message.date.isSame(new Date(), 'd')) {  // today
//                    channel.last_message_date = channel.last_message.date.format('LT');
//                } else {
//                    channel.last_message_date = channel.last_message.date.format('lll');
//                }
//            });
//
//            this.$channels_preview.html(QWeb.render('mail.chat.ChannelsPreview', {
//                channels: channels_preview,
//            }));
//        },
//        on_click: function () {
//            if (!this.is_open()) {
//                this.update_channels_preview();  // we are opening the dropdown so update its content
//            }
//        },
//        on_click_filter_button: function (event) {
//            event.stopPropagation();
//            this.$filter_buttons.removeClass('o_selected');
//            var $target = $(event.currentTarget);
//            $target.addClass('o_selected');
//            this.filter = $target.data('filter');
//            this.update_channels_preview();
//        },
//        on_click_new_message: function () {
//            chat_manager.bus.trigger('open_chat');
//        },
//        on_click_channel: function (event) {
//            var channel_id = $(event.currentTarget).data('channel_id');
//            var channel = chat_manager.get_channel(channel_id);
//            if (channel) {
//                chat_manager.open_channel(channel);
//            }
//        },
//});
//
//SystrayMenu.Items.push(MessagingMenu);

});
