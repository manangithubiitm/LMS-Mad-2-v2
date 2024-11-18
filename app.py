from flask import Flask
from models import db, security
from create_initial_data import create_data
import views
from cache import cache
from worker import celery_init_app
import flask_excel as excel
from tasks import *
from celery.schedules import crontab

from flask_cors import CORS
# from flask_migrate import Migrate

celery_app = None

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SECRET_KEY'] = "it-is-kept-secret"
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.sqlite3"
    app.config['SECURITY_PASSWORD_SALT'] = "hashed-password"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_REDIS_HOST'] = 'localhost'
    app.config['CACHE_REDIS_PORT'] = 6379
    app.config['CACHE_REDIS_DB'] = 3
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Use Lax for local development
    app.config['SESSION_COOKIE_SECURE'] = False
    cache.init_app(app)
    db.init_app(app)
    # migrate = Migrate(app, db)
    celery_app = celery_init_app(app)

    
    with app.app_context():
        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore
        user_datastore = SQLAlchemyUserDatastore(db, User, Role)
        security.init_app(app, user_datastore)

        db.create_all()
        
        create_data(user_datastore)
    
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True
    
    views.create_view(app, user_datastore)
    
    
    return app

app = create_app()
celery_app = celery_init_app(app)
excel.init_excel(app)

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # sender.add_periodic_tasks(10.0, daily_reminder.s('test@gmail.com', 'Testing', '<h2> content here </h2>'), name='add every 10')
    sender.add_periodic_task(
        crontab(hour=9, minute=20), daily_reminder.s(), name='send daily reminder')
    sender.add_periodic_task(
        crontab(day_of_month=1,hour=10, minute=0), monthly_reminder.s(), name='send_monthly_reminder_1st_day_10am')
    # sender.add_periodic_task(
    #     10, monthly_reminder.s(), name='send_monthly_reminder after every 10 seconds')
if __name__ == "__main__":
    app.run(debug=True)
    # app.run(debug=True, host='0.0.0.0', port=5001)