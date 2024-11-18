import router from "../utils/router.js";

const view_book = {
  template: `
  <div>
    <h2 style="text-align: center;">View the Book</h2>
        <div v-if="bookName && bookText">
            <h1>{{ bookName }}</h1>
            <p>{{ bookText }}</p>
        </div>
        <div v-else>
            <p>Loading book content...</p>
        </div>
  </div>`,
  data() {
    return {
      bookName: '',
      bookText: '',
      token: localStorage.getItem('auth-token'),
      book_id: this.$route.params.id // Use 'id' to match the route parameter
    };
  },
  
  async mounted() {
    await this.fetchBookContent();
  },
  
  methods: {
    async fetchBookContent() {
      try {
        const response = await fetch(`/book_view/${this.book_id}`, {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.bookName = data.book_name;
          this.bookText = data.book_text;
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Error fetching book content.");
        }
      } catch (error) {
        console.error("Error fetching book content:", error);
        alert("An error occurred while fetching the book content.");
      }
    }
  }
};

export default view_book;