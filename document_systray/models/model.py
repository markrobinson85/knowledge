# -*- coding: utf-8 -*-

import logging
from openerp import models, fields, api

_logger = logging.getLogger(__name__)


class DocumentModels(models.Model):
    _inherit = 'ir.model'

    page_ids = fields.Many2many(
        'ir.model', 'ir_model_document_page_rel',
        'model_id', 'page_id', 'Document Pages')

