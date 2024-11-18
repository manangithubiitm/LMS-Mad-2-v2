import router from "../utils/router.js";

const edit_section = {
    template: `
    <div id="main">
        <div id="canvas-1">
            <div id="trans-area-1">
                <h2 class="headings" style="text-align: center;">Edit the Section</h2>
                <form @submit.prevent="update_section" class="row g-3 p-2">
                    <div class="mb-3">
                        <label for="sec_name" class="form-label">Section Name</label>
                        <input v-model="section_data.name" type="text" class="form-control" id="sec_name" name="sec_name" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description:</label>
                        <textarea v-model="section_data.description" class="form-control" id="description" name="description" rows="1" required></textarea>
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
            section_data: {
                name: '',
                description: '',
            },
            token: localStorage.getItem('auth-token'),
            section_id: this.$route.params.id,
            sections: [],
        };
    },
    async mounted() {
        try {
            await this.fetch_Section();
            this.setSectionData();
        } catch (err) {
            console.log("Error fetching section data:", err);
        }
    },
    methods: {
        async fetch_Section() {
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
                    this.sections = data.sections;
                    // this.setSectionData();
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (err) {
                console.error("Error while fetching section data:", err);
                alert("An error occurred while fetching section data.");
            }
        },
        setSectionData() {
            const section = this.sections.find(section => section.id === parseInt(this.section_id));
            if (section) {
                this.section_data.name = section.section_name;
                this.section_data.description = section.section_description; 
            } else {
                alert("Section not found");
                this.$router.push('/admin/books');
            }
        },
        async update_section() {
            try {
                const response = await fetch(`/update_section/${this.section_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify(this.section_data)
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
                console.error("Error while updating section:", err);
                alert("An error occurred while updating the section.");
            }
        }
    }
};

export default edit_section;