


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const cloudinary = require('cloudinary').v2; // Make sure you have configured Cloudinary

// Register a new employee
exports.registerEmployee = async (req, res) => {
  const {
    name,
    email,
    password,
    category,
    speciality,
    phone,
    education,
    address1,
    address2,
    experience,
    fees,
    about,
  } = req.body;

  try {
    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let uploadedImage;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      uploadedImage = result.secure_url;
    }

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      category,
      speciality,
      phone,
      education,
      address1,
      address2,
      experience,
      fees,
      about,
      image: uploadedImage || null, // Save the Cloudinary image URL
    });

    await newEmployee.save();

    const token = jwt.sign({ id: newEmployee._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Employee registered successfully!",
      token,
      employee: newEmployee,
    });
  } catch (err) {
    console.error('Error registering employee: ', err);
    res.status(500).json({ message: "Server error!" });
  }
};

// Update an Employee by ID
exports.updateEmployeeById = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    category,
    speciality,
    phone,
    education,
    address1,
    address2,
    experience,
    fees,
    about,
  } = req.body;

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    let uploadedImage = employee.image; // Use existing image if no new image is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      uploadedImage = result.secure_url;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        name,
        email,
        category,
        speciality,
        phone,
        education,
        address1,
        address2,
        experience,
        fees,
        about,
        image: uploadedImage,
      },
      { new: true } // Return the updated employee
    );

    res.status(200).json({
      message: "Employee updated successfully!",
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error('Error updating employee: ', err);
    res.status(500).json({ message: "Server error!" });
  }
};
// Delete an Employee by ID
exports.deleteEmployeeById = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    // If the employee has an image, delete it from Cloudinary
    if (employee.image) {
      const imagePublicId = employee.image.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(imagePublicId);
    }

    await Employee.findByIdAndDelete(id); // Delete employee from database

    res.status(200).json({ message: "Employee deleted successfully!" });
  } catch (err) {
    console.error("Error deleting employee: ", err);
    res.status(500).json({ message: "Server error!" });
  }
};

// Authenticate Employee
exports.loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      console.log("Employee not found: ", email);  // Debugging log
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    console.log("Employee found: ", employee); // Debugging log

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      console.log("Password mismatch"); // Debugging log
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful!",
      token,
      employee,
    });
  } catch (err) {
    console.error('Error during employee login: ', err);
    res.status(500).json({ message: "Server error!" });
  }
};

// Get all Employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      name: 1,
      email: 1,
      category: 1,
      speciality: 1,
      phone: 1,
      education: 1,
      address1: 1,
      address2: 1,
      experience: 1,
      fees: 1,
      about: 1,
      image: 1,
    });

    res.status(200).json(employees);
  } catch (err) {
    console.error('Error retrieving employees: ', err);
    res.status(500).json({ message: "Server error!" });
  }
};

// Get an Employee by ID
exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid ID format!" });
  }

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    res.status(200).json(employee);
  } catch (err) {
    console.error('Error retrieving employee by ID: ', err);
    res.status(500).json({ message: "Server error!" });
  }
};
