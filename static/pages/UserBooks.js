import router from "../utils/router.js";

const user_books = {
  template: `
    <div id="main">
        <div id="canvas">
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <router-link class="navbar-brand" to="/">Library Management System</router-link>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                      <span class="navbar-toggler-icon"></span>
                    </button>
                    <div style="text-align: right;">
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <router-link class="nav-link active" aria-current="page" :to="'/user/mybooks/'">My Books</router-link>
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
            <div v-if="showAllBooks">
              <h2 class="headings">All Books</h2>
              <input type="text" v-model="searchQuery" class="form-control mb-3" placeholder="Search Books">
              <div v-if="filteredBooks.length === 0">
                <h4>No Books to Show</h4>
              </div>
              <div v-else id="books-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Book Id</th>
                            <th scope="col">Book Name</th>
                            <th scope="col">Book Author</th>
                            <th scope="col">Sect</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(book, index) in filteredBooks" :key="book.id">
                            <td>{{ book.id }}</td>
                            <td>{{ book.name }}</td>
                            <td>{{ book.author }}</td>
                            <td>{{ book.section_name }}</td>
                            <td>
                                <button v-if="Return_date_count >= 5" type="button" class="btn btn-primary" disabled>
                                  Request
                                </button>
                                <router-link v-else :to="'/request_book/' + book.id">
                                    <button type="button" class="btn btn-primary">Request</button>
                                </router-link>
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
      Return_date_count: 0,
      searchQuery: '',
      showAllBooks: true,
      token: localStorage.getItem('auth-token'),
      user_id: localStorage.getItem('user_id'),
      role: localStorage.getItem('role')
    };
  },
    async created() {
    try {
      const response = await fetch(`/books`, {
        headers: {
          'Authentication-Token': this.token,
          'Content-Type': 'application/json'
        },
      });

      const textResponse = await response.text();
      // console.log('Response Text:', textResponse);

      if (response.ok) {
        try {
          const data = JSON.parse(textResponse);
        //   this.user = data.user;
        //   this.sections = data.sections;
          this.books = data.books;
          this.Return_date_count = data.return_date_count;
        } catch (e) {
          console.error('JSON Parse Error:', e);
        }
      } else {
        try {
          const error = JSON.parse(textResponse);
          console.error("Failed to load data:", error.message);
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      this.$router.push('/user_login');
    },
  },
  computed: {
    filteredBooks() {
      if (!this.searchQuery) {
        return this.books;
      }
      const query = this.searchQuery.toLowerCase();
      return this.books.filter(book => {
        const bookName = book.name ? book.name.toLowerCase() : '';
        const authorName = book.author ? book.author.toLowerCase() : '';
        const sectName = book.section_name ? book.section_name.toLowerCase() : '';
        return bookName.includes(query) || authorName.includes(query) || sectName.includes(query);
      });
    },
    is_logged_in() {
        return this.token !== null;
    }
  }
};

export default user_books;