from odoo import api, fields, models


class MailMobileData(models.Model):
    _name = 'mail.mobile.data'
    _description = 'Model Mail Mobile Data'

    name = fields.Char(string='Name', required=True)
    code = fields.Char(string='Code', required=True)

    _sql_constraints = [
        ('code_unique', 'unique(code)',
         'Code already used, please try another options.')
    ]
