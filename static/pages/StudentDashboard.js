import router from "../utils/router.js"

const user_dashboard = {
    // props: ['id'],
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
                                    <router-link class="nav-link active" aria-current="page" :to="'/user/mybooks'">My Books</router-link>
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
                            <span>{{ user ? user.username : 'User' }}</span>
                        </div>
                    </div>
                </div>
            </nav>
            <div style="display: flex; justify-content: center; align-items: center; padding-top: 200px; background-color: honeydew;">
                <h1 v-if="user">Welcome To {{ user.username }} Dashboard</h1>
            </div>
        </div>
    </div>`,
    data() {
        return {
            user: {},
            token: localStorage.getItem('auth-token'),
            user_id: localStorage.getItem('user_id'),
            role: localStorage.getItem('role')
        };
    },
    created() {
        try {
            this.fetchUserData();
        } catch (err) {
            console.log("Error fetching user data:", err);
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('role');
            localStorage.removeItem('user_id');
            this.$router.push('/user_login');
        },
        async fetchUserData() {
            try {
                // Debugging: Check if user_id is correctly set
                // console.log('User ID:', this.id);
                const response = await fetch(`/user_dashboard`, {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': this.token, // Ensure correct header name
                        'Content-Type': 'application/json',
                    },
                });
                console.log(response.ok);
                if (response.ok) {
                    const data = await response.json();
                    this.user = data;
                    // console.log(data);
                    alert(data.message); // Assign fetched data directly to user
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error while fetching user data:', error);
                alert("An error occurred while fetching user data.");
            }
        }
    },
    computed: {
        is_logged_in() {
            return this.token !== null;
        }
    }
};

export default user_dashboard;