from flask import render_template_string, render_template, request, jsonify, send_file
from flask_security import auth_required, roles_accepted, roles_required, SQLAlchemyUserDatastore, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User,Section,Book,Role, BookRequestIssueHistory, Association
from datetime import datetime,timedelta
from cache import cache
from tasks import create_csv
from celery.result import AsyncResult
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
import os

def create_view(app, user_datastore: SQLAlchemyUserDatastore):

    # cache demo
    # @app.route('/cachedemo')
    # @cache.cached(timeout=5)
    # def cacheDemo():
    #     return jsonify({"time" : datetime.now()})

    @app.get('/download_csv')
    def downloadcsv():
        task = create_csv.delay()
        return jsonify({'task_id': task.id}), 200
    
    @app.get('/get_csv/<task_id>')
    def getcsv(task_id):
        res = AsyncResult(task_id)
        if res.ready():
            filename = res.result
            if filename:
                return send_file(
                    filename,
                    as_attachment=True,
                    download_name='books.csv',  
                    mimetype='text/csv'         
                )
            else:
                return jsonify({'message': 'File not found'}), 404
        else:
            return jsonify({'message': 'Task not ready'}), 404

    # @app.route('/celerydemo')
    # def celery_demo():
    #     task = add.delay(3,5)
    #     return jsonify({'task_id': task.id})
    
    # @app.route('/get-task/<task_id>')
    # def get_task(task_id):
    #     result = AsyncResult(task_id)

    #     if result.ready():
    #         return jsonify({'result': result.result}), 200
    #     else:
    #         return "Task not yet ready", 405
    
    # def raw(input_text):
    #     split_list = input_text.split()  # Input could be any text, like 'Horror' or 'JK Rowling'
    #     srch_text = ''
    #     for word in split_list:
    #         srch_text += word.lower()
    #     return srch_text



    @app.get('/')
    def home():
        return render_template('index.html')
    
    @app.post('/user_login')
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"message" : "Email and Password are not provided"}), 404
        
        user = user_datastore.find_user(email=email)
        
        if not user:
            return jsonify({"message" : "User not found"}), 404
        
        if not user.check_password(password):
            return jsonify({'message': 'Incorrect Password'}), 400
        
        user.last_activity = datetime.now()
        db.session.commit()
        books = Book.query.all()
        sections = Section.query.all()
        if check_password_hash(user.password, password):
            return jsonify({"token" : user.get_auth_token(), "email": user.email, "role": user.roles[0].name, "name": user.fullname, "id": user.id}), 200
        else:
            return jsonify({"message" : "Wrong Password"}), 400
        
    

    
    @app.post('/register')
    def register():
        data = request.get_json()

        email = data.get('email')
        fullname = data.get('fullname')
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')

        if not email or not fullname or not username or not password or role not in ['user']:
            return jsonify({"message" : "Invalid Input"})
        
        if user_datastore.find_user(email=email):
            return jsonify({"message" : "User already exists"})
        
        if role == "user":
            active = True
        try:
            user_datastore.create_user(email = email, fullname = fullname, username = username, password = generate_password_hash(password), roles=[role], active=active)
            db.session.commit()
        except:
            print('Error while creating')
            db.session.rollback()
            return jsonify({'message' : 'Error while creating user'}), 408
        
        return jsonify({"message" : "User created successfully"}), 200
    
    @app.get('/app_statistics')
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=50)
    def app_statistics():
        
        users = User.query.all()
        all_users = [{'id': user.id, 'email': user.email, 'username': user.username, 'active': user.active,'roles': [role.name for role in user.roles]} for user in users]
        books = Book.query.all()
        all_books = [{'id': book.id, 'book_name': book.name, 'author': book.author, 'content': book.content, 'section_id': book.sect, 'section_name': Section.query.get(book.sect).name if Section.query.get(book.sect) else None, 'date_created' : book.upload_date} for book in books]
        sections = Section.query.all()
        all_sections = [{'id': section.id, 'section_name': section.name, 'section_description': section.description, 'date_created': section.date_created, 'books': [book.name for book in section.all_books]} for section in sections]
        granted_books = BookRequestIssueHistory.query.filter_by(actual_status='requested').all()
        all_granted_books = [{'id': book.book_id, 'book_name': book.book_name, 'userid': book.user_id} for book in granted_books]
        issued_books = BookRequestIssueHistory.query.filter_by(actual_status='issued').all()
        all_issued_books = [{'id': book.book_id, 'book_name': book.book_name, 'userid': book.user_id} for book in issued_books]
   
        return jsonify({'users': all_users, 'books': all_books, 'sections': all_sections, 'requested_books': all_granted_books, 'issued_books': all_issued_books}), 200

    @app.post('/add_section')
    @auth_required('token')
    @roles_required('admin')
    def add_section():
        data = request.get_json()
        
        section_name = data.get('name')
        description = data.get('description')
        if not section_name or not description:
            return jsonify({"message": "Missing required data"}), 400
        
        try:
            # s_search_name = raw_section(section_name)
            add_section = Section(name = section_name, description=description)
        
            db.session.add(add_section)
            db.session.commit()
        
            return jsonify({'message': 'Section created successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500
    
    @app.put('/update_section/<int:section_id>')
    @auth_required('token')
    @roles_required('admin')
    def edit_section(section_id):
        s1 = Section.query.get(section_id)
        
        if not s1:
            return jsonify({'message': 'Section not found'}), 404
            
        data = request.get_json()

        new_name = data.get('name')
        new_description = data.get('description')

        if not new_name or not new_description:
            return jsonify({'message': 'Missing required data'}), 400
        
        s1.name = new_name
        s1.description = new_description
        
        try:
            db.session.commit()
            return jsonify({"message": "Section updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500
    
    @app.delete('/delete_section/<int:section_id>')
    @auth_required('token')
    @roles_required('admin')
    def delete_section(section_id):
        try:
            delete_section = Section.query.get(section_id)
            if not delete_section:
                return jsonify({'message':'Section not found'}),404
            for book in delete_section.all_books:
                db.session.delete(book)
            db.session.delete(delete_section)
            db.session.commit()
            return jsonify({'message': 'Section deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500


    @app.get('/admin_dashboard')
    @auth_required('token')
    @roles_required('admin')
    def admin_dashboard():
        try:
        # This fetches the current logged-in user, who should have 'admin' role
            admin = User.query.join(User.roles).filter_by(name='admin').first()
        # Return the dashboard template
            if admin:
                admin_data = {
                    'id': admin.id,
                    'username': admin.username,
                    'email': admin.email,
                }
                return jsonify(admin_data), 200
        except Exception as e:
            return jsonify({'message': 'Admin not found','error': str(e)}), 500
    
    @app.get('/admin/books')
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=50)
    def admin_books():
        try:
            books = Book.query.all()
            books_data = [{'id': book.id, 'name': book.name, 'content': book.content, 'author': book.author, 'upload_date': book.upload_date, 'sect': book.sect} for book in books]
            sections = Section.query.all()
            sections_data = [{'id': section.id, 'section_name': section.name, 'section_description': section.description} for section in sections]
            return jsonify({'books': books_data, 'sections': sections_data}), 200
        except Exception as e:
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500


    @app.post('/book_add')
    @auth_required('token')
    @roles_required('admin')
    def add_book():
        data = request.get_json()
        
        book_name = data.get('name')
        book_author = data.get('author')
        book_content = data.get('content')
        section_id = data.get('sect')
        if not all([book_name, book_content, book_author, section_id]):
            return jsonify({'message': 'All fields (name, content, author, section_id) are required'}), 400

        section = Section.query.get(section_id)
        if not section:
            return jsonify({'message': 'Section not found'}), 404
        
        # b_search_name = raw_book(book_name)
        # b_search_author = raw_book(book_author)
        add_book = Book(name = book_name, author = book_author, content = book_content, sect = section_id)
        db.session.add(add_book)
        db.session.commit()
        return jsonify({'message': 'Book created successfully', 'book_id': add_book.id}), 201


    @app.put('/update_book/<int:book_id>')
    @auth_required('token')
    @roles_required('admin')
    def update_book(book_id):
        b1 = Book.query.get(book_id)
        if not b1:
            return jsonify({'message': 'Book not found'}), 404
        
        data = request.get_json()
        new_name = data.get('name')
        new_author = data.get('author')
        new_content = data.get('content')

        if not all([new_name, new_author, new_content]):
            return jsonify({'message': 'All fields (name, author, content) are required'}), 400
        
        b1.name = new_name
        b1.author = new_author
        b1.content = new_content
        
        db.session.commit()

        return jsonify({'message': 'Book updated successfully'}), 200
    
    @app.delete('/delete_book/<int:book_id>')
    @auth_required('token')
    @roles_required('admin')
    def delete_book(book_id):
        try:
            delete_book = Book.query.get(book_id)
            if not delete_book:
                return jsonify({'message': 'Book not found'}), 404
        
            db.session.delete(delete_book)
            db.session.commit()

            return jsonify({'message': 'Book deleted successfully'}),200
        except Exception as e:
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

    @app.post('/revoke_book/<int:book_id>')
    @auth_required('token')
    @roles_required('admin')
    def revoke_book(book_id):
        user_id = current_user.id
        book_revoke = BookRequestIssueHistory.query.filter_by(book_id=book_id, actual_status="issued").first()

        if book_revoke:
            db.session.delete(book_revoke)
            db.session.commit()
        
        associated_book = Association.query.filter_by(user_id=user_id, book_id=book_id).first()
        if associated_book:
            db.session.delete(associated_book)
            db.session.commit()
            return jsonify({'message': 'Book revoked successfully.'}), 200
        else:
            return jsonify({'message': 'User not found.Book not associated with user'}), 404

    @app.post('/approve_request/<int:book_id>')
    @auth_required('token')
    @roles_required('admin')
    def approve_request(book_id):
        user_id = current_user.id
        # Fetch the book request with the given book_id and status "requested"
        book_request = BookRequestIssueHistory.query.filter_by(book_id=book_id, actual_status="requested").first()

        if not book_request:
            return jsonify({'message': 'No such book request found or it has already been approved.'}), 404

        no_of_days = book_request.days_requested
        if no_of_days <= 0:
            db.session.delete(book_request)
            db.session.commit()
            return jsonify({'message': 'Please provide an appropriate value for request days'}), 400

        # Set issue date and return date
        issue_date = datetime.now().date()
        return_date = issue_date + timedelta(days=no_of_days)

        # Update the book request status
        book_request.actual_status = "issued"
        book_request.Issue_date = issue_date
        book_request.Return_date = return_date
        requester_userid = book_request.user_id
        # Create a new entry in the Association table
        association = Association(user_id=requester_userid, book_id=book_id)
        db.session.add(association)

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'Book request has been approved successfully'}), 200

    
    @app.get('/admin_status')
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=50)
    def admin_status():
        requested_books = BookRequestIssueHistory.query.filter_by(actual_status = "requested").all()
        issued_books = BookRequestIssueHistory.query.filter_by(actual_status = "issued").all()
        returned_books = BookRequestIssueHistory.query.filter_by(actual_status = "returned").all()

        def serialize_requested_book(book):
            return {
                "id": book.book_id,
                "title": book.book_name,
                "user_id": book.user_id,
                "days_requested": book.days_requested,
                "request_date": book.request_date if book.request_date else None,
            }
        def serialize_issued_book(book):
            return {
                "id": book.book_id,
                "title": book.book_name,
                "user_id": book.user_id,
                "issue_date": book.Issue_date,
                "return_date": book.Return_date
            }
        def serialize_returned_book(book):
            return {
                "id": book.book_id,
                "title": book.book_name,
                "user_id": book.user_id,
                "return_date": book.Return_date
            }
        
        requested_books_data = [serialize_requested_book(book) for book in requested_books]
        issued_books_data = [serialize_issued_book(book) for book in issued_books]
        returned_books_data = [serialize_returned_book(book) for book in returned_books]

        return jsonify({"requested_books": requested_books_data, "issued_books": issued_books_data,
        "returned_books": returned_books_data}), 200

    @app.get('/user_dashboard')
    @auth_required('token')
    @roles_required('user')
    def get_user():
        user_id = current_user.id
        print(user_id)
        try:
        # Fetch the user by ID
            # print('Received user_id:') + {user_id}
            # all_users = User.query.all()
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
            
            # user_data = {"id": user.id, "username": user.username, "email": user.email}
        
            
        
        # Collect the user's book data
            # all_books = Book.query.all()
            # book_data = [{"id": book.id, "name": book.name, "author": book.author, "content": book.content} for book in user.books]
            # Prepare the user data response
            
            return jsonify({"id": user.id, "username": user.username}), 200
        except Exception as e:
            return jsonify({"message": "Failed to retrieve user data", "error": str(e)}), 500


    @app.get('/books')
    @auth_required('token')
    @roles_required('user')
    @cache.cached(timeout=50)
    def get_user_books():
        try:
            # Fetch the user by ID
            user = current_user
            # Fetch all books and sections
            books = Book.query.all()
            sections = Section.query.all()
            
            # Count the number of books not yet returned by the user
            return_date_count = BookRequestIssueHistory.query.filter_by(user_id=user.id, return_boolean=False).count()
            sections_dict = {section.id: section.name for section in sections}
            # Prepare the response data
            user_books_data = {
                "books": [
                    {
                        "id": book.id,
                        "name": book.name,
                        "author": book.author,
                        "content": book.content,
                        "section_name": book.section.name
                    } for book in books
                ],
                "return_date_count": return_date_count
            }
            
            return jsonify(user_books_data), 200
        
        except Exception as e:
            return jsonify({"message": "Failed to retrieve user books data", "error": str(e)}), 500

    @app.route('/request_book/<int:book_id>', methods=['GET', 'POST'])
    @auth_required('token')
    @roles_required('user')
    def request_book(book_id):
        user_id = current_user.id
        b1 = Book.query.get(book_id)

        if not b1:
            return jsonify({'message': 'Book not found'}), 404
        
        if request.method == 'POST':
            existing_request = BookRequestIssueHistory.query.filter_by(book_id=book_id, user_id=user_id, actual_status='requested').first()

            if existing_request:
                return jsonify({'message': 'You have already requested this book'}), 400
            
            return_date_count = BookRequestIssueHistory.query.filter_by(user_id=user_id, return_boolean=False).count()
            print(return_date_count)
            
            if return_date_count >= 5:
                return jsonify({'message': 'Max Book limit exceeded'}), 400
            else:
                data = request.json
                days_requested = data.get('days_requested')
                request_date = datetime.now().strftime('%Y-%m-%d')

                book_request = BookRequestIssueHistory(
                    book_id=book_id,
                    book_name=b1.name,
                    user_id=user_id,
                    days_requested=days_requested,
                    actual_status="requested",
                    request_date=request_date,
                    Issue_date="Not issued yet",
                    Return_date="Not returned yet"
                )
                db.session.add(book_request)
                db.session.commit()
                return jsonify({'message': 'Book requested successfully'}), 201
            return jsonify({'book_id': b1.id, 'book_name': b1.name, 'author': b1.author, 'upload_date': b1.upload_date})

    
    
    @app.get('/user/mybooks')
    @auth_required('token')
    @roles_required('user')
    def user_mybooks():
        user_id = current_user.id
        books = BookRequestIssueHistory.query.filter_by(user_id=user_id, actual_status="issued").all()
        book_list = [{"id": book.book_id, "title": book.book_name, "days_requested": book.days_requested, "issue_date": book.Issue_date, "return_date": book.Return_date} for book in books]
            
        return jsonify({'user_id': user_id, 'books': book_list}), 200
        # except Exception as e:
        #     return jsonify({'message': f"An error occurred: {str(e)}"}), 500


    @app.get('/return_book/<int:book_id>')
    @auth_required('token')
    @roles_required('user')
    def return_book(book_id):
        user_id = current_user.id
        book_request = BookRequestIssueHistory.query.filter_by(book_id=book_id, user_id=user_id, actual_status="issued").first()
        if not book_request:
            return jsonify({"message": "Book request not found"}), 404

        expected_return_date = book_request.Return_date
        actual_return_date = datetime.now().date()
        Return_date_count = BookRequestIssueHistory.query.filter_by(user_id=user_id, return_boolean=False).count()

        if actual_return_date < datetime.strptime(expected_return_date, '%Y-%m-%d').date():
            book_request.actual_status = "returned"
            book_request.return_boolean = True
            book_request.Return_date = actual_return_date
            Return_date_count -= 1
            db.session.commit()

        associated_book = Association.query.filter_by(user_id=user_id, book_id=book_id).first()
        if associated_book:
            db.session.delete(associated_book)
            db.session.commit()

        return jsonify({"message": "Book returned successfully", "remaining_requests": Return_date_count})

    @app.get('/book_view/<int:book_id>')
    @auth_required('token')
    @roles_required('user')
    def view_book(book_id):
        try:
            # Use current_user.id instead of passing user_id directly
            book_request = BookRequestIssueHistory.query.filter_by(book_id=book_id, user_id=current_user.id, actual_status="issued").first()

            if not book_request:
                return jsonify({'message': "For Security Purposes, the book cannot be viewed."}), 403

            book = Book.query.filter_by(id=book_id).first()
            if not book:
                return jsonify({'message': "Book not found."}), 404

            return jsonify({
                'book_text': book.content,
                'book_name': book_request.book_name})

        except Exception as e:
            return jsonify({'message': "An error occurred: {str(e)}"}), 500

    

    @app.post('/rate_book/<int:book_id>')
    @auth_required('token')
    @roles_required('user')
    def rate_book(book_id):
        data = request.json
        rating = data.get('rating')
        
        if rating not in [1, 2, 3, 4, 5]:  # Ensure rating is between 1 and 5
            return jsonify({'message': 'Invalid rating. Please provide a rating between 1 and 5.'}), 400

        try:
            book_request = BookRequestIssueHistory.query.filter_by(
                book_id=book_id, user_id=current_user.id, actual_status="issued").first()

            if not book_request:
                return jsonify({'message': "Book request not found."}), 404
            
            if book_request.rating is not None:
                return jsonify({'message': 'You have already rated this book.',
                    'rating_status': 'already rated', 'current_rating': book_request.rating}), 400

            book_request.rating = rating
            db.session.commit()

            return jsonify({'message': 'Rating updated successfully.', 
                'rating_status': 'new_rating', 'current_rating': rating}), 200

        except Exception as e:
            return jsonify({'message': f"An error occurred: {str(e)}"}), 500
    

    
    # @app.route('/search', methods=['GET'])
    # def text_search():
    #     srch_word = request.args.get('srch_word', '')
    #     if not isinstance(srch_word, str):  
    #         return jsonify({'message': 'Search word must be a string'}), 400
        
    #     srch_word_processed_for_sections = raw_section(srch_word)  # For sections
    #     srch_word_processed_for_books = raw_book(srch_word)        # For books and authors

    #     try:
    #         sec_query = Section.query
    #         for word in srch_word_processed_for_sections:
    #             sec_query = sec_query.filter(Section.s_search_name.like(f"%{word}%"))
    #         sec_names = sec_query.all()

    #         book_query = Book.query
    #         for word in srch_word_processed_for_books:
    #             book_query = book_query.filter(
    #                 (Book.b_search_name.like(f"%{word}%")) | (Book.b_search_author.like(f"%{word}%"))
    #             )
    #         book_names = book_query.all()
    #         # Search for sections
    #         # sec_names = Section.query.filter(Section.s_search_name.like(srch_word_processed_for_sections)).all()
    #         # # Search for authors
    #         # auth_names = Book.query.filter(Book.b_search_author.like(srch_word_processed_for_books)).all()
    #         # # Search for books
    #         # book_names = Book.query.filter(Book.b_search_name.like(srch_word_processed_for_books)).all()

    #         # # Convert results to dictionaries
    #         sec_names = [{'id': sec.id, 'name': sec.s_search_name, 'description': sec.description} for sec in sec_names]
    #         # auth_names = [{'id': bk.id, 'name': bk.b_search_author, 'author': bk.author} for bk in auth_names]
    #         book_names = [{'id': bk.id, 'name': bk.b_search_name, 'author': bk.author, 'sect': bk.sect} for bk in book_names]

    #         return jsonify({
    #             'sections': sec_names,
    #             # 'authors': auth_names,
    #             'books': book_names
    #         })

    #     except Exception as e:
    #         return jsonify({'message': f"An error occurred: {str(e)}"}), 500
        
    @app.route('/stats', methods=['GET'])
    @auth_required('token')
    @roles_required('admin')
    def show_stats():
        # Query all books and sections
        books = Book.query.all()
        sections = Section.query.all()
        # all_books = BookRequestIssueHistory.query.all()
        
        # Organize data into a dictionary
        library = {section.name: 0 for section in sections}
        for book in books:
            library[book.section.name] += 1
        
        # Prepare the data for plotting
        sections = list(library.keys())
        book_counts = list(library.values())
        
        # Generate the plot using Matplotlib
        plt.figure(figsize=(6, 4))
        plt.bar(sections, book_counts, color='red', width=0.25)
        plt.xlabel('Sections')
        plt.ylabel('Number of Books')
        plt.title('Number of Books in Each Section')
        plt.xticks(rotation=45)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.tight_layout()
        
        # Save the plot to a temporary file
        section_graph_path = 'static/images/book_section.png'
        plt.savefig(section_graph_path)
        plt.clf()
        # Serve the image file
        # return send_file(graph_path, mimetype='image/png')
    
        # ratings = [book.rating for book in all_books]
        # book_names = [book.book_name for book in all_books]

        # plt.figure(figsize(6,4))
        # plt.bar(book_names, ratings, color='blue', width=0.25)
        # plt.xlabel('Rating %', fontweight='bold')
        # plt.ylabel('Book Names', fontweight='bold')
        # plt.title('Rating Graph of books', fontweight='bold')
        # plt.xticks(rotation=45)
        # plt.grid(axis='y', linestyle='--', alpha=0.7)
        # plt.tight_layout()
        # rating_graph_path = 'static/images/book_rating.png'
        # plt.savefig(rating_graph_path)
        return send_file(section_graph_path, mimetype='image/png')

    

