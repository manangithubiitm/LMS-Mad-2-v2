// import Navbar from "../components/Navbar.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Register from "../pages/Register.js";
import add_section from "../pages/add_section.js";
import add_book from "../pages/add_book.js";
import edit_section from "../pages/edit_section.js";
import edit_book from "../pages/edit_book.js";
import admin_dashboard from "../pages/AdminDashboard.js";
import Admin_Books_Sections from "../pages/Admin_Books_Sections.js";
import user_dashboard from "../pages/StudentDashboard.js";
import user_books from "../pages/UserBooks.js";
import book_request from "../pages/BookRequest.js";
import AdminStatus from "../pages/AdminStatus.js";
import user_mybooks from "../pages/User_Mybooks.js";
import view_book from "../pages/View_book.js";
import rate_book from "../pages/Rate_book.js";
import StatsPage from "../pages/Stats_page.js";

const routes = [
    { path : "/", component : Home }, 
    { path : "/user_login", name: 'Login', component : Login },
    { path : "/register", component : Register },
    { path: '/add_section', component: add_section },
    { path: '/add_book', component: add_book },
    { path: '/update_section/:id', component: edit_section, props: true },
    { path: '/update_book/:id', component: edit_book, props: true},
    { path: '/admin_dashboard', component: admin_dashboard},
    { path: '/admin/books', component: Admin_Books_Sections},
    { path: '/user_dashboard', component: user_dashboard },
    { path: '/books', component: user_books },
    { path: '/request_book/:id', component: book_request, props: true },
    { path: '/admin_status', component: AdminStatus },
    { path: '/user/mybooks', component: user_mybooks },
    { path: '/book_view/:id', component: view_book },
    { path: '/rate_book/:id', component: rate_book, props: true },
    { path: '/stats', component: StatsPage }
];

const router = new VueRouter({
    routes,
});

export default router;