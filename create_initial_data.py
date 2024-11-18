from flask_security import SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from models import db


def create_data(user_datastore : SQLAlchemyUserDatastore):

    print('###creating Data####')

    #create roles
    user_datastore.find_or_create_role(name= 'admin', description= 'Librarian')
    user_datastore.find_or_create_role(name= 'user', description= 'General User')

    #create user data

    if not user_datastore.find_user(email = "admin@iitm.ac.in"):
        user_datastore.create_user(fullname = "Manan Tilwani", email = "admin@iitm.ac.in", username = "man97", password = generate_password_hash('1234'), active = True, roles=['admin'])
    if not user_datastore.find_user(email = "user1@iitm.ac.in"):
        user_datastore.create_user(fullname = "Smruti Das", email = "user1@iitm.ac.in", username = "Smr96", password = generate_password_hash('9000'), active = True, roles=['user'])
    
        db.session.commit()