const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} = require("../controllers/userController");

const router = express.Router();

// These routes act on the authenticated user only. They intentionally do
// NOT accept an :id parameter - the original implementation allowed any
// logged-in user to read, modify or delete any other account (IDOR).
// The :id routes below are kept only as an explicit 403 guard so that any
// stale client calling them fails closed instead of touching data.
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);
router.delete("/me", protect, deleteMyAccount);

router.all("/:id", protect, (req, res) => {
  res.status(403).json({
    success: false,
    message:
      "Accessing another user's record is not permitted. Use /api/users/me instead.",
  });
});

module.exports = router;