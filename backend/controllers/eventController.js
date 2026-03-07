import Event from "../models/Event.js";


export const getMyEvents = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const events = await Event.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("MY EVENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch admin events" });
  }
};


export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateEvent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your event" });
    }

    Object.assign(event, req.body);
    const updatedEvent = await event.save();

    res.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};
