import router from "../utils/router.js"

const add_section = {
    template: 
    `<div id="main">
        <div id="canvas-1">
            <div id="trans-area-1">
                <h2 class="headings" style="text-align: center;">Create a new Section</h2>
                <form class="row g-3 p-2">
                    <div class="mb-3">
                        <label for="name" class="form-label"><b>Section Name</b></label>
                        <input v-model="section_data.name" type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label"><b>Section Description</b></label>
                        <textarea v-model="section_data.description" id="description" name="description" rows="2" class="form-control" required></textarea>
                    </div>
                    <div id="create-btn">
                        <button type="button" class="btn btn-primary me-md-2" @click="AddSection">Add</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`,
    
    data() {
        return {
            section_data : {
                name: null,
                description: null,
            },
            token: localStorage.getItem('auth-token')
        }
    },
    methods: {
        async AddSection() {
            if (!this.section_data.name || !this.section_data.description) {
                alert("Please enter all the relevant data");
                return;
            }

            try {
                const response = await fetch (`/add_section`, {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json',
                        'Authentication-Token' : this.token,
                    },
                    body: JSON.stringify(this.section_data),
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
                console.error("Error while adding section:", error);
                alert("An error occurred while adding the section.");
            }
        }
    }
}
export default add_section
