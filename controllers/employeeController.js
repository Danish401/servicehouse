


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const cloudinary = require('cloudinary').v2; // Make sure you have configured Cloudinary

// ✅ Send Registration Success Email
const sendRegistrationEmail = async (email, name) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Secure SMTP port for Gmail
      secure: true, // Use SSL for port 465
      auth: {
        user: process.env.EMAIL_USER, // Store in .env
        pass: process.env.EMAIL_PASS, // Store in .env
      },
    });

    let info = await transporter.sendMail({
      from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome! You are Registered Successfully as Employee",
      text: `Dear ${name || "User"}, 
    
    Congratulations! You have successfully registered with House Service as an Employee.
    
    Your employee account has been created and you can now access all our services.
    
    Thank you for choosing House Service. We look forward to serving with you!
    
    If you have any questions, please feel free to contact our support team.
    
    Best Regards,
    House Service Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #6E6ADE; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Welcome to House Service!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 5px 5px;">
            <p style="font-size: 16px; color: #333;">Dear ${name || "User"},</p>
            <p style="font-size: 16px; color: #333;">Congratulations! You have successfully registered with House Service as an Employee.</p>
            <p style="font-size: 16px; color: #333;">Your employee account has been created and you can now access all our services.</p>
            <div style="background-color: #E2DDFE; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #333;"><strong>What's Next?</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
                <li>Complete your profile with detailed information</li>
                <li>Start receiving booking requests from customers</li>
                <li>Manage your appointments and schedule</li>
              </ul>
            </div>
            <p style="font-size: 16px; color: #333;">Thank you for choosing House Service. We look forward to serving with you!</p>
            <p style="font-size: 16px; color: #333;">If you have any questions, please feel free to contact our support team.</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Best Regards,<br/> <strong>House Service Support Team</strong></p>
          </div>
        </div>
      `,
    });
    
    console.log("Employee Registration Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending registration email:", error);
    // Don't throw error - registration should still succeed even if email fails
  }
};

// Register a new employee
exports.registerEmployee = async (req, res) => {
  const {
    name,
    email,
    password,
    category,
    speciality,
    phone,
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
      address1,
      address2,
      experience,
      fees,
      about,
      image: uploadedImage || null, // Save the Cloudinary image URL
    });

    await newEmployee.save();

    // Send registration success email
    await sendRegistrationEmail(email, name);

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
    // Check if MongoDB connection is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "Database connection not ready. Please try again in a moment." 
      });
    }

    const employees = await Employee.find({}, {
      name: 1,
      email: 1,
      category: 1,
      speciality: 1,
      phone: 1,
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
