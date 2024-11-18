import router from "../utils/router.js";

const AdminStatus = {
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
        <div style="text-align: right;">
          <button class="btn btn-dark" @click.prevent='export_csv'>Download</button><span v-if='isWaiting'>Waiting...</span>
          <h2 class="headings text-center">Admin Status</h2>
        </div>

        <div id="requested-books">
          <h3>Requested Books:</h3>
          <div v-if="requestedBooks.length === 0">
            <h4>No requested books.</h4>
          </div>
          <div v-else>
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Book ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">User ID</th>
                  <th scope="col">Days Requested</th>
                  <th scope="col">Request Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, index) in requestedBooks" :key="book.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ book.id }}</td>
                  <td>{{ book.title }}</td>
                  <td>{{ book.user_id }}</td>
                  <td>{{ book.days_requested }}</td>
                  <td>{{ book.request_date }}</td>
                  <td>
                    <button @click="approveRequest(book.id)" class="btn btn-success">Approve</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div id="issued-books">
          <h3>Issued Books:</h3>
          <div v-if="issuedBooks.length === 0">
            <h4>No issued books.</h4>
          </div>
          <div v-else>
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Book ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">User ID</th>
                  <th scope="col">Issue Date</th>
                  <th scope="col">Return Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, index) in issuedBooks" :key="book.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ book.id }}</td>
                  <td>{{ book.title }}</td>
                  <td>{{ book.user_id }}</td>
                  <td>{{ book.issue_date }}</td>
                  <td>{{ book.return_date }}</td>
                  <td>
                    <button @click="revokeRequest(book.id)" class="btn btn-danger">Revoke</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div id="returned-books">
          <h3>Returned Books:</h3>
          <div v-if="returnedBooks.length === 0">
            <h4>No returned books.</h4>
          </div>
          <div v-else>
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Book ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">User ID</th>
                  <th scope="col">Return Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, index) in returnedBooks" :key="book.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ book.id }}</td>
                  <td>{{ book.title }}</td>
                  <td>{{ book.user_id }}</td>
                  <td>{{ book.return_date }}</td>
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
      isWaiting: false,
      requestedBooks: [],
      issuedBooks: [],
      returnedBooks: [],
      token: localStorage.getItem('auth-token'),
      role: localStorage.getItem('role'),
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
        const response = await fetch('/admin_status', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          this.requestedBooks = data.requested_books;
          this.issuedBooks = data.issued_books;
          this.returnedBooks = data.returned_books;
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("An error occurred while fetching data.");
      }
    },
    async export_csv() {
      this.isWaiting = true
      const res = await fetch('/download_csv')
      const data = await res.json()
      if (res.ok) {
        const taskId = data['task_id']
        const interval = setInterval(async() => {
          const csv_res = await fetch(`get_csv/${taskId}`)
          if (csv_res.ok) {
            this.isWaiting = false
            clearInterval(interval)
            window.location.href = `/get_csv/${taskId}`
          }
        }, 3000)
      }
    },
    async approveRequest(bookId) {
      if (confirm("Are you sure you want to approve this request?")) {
        try {
          const response = await fetch(`/approve_request/${bookId}`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            alert("Book request approved.");
            this.fetchData(); // Refresh the list
          } else {
            const error = await response.json();
            alert(error.message);
          }
        } catch (err) {
          console.error("Error approving request:", err);
          alert("An error occurred while approving the request.");
        }
      }
    },
    async revokeRequest(bookId) {
      if (confirm("Are you sure you want to revoke this request?")) {
        try {
          const response = await fetch(`/revoke_book/${bookId}`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            alert("Book request revoked.");
            this.fetchData(); // Refresh the list
          } else {
            const error = await response.json();
            alert(error.message);
          }
        } catch (err) {
          console.error("Error revoking request:", err);
          alert("An error occurred while revoking the request.");
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

export default AdminStatus;