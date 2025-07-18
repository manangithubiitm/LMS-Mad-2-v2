import router from "../utils/router.js";

const Signup = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-5">
        <h3 class="card-title text-center mb-4">Sign Up</h3>
        <div class="form-group mb-3">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required/>
        </div>
        <div class="form-group mb-3">
          <input v-model="fullname" type="fullname" class="form-control" placeholder="Fullname" required/>
        </div>
        <div class="form-group mb-3">
          <input v-model="username" type="username" class="form-control" placeholder="Username" required/>
        </div>
        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required/>
        </div>
        <div class="form-group mb-4">
          <select v-model="role" class="form-control">
            <option value="user">General User</option>
          </select>
        </div>
        <button class="btn btn-primary w-100" @click="register">Register</button>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      fullname: "",
      username: "",
      password: "",
      role: "",
    };
  },
  methods: {
    async register() {
      const origin = window.location.origin;
      const url = `${origin}/register`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          fullname: this.fullname,
          username: this.username,
          password: this.password,
          role: this.role,
        }),
        credentials: "same-origin",
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        // Handle successful sign up, e.g., redirect or store token
        router.push("/user_login");
      } else {
        const errorData = await res.json();
        console.error("Sign up failed:", errorData);
        // Handle sign up error
      }
    },
  },
};

export default Signup;