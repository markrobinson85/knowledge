# -*- coding: utf-8 -*-

from urllib import urlencode

from openerp import api, models, fields
from openerp.exceptions import Warning


class DocumentPage(models.Model):
    _inherit = 'document.page'

    model_ids = fields.Many2many(
        'ir.model', 'ir_model_document_page_rel',
        'page_id', 'model_id', 'Models',
        groups='base.group_document_technical_manager',
        help='For future use to present specific pages on systray load.')

    icon_class = fields.Char('Icon Class', groups='base.group_document_technical_manager')

    sequence = fields.Integer('Sequence', default=0, groups='base.group_document_technical_manager')

    @api.model
    def render(self, page_id, model_name):
        """Return the content of a document."""
        # TODO: Present the related module's content.
        if page_id:
            pages = self.sudo().browse(page_id)
        else:
            model = self.sudo().env['ir.model'].search([('model', '=', model_name)])
            pages = self.sudo().search([('model_ids', 'in', model.ids), ('type', '=', 'content')])
            categories = self.sudo().search([('model_ids', 'in', model.ids), ('type', '=', 'category')])
            if len(pages) == 0:
                pages = self.sudo().search([('type', '=', 'content')])
            if len(categories) == 0:
                categories = self.sudo().search([('type', '=', 'category')])
        if len(pages.ids) == 0:
            raise Warning('Unable to find page id referenced.')

        values = {
            'pages': pages,
            'categories': categories,
        }

        res = self.env['ir.ui.view'].sudo().search([('name', '=', 'knowledge_container')]).render(values)

        return res

