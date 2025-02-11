const express = require("express");
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getEmployeeBookings,
  cancelBooking,
  getBookingById,
  getAllBookings,
  updateBooking,updateBookingStatus,invoice,
} = require("../controllers/bookingController");

// POST: Create a booking
router.post("/", createBooking);
router.put("/bookings/:bookingId/status", updateBookingStatus);

// GET: Get bookings for a customer
router.get("/customer/:customerId", getCustomerBookings);

// GET: Get bookings for an employee
router.get("/employee/:employeeId", getEmployeeBookings);

// GET: Get booking by ID
router.get("/:bookingId", getBookingById);
router.put("/booking/:bookingId", updateBooking);

// GET: Get all bookings
router.get("/", getAllBookings);

// PATCH: Cancel a booking
router.patch("/cancel/:bookingId", cancelBooking);
router.get("/download-receipt/:bookingId",invoice);


module.exports = router;
