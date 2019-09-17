{
    'name': 'Mail Mobile',
    'version': '1.0',
    'summary': 'Send notif yo webview',
    'category': 'Mail',
    'author': 'Andre Agung Purnomo',
    'maintainer': 'Andre Agung Purnomo',
    'website': 'www.linkedin.com/in/andreagungpurnomo',
    'license': 'AGPL-3',
    'contributors': [
        'Andre Agung Purnomo',
    ],
    'depends': [
        'mail',
    ],
    'data': [
        # SECURITY
        'security/ir.model.access.csv',

        # DATA
        'views/data/mail_mobile_data_view.xml',

        # EXTEND
        'views/extend.xml',

        # MENU
        'views/menu.xml'
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
