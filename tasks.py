from celery import shared_task
import time
from datetime import timedelta
from flask_excel import make_response_from_query_sets
import flask_excel as excel
from models import *
from mail_service import send_email
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP
from jinja2 import Template

SMTP_SERVER = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = "admin@iitm.ac.in"
SENDER_PASSWORD = ''

# @shared_task(ignore_result = False)
# def create_csv(x,y):
#     time.sleep(120)
#     return x+y

@shared_task(ignore_result = False)
def create_csv():
    books = Book.query.with_entities(Book.name, Book.author).all()
    # print(books)
    csv_out = excel.make_response_from_query_sets(books, ['name', 'author'], 'csv')
    filename="books.csv"
    # file_path = './user-download/books.csv'

    with open(filename, 'wb') as file:
        file.write(csv_out.data)
    
    return filename

@shared_task(ignore_result=True)
def daily_reminder():
    users = User.query.all()
    now = datetime.utcnow()
    # timeleft = now - timedelta(hours=24)
    for user in users:
        if (now - user.last_activity) > timedelta(hours=24):
            send_email(user.email, 'Not Logged in Last 24 hours', '<h1>Login Now</h1>')
    return "Ok"

@shared_task(ignore_result=True)
def monthly_reminder():
    # Query all users
    users = User.query.join(UserRoles).join(Role).filter(Role.name == 'admin')

    # Read the HTML template
    with open('report.html', 'r') as f:
        template = Template(f.read())

    # for user in users:
        # Fetch books currently issued to the user
        # Fetch books that are currently issued to the user (i.e., not returned)
    currently_issued_books = BookRequestIssueHistory.query.filter_by(
        # user_id=user.id,
        actual_status="issued",
        return_boolean=False
        ).all()


        # Fetch all books in the system
    all_books = Book.query.all()

        # Render the email content
    email_content = template.render(
        email="admin@iitm.ac.in",
        username="admin",
        currently_issued_books=currently_issued_books,
        all_books=all_books
    )

        # Send the email
    try:
        send_email("admin@iitm.ac.in", 'Monthly Report', email_content)
    except Exception as e:
        # Log the error
        print(f"Failed to send email to {'admin@iitm.ac.in'}: {e}")

    return "Monthly Report Sent"

def send_email(to,subject,content_body):
    msg=MIMEMultipart()
    msg['From']=SENDER_EMAIL
    msg['To']=to
    msg['Subject']=subject
    msg.attach(MIMEText(content_body,'html'))

    with SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
        client.send_message(msg)
    # client.quit()
