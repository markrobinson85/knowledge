odoo.define('document_systray.dialog', function (require) {
"use strict";

var core = require('web.core');
var Dialog = require('web.Dialog');
var dom_utils = require('web.dom_utils');
var Model = require('web.Model');
var Widget = require('web.Widget');
var session = require('web.session');
var utils = require('web.utils');

var QWeb = core.qweb;

var _t = core._t;

var KnowledgePage = core.Class.extend({
    init: function (dom, page_index) {
        var $dom = $(dom);
        this.dom = dom;
        this.menu_item = null;
        this.title = $dom.find('[data-menutitle]').data('menutitle');
        this.category_id = $dom.find('[data-categoryid]').data('categoryid');
        this.res_id = parseInt($dom.context.dataset.resId);
        var page_id = this.title.replace(/\s/g, '') + page_index;
        this.set_page_id(page_id);
    },
    set_page_id: function (id) {
        this.id = id;
        $(this.dom).attr('id', id);
    },
    toggle_done: function () {
        this.done = ! this.done;
    },
});

var KnowledgeCategory = core.Class.extend({
    init: function (dom, page_index) {
        var $dom = $(dom);
        this.dom = dom;
        this.menu_item = null;
        this.title = $dom.find('[data-menutitle]').data('menutitle');
        this.res_id = parseInt($dom.context.dataset.resId);
        this.child_category_ids = []
        var page_id = this.title.replace(/\s/g, '') + page_index;
        this.set_page_id(page_id);
    },
    set_page_id: function (id) {
        this.id = id;
        $(this.dom).attr('id', id);
    },
    toggle_done: function () {
        this.done = ! this.done;
    },
    get_category_name: function (category_selector) {
        var $page = $(this.dom);

        return $page.parents(category_selector).attr('menu-category-id');
    },
});

var KnowledgeDialog = Widget.extend({
    template: "KnowledgeDialog",
    pages: [],
    menu_items: [],
    currently_shown_page: null,
    currently_active_menu_item: null,
    category_selector: 'div[menu-category-id]',
    events: {
        'click li a[href^="#"]:not([data-toggle="collapse"])': 'change_page',
        'click button.discuss_page': 'click_to_discuss',
        'click a.btn-next': 'change_to_next_page',
//        'click .o_kb_close_block span': 'close_modal',
        'click .o_kb_close_block span': 'destroy',
    },
    init: function(parent, model) {
        this._super(parent);
//        this.kb = model;
        this.model = model;
//        this.doc_id =
        this.pages = [];
        this.categories = [];
        this.menu_items = [];
    },
    /**
     * Fetch the kb's rendered template
     */
    willStart: function() {
        var self = this;
        var res = this._super.apply(this, arguments).then(function() {
            return (new Model('document.page')).call('render',
                [0, self.model],
                {context: session.user_context});
        }).then(function(template) {
            self.$res = $(template);
        });
        return res;
    },
    start: function() {
        var self = this;
        return this._super.apply(this, arguments).then(function() {
            self.$res.find('.o_kb_page').andSelf().filter('.o_kb_page').each(function(index, dom_page) {
                var page = new KnowledgePage(dom_page, index);
                self.pages.push(page);
            });

            self.$res.find('.o_kb_category').andSelf().filter('.o_kb_category').each(function(index, dom_page) {
                var page = new KnowledgePage(dom_page, index);
                self.pages.push(page);
            });

            var $menu = self.render_menu();  // wil use self.$res
            self.$('.o_kb_menu ul').html($menu);
            self.menu_items = self.$('.o_kb_menu li');

            self.pages.forEach(function(page) {
                page.menu_item = self._find_menu_item_by_page_id(page.id);
            });
            self.$el.find('.o_kb_content_wrapper').append(self.$res);

            // update the kb_data with the new inputs of the view
//            var actual_vals = self._get_values();
//            self.kb.data = _.defaults(self.kb.data, actual_vals);
            // set the default value
//            self._set_values(self.kb.data);
            // show last opened page
            self._show_last_open_page();
//            self.prepare_kb_event();
        });
    },
    /**
     * This method should be overridden in other kbs to bind their custom events once the
     * view is loaded.
     */
//    prepare_kb_event: function() {
//        var self = this;
//        this.on('change:progress', this, function() {
//            self.trigger('kb_progress_changed', self.get('progress'));
//        });
//        this.on('kb_progress_changed', this, this.update_ui_progress_bar);
//        // set progress to trigger initial UI update
//        var initial_progress = false;
//        if (!this.kb.progress) {
//            var total_pages = 0;
//            this.pages.forEach(function(page) {
//                if (! page.hide_mark_as_done) {
//                    total_pages++;
//                }
//            });
//            initial_progress = parseInt(( 1 / (total_pages + 1)) * 100, 10);
//        }
//        this.set('progress', initial_progress || this.kb.progress);
//    },
    _render_done_page: function (page) {
        var mark_as_done_button = this.$('.mark_as_done')
        var mark_as_done_li = mark_as_done_button.find('i');
        var next_button = this.$('a.btn-next');
        var active_menu = $(page.menu_item).find('span');
        if (page.done) {
            active_menu.addClass('fa-check');
            mark_as_done_button.removeClass('btn-primary');
            mark_as_done_li.removeClass('fa-square-o');
            mark_as_done_button.addClass('btn-default');
            mark_as_done_li.addClass('fa-check-square-o');
            next_button.removeClass('btn-default');
            next_button.addClass('btn-primary');

            // page checked animation
            $(page.dom).addClass('marked');
            setTimeout(function() {
                $(page.dom).removeClass('marked');
            }, 1000);
        } else {
            active_menu.removeClass('fa-check');
            mark_as_done_button.removeClass('btn-default');
            mark_as_done_li.removeClass('fa-check-square-o');
            mark_as_done_button.addClass('btn-primary');
            mark_as_done_li.addClass('fa-square-o');
            next_button.removeClass('btn-primary');
            next_button.addClass('btn-default');
        }
        if (page.hide_mark_as_done) {
            next_button.removeClass('btn-default').addClass('btn-primary');
        }
    },
    _show_last_open_page: function () {
        var last_open_page = utils.get_cookie(this.cookie_name);

//        if (! last_open_page) {
//            last_open_page = this.kb.data.last_open_page || false;
//        }

//        if (last_open_page && this._find_page_by_id(last_open_page)) {
//            this._display_page(last_open_page);
//        } else {
        this._display_page(this.pages[0].id);
//        }

    },
    update_ui_progress_bar: function(percent) {
        this.$(".progress-bar").css('width', percent+"%");
        this.$(".o_progress_text").text(percent+"%");
    },
    _create_menu_item: function(page, menu_items, menu_item_page_map) {
        var $page = $(page.dom);
        var $menu_item_element = $page.find('h1[data-menutitle]');
        var menu_title = $menu_item_element.data('menutitle') || $menu_item_element.text();

        menu_items.push(menu_title);
        menu_item_page_map[menu_title] = page.id;
    },
    render_menu: function() {
        var self = this;
        var orphan_pages = [];
        var menu_categories = [];
        var menu_item_page_map = {};

        // pages with no category
        self.pages.forEach(function(page) {
            if (! page.hide_from_menu && ! page.category_id) {
                self._create_menu_item(page, orphan_pages, menu_item_page_map);
            }
        });

        // pages with a category
        self.$res.filter(self.category_selector).each(function(index, menu_category) {
            var $menu_category = $(menu_category);
            var menu_category_item = {
                name: $menu_category.attr('menu-category-id'),
                classes: $menu_category.attr('menu-classes'),
                menu_items: [],
            };

            self.pages.forEach(function(page) {
                if (! page.hide_from_menu && page.category_id === menu_category_item.name) {
                    self._create_menu_item(page, menu_category_item.menu_items, menu_item_page_map);
                }
            });
            var existing_category;
            existing_category = _.find(menu_categories, { 'name': menu_category_item.name });
//            if (~menu_categories.indexOf(menu_category_item) == false) {
            if (_.find(menu_categories, { 'name': menu_category_item.name }) === undefined) {
                menu_categories.push(menu_category_item);
            }

            // remove the branding used to separate the pages
            self.$res = self.$res.not($menu_category);
            self.$res = self.$res.add($menu_category.contents());
        });

        var menu = QWeb.render('KnowledgeMenu', {
            'orphan_pages': orphan_pages,
            'menu_categories': menu_categories,
            'menu_item_page_map': menu_item_page_map
        });

        return menu;
    },
    get_next_page_id: function() {
        var self = this;
        var current_page_found = false;
        var next_page_id = null;
        this.pages.every(function(page) {
            if (current_page_found) {
                next_page_id = page.id;
                return false;
            }

            if (page.id === self.currently_shown_page.id) {
                current_page_found = true;
            }

            return true;
        });

        return next_page_id;
    },
    change_to_next_page: function(ev) {
        var next_page_id = this.get_next_page_id();

        ev.preventDefault();

        if (next_page_id) {
            this._display_page(next_page_id);
        }
    },
    change_page: function(ev) {
        ev.preventDefault();
        var page_id = $(ev.currentTarget).attr('href').replace('#', '');
        this._display_page(page_id);
    },
    _find_page_by_id: function (id) {
        var result = _.find(this.pages, function (page) {
            return page.id === id;
        });

        return result;
    },
    _find_menu_item_by_page_id: function (page_id) {
        var result = _.find(this.menu_items, function (menu_item) {
            var $menu_item = $(menu_item);
            return $($menu_item.find('a')).attr('href') === '#' + page_id;
        });

        return result;
    },
    _display_page: function(page_id) {
        var self = this;
        var next_button = this.$('a.btn-next');
        var page = this._find_page_by_id(page_id);
        if (this.currently_active_menu_item) {
            $(this.currently_active_menu_item).removeClass('active');
        }

        var menu_item = this._find_menu_item_by_page_id(page_id);
        $(menu_item).addClass('active');
        this.currently_active_menu_item = menu_item;

        if (this.currently_shown_page) {
            $(this.currently_shown_page.dom).removeClass('show');
        }

        $(page.dom).addClass('show');
        this.currently_shown_page = page;

        if (! this.get_next_page_id()) {
            next_button.hide();
        } else {
            next_button.show();
        }

        this._render_done_page(this.currently_shown_page);

//        this.kb.data.last_open_page = page_id;
//        utils.set_cookie(this.cookie_name, page_id, 8*60*60); // create cookie for 8h
        this.$(".modal-body").scrollTop("0");

        this.$('textarea').each(function () {
            dom_utils.autoresize($(this), {parent: self});
        });

        this.$('.o_currently_shown_page').text(this.currently_shown_page.title);
    },
    click_to_discuss: function(ev) {
        ev.preventDefault();
        var self = this;
        return self.rpc("/web/action/load", {action_id: "document_page.action_page"}).then(function(result) {
            var new_views = [];
            // Move the form view to the front of views, so that we go into the form view vs list.
            _.each(result.views, function(view) {
                new_views[view[1] === 'form' ? 'unshift' : 'push'](view);
            });
            result.views = new_views;
            result.view_mode = 'form';
            result.res_id = self.currently_shown_page.res_id;
            self.close_modal(ev);
            return self.do_action(result);
        });
    },
    close_modal: function(ev) {
        ev.preventDefault();
        this.$el.modal('hide');
        this.$el.detach();
    },
    destroy: function() {
        this.$el.modal('hide');
        return this._super.apply(this, arguments);
    }
});

return {
    KnowledgeDialog: KnowledgeDialog,
};

});

