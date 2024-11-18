from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from jinja2 import Template

SMTP_SERVER = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = "admin@iitm.ac.in"
SENDER_PASSWORD = ''

def send_email(to, subject, content_body):
    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(content_body, 'html'))
    client = smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT)
    client.login(SENDER_EMAIL,SENDER_PASSWORD)
    client.send_message(msg=msg)
    client.quit()
    return True

# send_email('admin@iitm.ac.in', 'Subject Here', '<h1> test 01 </h1>')