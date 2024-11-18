import router from "../utils/router.js"; // Assuming this import is needed for routing

const StatsPage = {
    template: `
    <div id="main">
        <h2 class="headings" style="text-align: center;">Stats Page</h2>
        <div id="create-btn" style="text-align: left; margin-left: 10px; padding-left: 10px;" >
            <router-link to="/admin_dashboard">
                <button class="btn btn-primary me-md-2">Go Back</button>
            </router-link>
        </div>
        <div class="mb-3">
            <img :src="imageUrl" alt="Stats Graph" class="img-fluid">
        </div>
    </div>`,
    data() {
        return {
            imageUrl: '', // URL for the stats image
            token: localStorage.getItem('auth-token') // Retrieving token for authentication
        };
    },
    async mounted() {
        try {
            await this.fetchStatsImage(); // Fetch the image when the component is mounted
        } catch (err) {
            console.log("Error fetching stats image:", err);
            alert("An error occurred while fetching the stats image.");
        }
    },
    methods: {
        async fetchStatsImage() {
            try {
                // Fetch the stats image from the server
                const response = await fetch('/stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                });
                if (response.ok) {
                    // If the response is ok, set the image URL to the static image path
                    this.imageUrl = '/static/images/book_section.png'; // This path should match where the backend saves the image
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (err) {
                console.error("Error while fetching stats image:", err);
                alert("An error occurred while fetching the stats image.");
            }
        }
    }
};

export default StatsPage;
