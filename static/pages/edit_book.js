import router from "../utils/router.js";

const edit_book = {
    template: `
    <div id="main">
        <div id="canvas-1">
            <div id="trans-area-1">
                <h2 class="headings" style="text-align: center;">Edit the Book</h2>
                <form @submit.prevent="update_book"class="row g-3 p-2">
                    <div class="mb-3">
                        <label for="book_name" class="form-label">Book Name:</label>
                        <input v-model="book_data.name" type="text" class="form-control" id="book_name" name="book_name" required>
                    </div>
                    <div class="mb-3">
                        <label for="book_author" class="form-label">Book Author:</label>
                        <input v-model="book_data.author" type="text" class="form-control" id="book_author" name="book_author" required>
                    </div>
                    <div class="mb-3">
                        <label for="book_content" class="form-label">Book Content:</label>
                        <textarea v-model="book_data.content" class="form-control" id="book_content" name="book_content" rows="3" required></textarea>
                    </div>
                    <div id="create-btn">
                        <button type="submit" class="btn btn-primary me-md-2">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`,
    data() {
        return {
            book_data: {
                name: '',
                author: '',
                content: ''
            },
            token: localStorage.getItem('auth-token'),
            book_id: this.$route.params.id,
            books: []
        };
    },
    async mounted() {
        try {
            await this.fetch_book();
            this.setBookData();
        } catch (err) {
            console.log("Error fetching book data:", err);
        }
    },
    methods: {
        async fetch_book() {
            try {
                const response = await fetch(`/admin/books`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
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
                console.error("Error while fetching book data:", err);
                alert("An error occurred while fetching book data.");
            }
        },
        setBookData() {
            const book = this.books.find(book => book.id === parseInt(this.book_id));
            if (book) {
                this.book_data.name = book.name;
                this.book_data.author = book.author;
                this.book_data.content = book.content; 
            } else {
                alert("Book not found");
                this.$router.push('/admin/books');
            }
        },
        async update_book() {
            try {
                const response = await fetch(`/update_book/${this.book_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify(this.book_data)
                });
                if (response.ok) {
                    const response_Data = await response.json();
                    alert(response_Data.message);
                    this.$router.push('/admin/books');
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (err) {
                console.error("Error while updating book:", err);
                alert("An error occurred while updating the book.");
            }
        }
    }
};

export default edit_book;