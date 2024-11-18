import router from "../utils/router.js";

const rate_book = {
  template: `
    <div>
      <h2 style="text-align: center;">Rate the Book</h2>
      <div v-if="bookName">
        <h1>{{ bookName }}</h1>
        <p v-if="!hasRated">How would you rate this book?</p>
        <p v-if="hasRated">You have already rated this book: {{ currentRating }} star{{ currentRating > 1 ? 's' : '' }}</p>
        
        <select v-if="!hasRated" v-model="rating" style="margin-right: 10px;">
          <option disabled value="">Select a rating</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }} Star{{ n > 1 ? 's' : '' }}</option>
        </select>
        <button v-if="!hasRated" @click="submitRating">Submit Rating</button>
      </div>
      <div v-else>
        <p>Loading book information...</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      bookName: '',
      rating: '',
      currentRating: null, // Store the current rating of the book if it exists
      hasRated: false, // Reactive property to track if the user has already rated the book
      token: localStorage.getItem('auth-token'),
      book_id: this.$route.params.id // Use 'id' to match the route parameter
    };
  },
  
  async mounted() {
    await this.fetchBookInfo();
  },
  
  methods: {
    async fetchBookInfo() {
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
          // Check if the book has already been rated
          if (data.current_rating) {
            this.hasRated = true;
            this.currentRating = data.current_rating;
          }
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Error fetching book information.");
        }
      } catch (error) {
        console.error("Error fetching book information:", error);
        alert("An error occurred while fetching the book information.");
      }
    },
    
    async submitRating() {
      if (!this.rating) {
        alert("Please select a rating before submitting.");
        return;
      }

      try {
        const response = await fetch(`/rate_book/${this.book_id}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating: this.rating })
        });

        const data = await response.json();

        if (response.ok) {
          alert("Rating submitted successfully!");
          this.$router.push('/user/mybooks');
        } else {
          if (data.rating_status === 'already_rated') {
            this.hasRated = true;
            this.currentRating = data.current_rating;
            alert(`You have already rated this book`);
          } else {
            alert(data.message || "Error submitting rating.");
          }
        }
      } catch (error) {
        console.error("Error submitting rating:", error);
        alert("An error occurred while submitting your rating.");
      }
    }
  }
};

export default rate_book;