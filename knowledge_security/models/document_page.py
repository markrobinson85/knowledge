# -*- coding: utf-8 -*-

from urllib import urlencode

from openerp import api, models, fields
from openerp.exceptions import Warning


class DocumentPage(models.Model):
    _inherit = 'document.page'

    groups_id = fields.Many2many('res.groups', 'document_page_group_rel', 'document_id', 'group_id',
                                 string='Groups',
                                 help="If this field is empty, all groups may view this document.")

