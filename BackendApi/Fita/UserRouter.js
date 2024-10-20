
const express = require('express');
const multer = require('multer');
const UserData = require('./UserModel'); 
const router = express.Router();
const Placement = require('./PlacementModel');
const Recruiter = require('./RecruiterModel');
const Institution = require('./InstitutionModel');
const TestData = require('./TestModel');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Registration route
router.post('/register', upload.fields([{ name: 'resume' }, { name: 'photo' }]), async (req, res) => {
    const { name, email, phone, qualification, passingOutYear, course, experience, position, portfolioLink } = req.body;
    const resume = req.files['resume'] ? req.files['resume'][0].filename : null;
    const photo = req.files['photo'] ? req.files['photo'][0].filename : null;

    try {
        const newUser = new UserData({
            name,
            email,
            phone,
            qualification,
            passingOutYear,
            course,
            experience,
            position,
            portfolioLink,
            resume,
            photo
        });
        await newUser.save();
        return res.status(200).json({ message: "User Added", data: newUser });
    } catch (error) {
        // Handle errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: " validation error", errors: errorMessages });
        }
        if (error.code === 11000) {
            return res.status(401).json({ message: "Duplicate Email Address" });
        }
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});



//Check User
router.post('/check', async (req, res) => {
    try {
        const { email, password } = req.body;

        const check_user = await UserData.findOne({ email, password });

        if (check_user) {
            return res.status(200).json({ message: "User found" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});




// Update User
router.post('/update', upload.fields([{ name: 'resume' }, { name: 'photo' }]), async (req, res) => {
    const { email, name, phone, qualification, passingOutYear, course, experience, position, portfolioLink } = req.body;
    const resume = req.files['resume'] ? req.files['resume'][0].filename : null;
    const photo = req.files['photo'] ? req.files['photo'][0].filename : null;

    try {
        const updateData = await UserData.findOneAndUpdate(
            { email },
            {
                $set: {
                    name,
                    phone,
                    qualification,
                    passingOutYear,
                    course,
                    experience,
                    position,
                    portfolioLink,
                    ...(resume && { resume }), 
                    ...(photo && { photo }) 
                }
            },
            { new: true, runValidators: true }
        );

        if (updateData) {
            return res.status(200).json({ message: "User Updated", user: updateData });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});



// Delete User
router.delete('/delete', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const deleteUser = await UserData.findOneAndDelete({ email });

        if (deleteUser) {
            return res.status(200).json({ message: "User Deleted" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// Get All Users
router.get('/', async (req, res) => {
    console.log('GET request to fetch all user data');
    try {
        const allData = await UserData.find();
        if (allData.length > 0) {
            return res.status(200).json({ message: allData });
        } else {
            return res.status(404).json({ message: "No Data Found" });
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: error.message });
    }
});



// ----------------------------------------------------------------------


// placement curd


// Placement route
router.post('/placement', upload.single('photo'), async (req, res) => {
    const { name, placementCompany, position, course } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !placementCompany || !position || !course || !photo) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const newPlacement = new Placement({ name, placementCompany, position, course, photo });
        await newPlacement.save();
        return res.status(201).json({ message: "Placement Added", data: newPlacement });
    } catch (error) {
        return res.status(500).json({ message: "Error adding placement", error: error.message });
    }
});



// Get all placements
router.get('/placements', async (req, res) => {
    try {
        const allPlacements = await Placement.find();
        return res.status(200).json({ message: allPlacements.length > 0 ? allPlacements : "No Placements Found" });
    } catch (error) {
        console.error("Error fetching placements:", error);
        return res.status(500).json({ message: error.message });
    }
});



// Update a placement by ID
router.put('/placement/update/:id', upload.single('photo'), async (req, res) => {
    const { id } = req.params; // Use ID from params
    const { placementCompany, position, course } = req.body;
    let photo;

    if (req.file) {
        photo = req.file.filename; // Update photo only if a new one is uploaded
    }

    try {
        const placement = await Placement.findById(id);
        if (!placement) {
            return res.status(404).json({ message: "Placement not found" });
        }

        // Update fields
        placement.placementCompany = placementCompany || placement.placementCompany;
        placement.position = position || placement.position;
        placement.course = course || placement.course;
        if (photo) {
            placement.photo = photo; // Update photo if provided
        }

        await placement.save();
        return res.status(200).json({ message: "Placement updated", data: placement });
    } catch (error) {
        return res.status(500).json({ message: "Error updating placement", error: error.message });
    }
});


router.delete('/placement/delete/:id', async (req, res) => {
    const { id } = req.params; // Use ID from params

    try {
        const placement = await Placement.findByIdAndDelete(id);
        if (!placement) {
            return res.status(404).json({ message: "Placement not found" });
        }
        return res.status(200).json({ message: "Placement deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting placement", error: error.message });
    }
});





// -----------------------------------------------------------------------


// Create Recruiter
router.post('/recruiter', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const newRecruiter = new Recruiter({ email, password });
        await newRecruiter.save();
        return res.status(201).json({ message: "Recruiter created successfully", data: newRecruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error adding recruiter", error: error.message });
    }
});

router.delete('/recruiterdelete', async (req, res) => {
    const { email } = req.body; // Extract email from the request body

    try {
        const deletedRecruiter = await Recruiter.findOneAndDelete({ email }); // Find and delete by email

        if (!deletedRecruiter) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        return res.status(200).json({ message: "Recruiter deleted successfully", data: deletedRecruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting recruiter", error: error.message });
    }
});


router.post('/recruitercheck', async (req, res) => {
    const { email } = req.body; // Extract email from the request body

    try {
        const recruiter = await Recruiter.findOne({ email }); // Find recruiter by email

        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        return res.status(200).json({ message: "Recruiter exists.", data: recruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error checking recruiter", error: error.message });
    }
});


router.post('/recruiterlogin', async (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const recruiter = await Recruiter.findOne({ email }); // Find recruiter by email

        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        // Compare the provided password with the stored password (plain text)
        if (recruiter.password !== password) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // If the password matches, return success response
        return res.status(200).json({ message: "Login successful", data: recruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
});




// --------------------------------------------------------------

// Institution Curd

router.post('/Institution', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const newRecruiter = new Institution({ email, password });
        await newRecruiter.save();
        return res.status(201).json({ message: "Recruiter created successfully", data: newRecruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error adding recruiter", error: error.message });
    }
});

router.delete('/Institutiondelete', async (req, res) => {
    const { email } = req.body; // Extract email from the request body

    try {
        const deletedRecruiter = await Institution.findOneAndDelete({ email }); // Find and delete by email

        if (!deletedRecruiter) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        return res.status(200).json({ message: "Recruiter deleted successfully", data: deletedRecruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting recruiter", error: error.message });
    }
});


router.post('/Institutioncheck', async (req, res) => {
    const { email } = req.body; 

    try {
        const recruiter = await Institution.findOne({ email }); // Find recruiter by email

        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        return res.status(200).json({ message: "Recruiter exists.", data: recruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error checking recruiter", error: error.message });
    }
});


router.post('/Institutionlogin', async (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const recruiter = await Institution.findOne({ email }); // Find recruiter by email

        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        if (recruiter.password !== password) {
            return res.status(401).json({ message: "Invalid password." });
        }

        return res.status(200).json({ message: "Login successful", data: recruiter });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
});



// -------------------------------------------------------------------


// Testimonal Curd


// CREATE: Register a new test entry

router.post('/Test', upload.single('photo'), async (req, res) => {
    const { name, course, textarea,status } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !course || !textarea ||!photo || status) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const newTestData = new TestData({ name, course, photo, textarea });
        await newTestData.save();
        return res.status(201).json({ message: "Test entry created successfully", data: newTestData });
    } catch (error) {
        return res.status(500).json({ message: "Error adding TestData", error: error.message });
    }
});




router.get('/Tests', async (req, res) => {
    try {
        const testData = await TestData.find();
        // Map to include the full URL for the photo
        const formattedData = testData.map(item => ({
            ...item.toObject(),
            photo: item.photo ? `http://localhost:5000/uploads/${item.photo}` : null // Include the full URL
        }));
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving test entries", error: error.message });
    }
});




// GET: Retrieve a single test entry by ID
router.get('/Test/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const testData = await TestData.findById(id);

        if (!testData) {
            return res.status(404).json({ message: "Test entry not found." });
        }

        res.status(200).json(testData);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving test entry", error: error.message });
    }
});




router.put('/UpdateStatus/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status)

    // Input validation
    if (status !== 0 && status !== 1) {
        return res.status(400).json({ message: "Status must be either 0 or 1." });
    }

    try {
        const updatedTestData = await TestData.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedTestData) {
            return res.status(404).json({ message: "Test entry not found." });
        }

        return res.status(200).json({ message: "Test entry status updated successfully", data: updatedTestData });
    } catch (error) {
        console.error("Error updating test entry status:", error); // Logging error
        return res.status(500).json({ message: "Error updating test entry status", error: error.message });
    }
});



// DELETE: Delete a test entry by ID
router.delete('/Testdelete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTestData = await TestData.findByIdAndDelete(id);

        if (!deletedTestData) {
            return res.status(404).json({ message: "Test entry not found." });
        }

        return res.status(200).json({ message: "Test entry deleted successfully", data: deletedTestData });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting test entry", error: error.message });
    }
});

// CHECK: Check if a test entry exists by name
router.post('/Testcheck', async (req, res) => {
    const { name } = req.body;

    try {
        const testData = await TestData.findOne({ name });

        if (!testData) {
            return res.status(404).json({ message: "Test entry not found." });
        }

        return res.status(200).json({ message: "Test entry exists.", data: testData });
    } catch (error) {
        return res.status(500).json({ message: "Error checking test entry", error: error.message });
    }
});



// LOGIN: Example login logic based on name
router.post('/Testlogin', async (req, res) => {
    const { name, textarea } = req.body;

    if (!name || !textarea) {
        return res.status(400).json({ message: "Name and feedback are required." });
    }

    try {
        const testData = await TestData.findOne({ name });

        if (!testData) {
            return res.status(404).json({ message: "Test entry not found." });
        }

        if (testData.textarea !== textarea) {
            return res.status(401).json({ message: "Invalid feedback." });
        }

        return res.status(200).json({ message: "Login successful", data: testData });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
});




module.exports = router;
