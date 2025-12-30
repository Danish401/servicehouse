
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Booking = require("../models/Booking");
const Employee = require("../models/Employee");
const Customer = require("../models/User");





// exports.invoice = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const booking = await Booking.findById(bookingId)
//       .populate("employee", "name email address1 category speciality phone image")
//       .populate("customer", "name email address1 phone");

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // **Set headers to indicate a file download**
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="invoice_${bookingId}.pdf"`);

//     // **Create PDF Stream**
//     const doc = new PDFDocument({ margin: 50 });
//     doc.pipe(res); // Send PDF directly to response

//     // === HEADER WITH LOGO ===
    // const logoPath = path.join(__dirname, "../assets/logo.jpg"); // Ensure correct path
    // doc.image(logoPath, 50, 30, { width: 100 }).moveDown(1);
    // doc.font("Helvetica-Bold").fontSize(22).fillColor("#111827").text("INVOICE", { align: "center" }).moveDown(2);
    // doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#7d66d9").moveDown(1.5);

//     // === EMPLOYEE DETAILS ===
//     if (booking.employee) {
//       doc.fontSize(14).fillColor("#111827").text("From:", { align: "left" });
//       doc.fontSize(12).fillColor("#000000")
//         .text(`Name: ${booking.employee.name || "N/A"}`)
//         .text(`Email: ${booking.employee.email || "N/A"}`)
//         .text(`Phone: ${booking.employee.phone || "N/A"}`)
//         .text(`Category: ${booking.employee.category || "N/A"}`)
//         .text(`Speciality: ${booking.employee.speciality || "N/A"}`)
//         .text(`Address: ${booking.employee.address1 || "N/A"}`)
//         .moveDown(1);
//     } else {
//       doc.fontSize(14).fillColor("red").text("Employee details not found.");
//     }

//     // === CUSTOMER DETAILS ===
//     if (booking.customer) {
//       doc.fontSize(14).fillColor("#111827").text("Bill To:", { align: "left" });
//       doc.fontSize(12).fillColor("#000000")
//         .text(`Name: ${booking.customer.name || "N/A"}`)
//         .text(`Email: ${booking.customer.email || "N/A"}`)
//         .text(`Phone: ${booking.customer.phone || "N/A"}`)
//         .text(`Address: ${booking.customer.address1 || "N/A"}`)
//         .moveDown(1);
//     } else {
//       doc.fontSize(14).fillColor("red").text("Customer details not found.");
//     }

//     doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#5b5bd6").moveDown(1.5);

//     // === BOOKING DETAILS ===
//     doc.fontSize(14).fillColor("#111827").text("Booking Details:").moveDown(0.5);
//     doc.fontSize(12).fillColor("#000000")
//       .text(`Invoice Number: INV-${booking._id.toString().substring(0, 6).toUpperCase()}`)
//       .text(`Booking ID: ${booking._id}`)
//       .text(`Date: ${new Date(booking.date).toLocaleDateString()}`)
//       .text(`Time: ${booking.time}`)
//       .text(`Status: ${booking.status}`)
//       .text(`Address: ${booking.address}`)
//       .text(`Notes: ${booking.notes}`)
//       .moveDown(2);

//     doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ffdd57").moveDown(1.5);
//     doc.fontSize(12).fillColor("#111827").text("Thank you for your business!", { align: "center" });

//     // **End PDF and close stream**
//     doc.end();
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     if (!res.headersSent) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// };



exports.invoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("employee", "name email address1 category speciality phone image")
      .populate("customer", "name email address1 phone");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // **Set Headers for PDF Download**
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="HouseService_Invoice_${bookingId}.pdf"`);

    // **Create PDF Stream**
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // === HOUSE SERVICE HEADER ===
    const logoPath = path.join(__dirname, "../assets/logo.jpg"); // Ensure correct path
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 100 }).moveDown(1);
    }

    doc.fillColor("#7D66D9").font("Helvetica-Bold").fontSize(22).text("HOUSE SERVICE INVOICE", { align: "center" }).moveDown(0.5);
    doc.fillColor("#5B5BD6").fontSize(12).text("Reliable Home Repair & Maintenance Services", { align: "center" }).moveDown(1.5);
    
    // **Separator Line**
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#7D66D9").moveDown(1.5);

    // === SERVICE PROVIDER (EMPLOYEE) DETAILS ===
    if (booking.employee) {
      doc.fillColor("#111827").fontSize(14).text("Service Provider:", { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Name: ${booking.employee.name || "N/A"}`)
        .text(`Email: ${booking.employee.email || "N/A"}`)
        .text(`Phone: ${booking.employee.phone || "N/A"}`)
        .text(`Category: ${booking.employee.category || "N/A"}`)
        .text(`Speciality: ${booking.employee.speciality || "N/A"}`)
        .text(`Address: ${booking.employee.address1 || "N/A"}`)
        .moveDown(1);
    } else {
      doc.fillColor("red").fontSize(14).text("Service provider details not found.");
    }

    // === CUSTOMER DETAILS ===
    if (booking.customer) {
      doc.fillColor("#111827").fontSize(14).text("Customer Details:", { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Name: ${booking.customer.name || "N/A"}`)
        .text(`Email: ${booking.customer.email || "N/A"}`)
        .text(`Phone: ${booking.customer.phone || "N/A"}`)
        .text(`Address: ${booking.customer.address1 || "N/A"}`)
        .moveDown(1);
    } else {
      doc.fillColor("red").fontSize(14).text("Customer details not found.");
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#5B5BD6").moveDown(1.5);

    // === BOOKING DETAILS ===
    doc.fillColor("#111827").fontSize(14).text("Booking Details:", { underline: true }).moveDown(0.5);
    doc.fontSize(12)
      .text(`Invoice Number: HS-${booking._id.toString().substring(0, 6).toUpperCase()}`)
      .text(`Booking ID: ${booking._id}`)
      .text(`Date: ${new Date(booking.date).toLocaleDateString()}`)
      .text(`Time: ${booking.time}`)
      .text(`Service Location: ${booking.address || "N/A"}`)
      .text(`Notes: ${booking.notes || "No additional notes"}`)
      .moveDown(2);

    // **Separator Line**
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#FFDD57").moveDown(1.5);

    // **FOOTER MESSAGE**
    doc.fillColor("#111827").fontSize(12).text("Thank you for choosing House Service!", { align: "center" }).moveDown(0.5);
    doc.fillColor("#5B5BD6").fontSize(10).text("For support, contact us at houseservicesup@gmail.com,+91-70092-36647", { align: "center" }).moveDown(2);

    // **End PDF**
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating invoice" });
    }
  }
};



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

    // Check for booking conflicts - same employee, date, and time
    // Only check for active bookings (Pending or Accepted status)
    // Normalize the incoming date to start of day in UTC to match stored dates
    const bookingDate = new Date(date);
    const year = bookingDate.getUTCFullYear();
    const month = bookingDate.getUTCMonth();
    const day = bookingDate.getUTCDate();
    
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    
    console.log(`[createBooking] Checking for conflicts: employee=${employee}, date=${date}, time=${time}`);
    console.log(`[createBooking] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    const existingBooking = await Booking.findOne({
      employee: employee,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      time: time,
      status: { $in: ["Pending", "Accepted"] }
    });

    if (existingBooking) {
      console.log(`[createBooking] Conflict found: Existing booking at ${existingBooking.date} ${existingBooking.time}`);
      return res.status(409).json({ 
        message: "This time slot is already booked. Please choose another time.",
        conflict: true,
        existingBooking: {
          date: existingBooking.date,
          time: existingBooking.time,
          status: existingBooking.status
        }
      });
    }
    
    console.log(`[createBooking] No conflict found, proceeding with booking creation`);

    // Use the already normalized date (startOfDay) for storing the booking
    const normalizedDate = startOfDay;

    // Create a new booking
    const booking = new Booking({
      employee,
      customer,
      date: normalizedDate,
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
      .populate("customer", "name email image address1 phone rating");

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

// Get booked time slots for an employee on a specific date
exports.getBookedSlots = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    if (!employeeId || !date) {
      return res.status(400).json({ 
        message: "Employee ID and date are required" 
      });
    }

    // Parse the date string (YYYY-MM-DD format) and create date range for the day
    // Use UTC to avoid timezone issues
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        message: "Invalid date format. Expected YYYY-MM-DD" 
      });
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2], 10);

    // Create date range for the entire day in UTC
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    // Find all bookings for this employee on this date with active status
    // Only include bookings that are Pending or Accepted (not Cancelled or Rejected)
    const bookings = await Booking.find({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ["Pending", "Accepted"] }
    }).select("time status date");

    console.log(`[getBookedSlots] Query params: employeeId=${employeeId}, date=${date}`);
    console.log(`[getBookedSlots] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    console.log(`[getBookedSlots] Found ${bookings.length} bookings`);

    // Extract time slots (remove duplicates if any)
    const bookedSlotsMap = new Map();
    bookings.forEach(booking => {
      console.log(`[getBookedSlots] Booking found: time=${booking.time}, date=${booking.date}, status=${booking.status}`);
      if (!bookedSlotsMap.has(booking.time)) {
        bookedSlotsMap.set(booking.time, {
          time: booking.time,
          status: booking.status
        });
      }
    });

    const bookedSlots = Array.from(bookedSlotsMap.values());
    console.log(`[getBookedSlots] Returning ${bookedSlots.length} unique booked slots:`, bookedSlots);

    res.status(200).json({ 
      bookedSlots,
      date: date,
      count: bookedSlots.length
    });
  } catch (error) {
    console.error('Error in getBookedSlots:', error);
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
