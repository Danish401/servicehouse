// const express = require("express");
// const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
// const employeeController = require("../controllers/employeeController");
// const multer = require("multer");
// const router = express.Router();
// const path = require("path");
// // POST route for registration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads"));
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const upload = multer({ storage });
// router.post("/register", authMiddleware, roleMiddleware('employee'), upload.single("image"), employeeController.registerEmployee);

// // POST route for login
// router.post("/login", authMiddleware, roleMiddleware('employee'), employeeController.loginEmployee);
// router.put("/:id",  authMiddleware, roleMiddleware('employee'),upload.single("image"), employeeController.updateEmployeeById);
// // GET route to fetch all employees
// router.get("/employees", authMiddleware, roleMiddleware('employee'), employeeController.getAllEmployees);
// router.get("/employees/:id",  authMiddleware, roleMiddleware('employee'),employeeController.getEmployeeById);  // Get employee by ID
// module.exports = router;

const express = require("express");
const multer = require("multer");
const path = require("path");
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const employeeController = require("../controllers/employeeController");

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Define upload destination folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Define filename format
  },
});

const upload = multer({ storage }); // Create multer instance

// POST route for registration
router.post("/register", upload.single("image"), employeeController.registerEmployee);

// POST route for login
router.post("/login", employeeController.loginEmployee);

// PUT route for updating employee data
router.put("/:id", upload.single("image"), employeeController.updateEmployeeById);

// GET route to fetch all employees
router.get("/employees", employeeController.getAllEmployees);

// GET route to fetch a specific employee by ID
router.get("/employees/:id", employeeController.getEmployeeById);

module.exports = router;
