const Hotel = require("../models/Hotel");

const getHotels = async (req, res) => {
  try {
    const { city, location, minPrice, maxPrice, query } = req.query;
    const filter = {};

    if (city) filter.city = { $regex: city, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (query) filter.name = { $regex: query, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("rooms");
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createHotel = async (req, res) => {
  try {
    const { name, location, city, country, description, price, rating, image, amenities, rooms, coordinates } = req.body;

    if (!name || !location || !city || !price) {
      return res.status(400).json({ message: "Name, location, city and price are required" });
    }

    const hotel = await Hotel.create({
      name,
      location,
      city,
      country,
      description,
      price,
      rating,
      image,
      amenities,
      coordinates,
      rooms
    });

    res.status(201).json({ message: "Hotel created", hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Hotel updated", hotel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Hotel deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHotels, getHotelById, createHotel, updateHotel, deleteHotel };
