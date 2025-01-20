// const Booking = require("../models/Booking");
// const Employee = require("../models/Employee");
// const Customer = require("../models/User");

// // Create a booking
// exports.createBooking = async (req, res) => {
//     try {
//       const { employee, customer, date, time, address, notes,rating } = req.body;

//       // Check if the employee exists
//       const employeeExists = await Employee.findById(employee).select("-password"); // Exclude password
//       if (!employeeExists) return res.status(404).json({ message: "Employee not found" });

//       // Check if the customer exists
//       const customerExists = await Customer.findById(customer);
//       if (!customerExists) return res.status(404).json({ message: "Customer not found" });

//       // Log the employee details
//       console.log("Employee Details:", employeeExists);

//       // Create a new booking
//       const booking = new Booking({
//         employee,
//         customer,
//         date,
//         time,
//         address,
//         notes,
//         rating
//       });

//       await booking.save();

//       res.status(201).json({
//         message: "Booking created successfully",
//         booking,
//         employeeDetails: employeeExists,
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   // Get bookings for a specific customer
//   exports.getCustomerBookings = async (req, res) => {
//     try {
//       const { customerId } = req.params;

//       const bookings = await Booking.find({ customer: customerId })
//         .populate("employee", "name category speciality image   address1 phone email rating -password") // Exclude password
//         .sort({ date: -1 });

//       res.status(200).json(bookings);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   // Get bookings for a specific employee
//   exports.getEmployeeBookings = async (req, res) => {
//     try {
//       const { employeeId } = req.params;

//       const bookings = await Booking.find({ employee: employeeId })
//         .populate("customer", "name email address1 phone")
//         .sort({ date: -1 });

//       res.status(200).json(bookings);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   // Get booking by ID
//   exports.getBookingById = async (req, res) => {
//     try {
//       const { bookingId } = req.params;

//       const booking = await Booking.findById(bookingId)
//         .populate("employee", "name  address1 category speciality phone image rating") // Don't include password here
//         .populate("customer", "name email address1 phone rating");

//       if (!booking) return res.status(404).json({ message: "Booking not found" });

//       // After populating, exclude password from the employee data
//       booking.employee.password = undefined; // Exclude password field from the employee object

//       res.status(200).json(booking);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   // Get all bookings
//   exports.getAllBookings = async (req, res) => {
//     try {
//       const bookings = await Booking.find()
//         .populate("employee", "name category speciality rating address1 phone image") // Exclude password here as well
//         .populate("customer", "name email  address1")
//         .sort({ date: -1 });

//       // Exclude password from all employee data in the result
//       bookings.forEach(booking => {
//         if (booking.employee) {
//           booking.employee.password = undefined; // Manually remove password
//         }
//       });

//       res.status(200).json(bookings);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   // Cancel a booking
//   exports.cancelBooking = async (req, res) => {
//     try {
//       const { bookingId } = req.params;

//       const booking = await Booking.findById(bookingId);
//       if (!booking) return res.status(404).json({ message: "Booking not found" });

//       booking.status = "Cancelled";
//       await booking.save();

//       res.status(200).json({ message: "Booking cancelled successfully", booking });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

const Booking = require("../models/Booking");
const Employee = require("../models/Employee");
const Customer = require("../models/User");

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { employee, customer, date, time, address, notes, rating } = req.body;

    // Validate required fields
    if (!employee || !customer || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the employee exists
    const employeeExists = await Employee.findById(employee).select(
      "-password"
    ); // Exclude password
    if (!employeeExists)
      return res.status(404).json({ message: "Employee not found" });

    // Check if the customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists)
      return res.status(404).json({ message: "Customer not found" });

    // Validate rating if provided
    if (rating?.value && (rating.value < 1 || rating.value > 5)) {
      return res
        .status(400)
        .json({ message: "Rating value must be between 1 and 5" });
    }

    // Create a new booking
    const booking = new Booking({
      employee,
      customer,
      date,
      time,
      address,
      notes,
      rating,
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      employeeDetails: employeeExists,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for a specific customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bookings = await Booking.find({ customer: customerId })
      .populate(
        "employee",
        "name category speciality image address1 phone email rating"
      ) // Exclude password
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for a specific employee
exports.getEmployeeBookings = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const bookings = await Booking.find({ employee: employeeId })
      .populate("customer", "name email address1 address2 image phone")
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate(
        "employee",
        "name email address1 category speciality phone image rating"
      ) // Exclude password
      .populate("customer", "name email address1 phone rating");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
    .populate(
      "employee",
      "name category speciality rating address1 phone image"
    )
    .populate("customer", "name email image address1 phone") // Ensure 'image' is included here
    .sort({ date: -1 });
  

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking details
exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    // Validate if there are any fields to update
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No fields to update provided" });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update only the fields provided in the request body
    Object.keys(updates).forEach((key) => {
      booking[key] = updates[key];
    });

    // Save the updated booking
    await booking.save();

    // Populate related fields for the response
    const updatedBooking = await Booking.findById(bookingId)
      .populate(
        "employee",
        "name email address1 category speciality phone image rating"
      )
      .populate("customer", "name email address1 phone rating");

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a booking
// Example backend PATCH handler
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update status to "Cancelled"
    booking.status = "Cancelled";
    await booking.save(); // Save the updated booking

    // Return the updated booking in the response
    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate the status value
    const validStatuses = ["Pending", "Accepted", "Rejected", "Completed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid status value. Valid values are: Pending, Accepted, Rejected, Completed.",
        });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the status
    booking.status = status;
    await booking.save(); // Save the updated booking

    // Return the updated booking in the response
    res
      .status(200)
      .json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
