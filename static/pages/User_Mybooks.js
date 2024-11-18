import router from "../utils/router.js"; // Adjust the import path as needed

const user_mybooks = {
  template: `
    <div id="main">
      <div id="canvas">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <div class="container-fluid">
            <a class="navbar-brand" href="#">Library Management System</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div style="text-align: right;">
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <router-link class="nav-link" :to="'/user/mybooks'">My Books</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" :to="'/books'">Books</router-link>
                  </li>
                  <ul class="navbar-nav mb-2 mb-lg-0">
                    <li class="nav-item">
                      <button class="nav-link btn btn-primary-danger" @click='logout'>
                        <i class="bi bi-box-arrow-right"></i> Logout
                      </button>
                    </li>
                  </ul>
                </ul>
              </div>
            </div>
          </div>
        </nav>
        <h2 class="headings">My Books</h2>
        <div v-if="books.length === 0">
          <h4>No Results to Show</h4>
        </div>
        <div v-if="books.length > 0">
          <h3>Books</h3>
          <div id="books-table">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Book Id</th>
                  <th scope="col">Book Name</th>
                  <th scope="col">Issue Date</th>
                  <th scope="col">No of days</th>
                  <th scope="col">Return Date</th>
                  <th scope="col">User action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, index) in books" :key="book.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ book.id }}</td>
                  <td>{{ book.title }}</td>
                  <td>{{ book.issue_date }}</td>
                  <td>{{ book.days_requested }}</td>
                  <td>{{ book.return_date }}</td>
                  <td>
                    <button @click="returnBook(book.id)" class="btn btn-warning">Return</button>
                    <button @click="viewBook(book.id)" class="btn btn-primary">View</button>
                    <button @click="submitRating(book.id)" class="btn btn-info">Rating</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      books: [],
      token: localStorage.getItem('auth-token'),
      user_id: localStorage.getItem('user_id'),
      role: localStorage.getItem('role')
    };
  },
  async mounted() {
    await this.fetchBooks();
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      this.$router.push('/user_login');
    },
    async fetchBooks() {
      try {
        const response = await fetch(`/user/mybooks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          const data = await response.json();
          this.books = data.books;
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
        alert("An error occurred while fetching books.");
      }
    },
    async returnBook(bookId) {
      if (confirm("Are you sure you want to return this book?")) {
        try {
          const response = await fetch(`/return_book/${bookId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            alert("Book returned successfully");
            await this.fetchBooks(); // Refresh the list
          } else {
            const error = await response.json();
            alert(error.message);
          }
        } catch (err) {
          console.error("Error returning book:", err);
          alert("An error occurred while returning the book.");
        }
      }
    },
    viewBook(bookId) {
      this.$router.push(`/book_view/${bookId}`);
    },
    submitRating(bookId) {
      this.$router.push(`/rate_book/${bookId}`);
    }
  },
  computed: {
    is_logged_in() {
        return this.token !== null;
    }
  }
};

export default user_mybooks;