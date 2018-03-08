# -*- coding: utf-8 -*-
from urllib import urlencode

from openerp import api, models, fields
from openerp.exceptions import Warning

class DocumentPage(models.Model):
    """Planner Model.
    Each Planner has link to an ir.ui.view record that is a template used
    to display the planner pages.
    Each Planner has link to ir.ui.menu record that is a top menu used to display the
    planner launcher(progressbar)

    Method _prepare_<planner_application>_data(self, cr, uid, context) that
    generate the values used to display in specific planner pages
    """
    _inherit = 'document.page'

    model_ids = fields.Many2many(
        'ir.model', 'ir_model_document_page_rel',
        'page_id', 'model_id', 'Models')

    # @api.model
    # def render(self, template_id, planner_app):
    #     # prepare the planner data as per the planner application
    #     values = {
    #         'prepare_backend_url': self.prepare_backend_url,
    #         'is_module_installed': self.is_module_installed,
    #     }
    #     planner_find_method_name = '_prepare_%s_data' % planner_app
    #     if hasattr(self, planner_find_method_name):
    #         values.update(getattr(self, planner_find_method_name)()) # update the default value
    #     return self.env['ir.ui.view'].browse(template_id).render(values=values)

    @api.model
    def render(self, page_id, model_name):
        """Return the content of a document."""
        if page_id:
            pages = self.browse(page_id)
        else:
            # pages = self.search([('model_ids', 'in', model_name)])
            model = self.env['ir.model'].search([('model', '=', model_name)])
            pages = self.search([('model_ids', 'in', model.ids), ('type', '=', 'content')])
            categories = self.search([('model_ids', 'in', model.ids), ('type', '=', 'category')])
            if len(pages) == 0:
                pages = self.search([('type', '=', 'content')])
            if len(categories) == 0:
                categories = self.search([('type', '=', 'category')])
        if len(pages.ids) == 0:
            raise Warning('Unable to find page id referenced.')
        # if page.type == "category":
        #     display_content = self._get_page_index(page, link=False)
        # else:
        #     display_content = page.content
        values = {
            'pages': pages,
            'categories': categories,
        }

        res = self.env['ir.ui.view'].search([('name', '=','knowledge_container')]).render(values)

        return res

