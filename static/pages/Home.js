import router from "../utils/router.js";
const Home = {
    template : `
    <div style="height: 100vh; background-image: url('static/images/Library.jpg'); background-size: cover; background-position: center; display: flex; justify-content: center; align-items: center;">
        <div class="container" style="margin-top: 20px; padding: 20px; display: flex; flex-direction: column; font-family: 'Arial', sans-serif; background-color: #f9f9f6; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0.9, 0.1); max-width: 600px;">
            <div style="margin-bottom: 20px;">
                <div style="background-color: #ff6f58; padding: 15px; border-radius: 10px;">
                    <h3 style="color: white; font-size: 24px; text-align: center; margin: 0;">Library Management System</h3>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
                <button class="btn btn-primary" style="margin: 10px; background-color: #0u1000; border-color: #0e9aa7; width: 90%;" @click="login">Login</button>
                <button class="btn btn-primary" style="margin: 10px; background-color: #ggh855; border-color: #ffb703; width: 90%;" @click="register">Register</button>
            </div>
        </div>
    </div> `,
    
    data(){
        return {
            message: 'Welcome to Home Page'
        }
    },
    methods: {
        login() {
            this.$router.push('/user_login');
        },
        register() {
            this.$router.push('/register');
        }
    },
}

export default Home;