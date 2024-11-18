import router from "../utils/router.js";

const Login = {
    template : `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-5 border rounded-3 ">
        <h3 class="card-title text-center mb-4">Login</h3>
        <div class="form-group mb-2">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required/>
        </div>
        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required/>
        </div>
        <button class="btn btn-primary w-100" @click="submitInfo">Submit</button>
        <br>
        <div class="container vh-60 d-flex justify-content-center align-items-center">
          <div class="form-group text-center">
            New User? <br>
            <button type="button" class="btn btn-link" @click="register">Register</button>
          </div>
        </div>
      </div>
    </div>
    `,
    data(){
        return{
            email: "",
            password: "",
        };
    },
    methods: {
        async submitInfo(){
            const url = window.location.origin;
            const res = await fetch(url + "/user_login", {
                method : "POST",
                headers : {
                  "Content-Type" : "application/json",
                },
                body : JSON.stringify({ email : this.email, password : this.password}),
            });
            
            if (res.ok){
              const data = await res.json();

              // console.log(data)
              localStorage.setItem('auth-token', data.token);
              localStorage.setItem('user_id', data.id);
              // localStorage.removeItem('auth_token');
              localStorage.setItem("role", data.role);
              // const userId = data.id;
              // const user_id = localStorage.getItem(user_id)
              if (data.role.includes('admin')) {
                this.$router.push('/admin_dashboard');
              } else if (data.role.includes('user')) {
                this.$router.push(`/user_dashboard`);
              }
            } else {
                const error = await res.json();
                alert(error.message);
            }
        },
        register() {
          this.$router.push('/register')
        },
    },
};

export default Login;