import EventRegistration from "../models/EventRegistration.js";

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      user: req.user._id,
      status: { $in: ["paid", "checked_in"] },
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

export const getRegistrationStatus = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await EventRegistration.findOne({
      user: req.user._id,
      event: eventId,
      status: { $in: ["paid", "checked_in"] },
    });

    if (!registration) {
      return res.status(200).json({ registered: false });
    }

    res.status(200).json({
      registered: true,
      status: registration.status, 
    });
  } catch (error) {
    console.error("Registration status error:", error);
    res.status(500).json({
      message: "Failed to check registration status",
    });
  }
};
