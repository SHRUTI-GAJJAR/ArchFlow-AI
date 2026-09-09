const { testAI } = require("../services/aiService");

const testAIConnection = async (req, res) => {
  try {
    const result = await testAI();

    res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    console.error("AI connection error:", error);

    res.status(500).json({
      success: false,
      message: "AI connection failed",
      error: error.message,
    });
  }
};

module.exports = {
  testAIConnection,
};