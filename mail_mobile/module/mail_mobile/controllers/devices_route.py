from odoo.http import Controller, route, request
import json
import logging


class LSMGurindaReportBigBook(Controller):
    @route('/mail_mobile/get_devices', type='http', auth='public', website=False, csrf=False)
    def render(self, **kwargs):
        # INISIALISASI VARIABEL
        devices = request.env['mail.mobile.data'].sudo().search(
            []).mapped('code')

        # RENDER
        return json.dumps({"devices": devices})
