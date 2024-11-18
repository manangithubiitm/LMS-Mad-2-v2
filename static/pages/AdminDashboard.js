import router from "../utils/router.js"

const admin_dashboard = {
    template: `
    <div id="main">
        <div id="canvas">
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <router-link class="navbar-brand" to="/admin_dashboard">Library Management System</router-link>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div style="text-align: right;">
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <router-link class="nav-link active" aria-current="page" to="/admin_status">Status</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/admin/books">Books</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/stats">Stats</router-link>
                                </li>
                            </ul>
                            <ul class="navbar-nav mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <button class="nav-link btn btn-primary-danger" @click='logout'>
                                        <i class="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                </li>
                            </ul>
                            <span class="navbar-text me-3">admin</span>
                        </div>
                    </div>
                </div>
            </nav>
            <div style="display: flex; justify-content: center; align-items: center; padding-top: 200px; background-color: beige;">
                <h1>Welcome To Librarian Dashboard</h1>
            </div>
            <div class="container mt-1">
                <div class="row">
                    <div class="col-md-3" v-for="stat in statistics" :key="stat.title" style="padding-bottom: 15px;">
                        <div class="card text-dark bg-light shadow-sm" style="border: 1px solid #ddd;">
                            <div class="card-header bg-secondary text-white">{{ stat.title }}</div>
                            <div class="card-body">
                                <h5 class="card-title">{{ stat.count }}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    data() {
        return {
            statistics: [],
            role: localStorage.getItem('role'),
            token: localStorage.getItem('auth-token'),
            userid: localStorage.getItem('user_id')
        };
    },
    methods: {
        logout() {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('role');
            localStorage.removeItem('user_id');
            this.$router.push('/user_login');
        }
    },
    async mounted() {
        try {
            const response = await fetch('/app_statistics', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.statistics = [
                    { title: 'Total Users', count: data.users.length },
                    { title: 'Total Books', count: data.books.length },
                    { title: 'Total Sections', count: data.sections.length },
                    { title: 'Requested Books', count: data.requested_books.length },
                    { title: 'Issued Books', count: data.issued_books.length }
                ];
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (err) {
            console.error("Error fetching statistics:", err);
            alert("An error occurred while fetching statistics.");
        }
    },
    computed: {
        is_logged_in() {
            return this.token !== null;
        }
    }
};

export default admin_dashboard