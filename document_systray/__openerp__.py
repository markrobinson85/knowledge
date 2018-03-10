# -*- coding: utf-8 -*-

{
    'name': 'Document Systray',
    'version': '9.0.1.0.1',
    'category': 'Knowledge Management',
    'author': 'Mark Robinson, Canzonia Software, Ltd.',
              'Odoo SA'
    'website': 'http://www.canzonia.com/',
    'license': 'LGPL-3',
    'depends': [
        'knowledge',
        'knowledge_security',
        'document_page'
    ],
    'data': [
        'views/systray.xml',
        'views/document_page_category.xml',
    ],
    'demo': [
    ],
    'installable': True,
    'auto_install': False,
	'qweb': [
        'static/src/xml/systray.xml',
    ],
}