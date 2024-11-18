import router from "../utils/router.js"

const add_book = {
    template: 
    `<div id="main">
        <div id="canvas">
            <div id="trans-area">
                <h2 class="headings" style="text-align: center;">Create a new Book</h2>
                <form class="row g-3 p-2">
                    <div class="mb-3">
                        <label for="name" class="form-label"><b>Book Title</b></label>
                        <input v-model="book_data.name" type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="author" class="form-label"><b>Book Author</b></label>
                        <input v-model="book_data.author" type="text" id="author" name="author" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="content" class="form-label"><b>Book Content</b></label>
                        <textarea v-model="book_data.content" id="content" name="content" rows="5" class="form-control" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="section" class="form-label"><b>Section</b></label>
                        <select v-model="book_data.sect" id="section" name="section" class="form-select" required>
                        <option value="Please select section" disabled selected>Select section</option>
                        <option v-for="section in sections" :value="section.id">{{ section.section_name }}</option>
                        </select>
                    </div>
                    <div id="create-btn">
                        <button type="button" class="btn btn-primary me-md-2" @click="AddBook">Add</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`,
    data() {
        return {
            book_data: {
                name: null,
                author: null,
                content: null,
                sect: null,
           },
            sections: [],
            // section_selected: null,
            
            token: localStorage.getItem('auth-token')
        }
    },
    async mounted() {
        try {
            await this.fetch_sections();
        } catch(err) {
            console.log("Some error has happened");
        }
    },
    methods: {
        async AddBook() {
            // console.log("Trying to add a book")
            
            if (!this.book_data.name || !this.book_data.author || !this.book_data.content || !this.book_data.sect) {
                alert("Please enter all the relevant data");
                return;
            }

            try {
                const response = await fetch (`/book_add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token,
                    },
                    body: JSON.stringify(this.book_data),
                });
                if (response.ok) {
                    const response_data = await response.json();
                    alert(response_data.message);
                    this.$router.push('/admin/books');
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch(error) {
                console.error("Error while adding book:", error);
                alert("An error occurred while adding the book.");
            }
        },
        async fetch_sections() {
            try {
                const response = await fetch('/admin/books', {
                    headers: {
                        'Authentication-Token': this.token,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    this.sections = data.sections
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (error) {
                console.error("Error while fetching sections:", error);
                alert("An error occurred while fetching sections.");
            }
        },
    }
}
export default add_book;