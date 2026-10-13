const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Every handler here operates strictly on the authenticated user.
// Previously these accepted an arbitrary :id, which let any logged-in
// user read, update or delete any other account.
//
// Support for acting on a *different* user id can be reintroduced later
// behind an explicit admin guard (e.g. req.user.role === "admin").

// Return the signed-in user's profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update the signed-in user's profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const updates = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("Nothing to update. Provide a name or an email.");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

// Delete the signed-in user's account
const deleteMyAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
};