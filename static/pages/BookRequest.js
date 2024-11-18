import router from "../utils/router.js";

const book_request = {
  template: `
    <div id="main">
        <div id="canvas">
            <div v-if="alertMessage" :class="'alert alert-' + alertCategory + ' alert-dismissible fade show'" role="alert">
                {{ alertMessage }}
                <button type="button" class="btn btn-close" @click="clearAlert" aria-label="Close"></button>
            </div>
            <div id="form-body-1">
                <h2 style="text-align: center;">No of days to Request</h2>
                <form @submit.prevent="submitRequest">
                    <div class="mb-3" style="padding-top: 10px;">
                        <label for="days_requested">Enter No of days:</label>
                        <input type="number" v-model="daysRequested" id="days_requested" name="days_requested" step="1" placeholder="Only numeric values" required>
                    </div>
                    <div style="text-align: center; padding-top: 20px;">
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </form> 
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      daysRequested: '',
      bookId: null,
      alertMessage: null,
      alertCategory: null,
      token: localStorage.getItem('auth-token'),
    };
  },
  methods: {
    async submitRequest() {
      try {
        const response = await fetch(`/request_book/${this.bookId}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ days_requested: this.daysRequested })
        });

        const textResponse = await response.text();
        console.log('Response Text:', textResponse);

        if (response.ok) {
          const data = JSON.parse(textResponse);
          this.alertMessage = data.message || 'Book requested successfully';
          this.alertCategory = 'success';
          router.push('/books');
        } else {
          const error = JSON.parse(textResponse);
          this.alertMessage = error.message || 'Failed to request book';
          this.alertCategory = 'danger';
        }
      } catch (error) {
        console.error('Error:', error);
        this.alertMessage = 'An error occurred while requesting the book.';
        this.alertCategory = 'danger';
      }
    },
    clearAlert() {
      this.alertMessage = null;
      this.alertCategory = null;
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.bookId = this.$route.params.id;
  }
};

export default book_request;