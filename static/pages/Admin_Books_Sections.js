import router from "../utils/router.js";

const Admin_Books_Sections = {
  template: `
    <div id="main-1">
        <div id="canvas-1">
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                  <a class="navbar-brand" href="/admin">Library Management System</a>
                  <div style="text-align: right;">
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                              <router-link class="nav-link" to="/admin_status">Status</router-link>
                            </li>
                            <li class="nav-item">
                              <router-link class="nav-link" to="/admin/books">Books</router-link>
                            </li>
                            <li class="nav-item">
                              <router-link class="nav-link" to="/stats">Stats</router-link>
                            </li>
                            <ul class="navbar-nav mb-2 mb-lg-0">
                              <li class="nav-item">
                                  <button class="nav-link btn btn-primary-danger" @click='logout'>
                                      <i class="bi bi-box-arrow-right"></i> Logout
                                  </button>
                              </li>
                            </ul>
                        </ul>
                        <span class="navbar-text me-3">admin</span>
                    </div>
                  </div>
                </div>
            </nav><br>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <router-link to="/add_book"><button class="btn btn-primary me-md-2" type="button">Add Book</button></router-link>
              <router-link to="/add_section"><button class="btn btn-primary me-md-2" type="button">Add Section</button></router-link>
            </div>
            <h2 class="headings">All Sections</h2>
            <div v-if="sections.length === 0">
              <h4>You have not added any sections</h4>
            </div>
            <div v-else id="sections-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Section Id</th>
                      <th scope="col">Section Name</th>
                      <th scope="col">Section Description</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(section, index) in sections" :key="section.id">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ section.id }}</td>
                        <td>{{ section.section_name }}</td>
                        <td>{{ section.section_description }}</td>
                        <td>
                          <router-link :to="'/update_section/' + section.id"><button class="btn btn-primary me-md-2" type="button">Edit</button></router-link>
                          <button @click="deleteSection(section.id)" class="btn btn-danger me-md-2" type="button">Delete</button>
                        </td>
                    </tr>
                  </tbody>
                </table>
            </div>
            <h2 class="headings">All Books</h2>
            <div v-if="books.length === 0">
              <h4>You have not added any books</h4>
            </div>
            <div v-else id="books-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Book Id</th>
                      <th scope="col">Book Name</th> 
                      <th scope="col">Book Author</th>
                      <th scope="col">Book Content</th>
                      <th scope="col">Upload Date</th>
                      <th scope="col">Sect</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(book, index) in books" :key="book.id">
                        <th scope="row">{{ index + 1 }}</th>
                        <td>{{ book.id }}</td>
                        <td>{{ book.name }}</td>
                        <td>{{ book.author }}</td>
                        <td>{{ book.content }}</td>
                        <td>{{ book.upload_date }}</td>
                        <td>{{ book.sect }}</td>
                        <td>
                          <router-link :to="'/update_book/' + book.id"><button class="btn btn-primary me-md-2" type="button">Edit</button></router-link>
                          <button @click="deleteBook(book.id)" class="btn btn-danger me-md-2" type="button">Delete</button>
                        </td>
                    </tr>
                  </tbody>
                </table>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      books: [],
      sections: [],
      role: localStorage.getItem('role'),
      token: localStorage.getItem('auth-token'),
      userid: localStorage.getItem('user_id')
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      this.$router.push('/user_login');
    },
    async fetchData() {
      try {
        const response = await fetch('/admin/books', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          }
        });
        if (response.ok) {
          const data = await response.json();
          this.books = data.books;
          this.sections = data.sections;
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("An error occurred while fetching data.");
      }
    },
    async deleteSection(section_id) {
      // console.log("Delete method called for section ID:", section_id);
      
      if (confirm("Are you sure you want to delete this section?")) {
        try {
          const response = await fetch(`/delete_section/${section_id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token
            }
          });
          if (response.ok) {
            alert("Section deleted successfully.");
            this.fetchData(); // Refresh the list
          } else {
            const error = await response.json();
            alert(error.message);
          }
        } catch (err) {
          console.error("Error deleting section:", err);
          alert("An error occurred while deleting the section.");
        } 
      }
    },
    async deleteBook(bookId) {
      if (confirm("Are you sure you want to delete this book?")) {
        try {
            const response = await fetch(`/delete_book/${bookId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token
            }
          });
          if (response.ok) {
            alert("Book deleted successfully.");
            this.fetchData(); // Refresh the list
          } else {
            const error = await response.json();
            alert(error.message);
          }
        } catch (err) {
          console.error("Error deleting book:", err);
          alert("An error occurred while deleting the book.");
        }
      }
    }
  },
  computed: {
    is_logged_in() {
        return this.token !== null;
    }
  }
};

export default Admin_Books_Sections;