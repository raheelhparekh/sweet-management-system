import asyncHandler from "express-async-handler";
import Sweet from "../models/Sweet.models.js";

const addSweet = asyncHandler(async (req, res) => {
  const { name, category, price, quantity } = req.body;

  // Validate required fields
  if (!name || !category || !price || quantity === undefined) {
    res.status(400);
    throw new Error("Please provide all required fields: name, category, price, quantity");
  }

  const sweetExists = await Sweet.findOne({ name });

  if (sweetExists) {
    res.status(400);
    throw new Error("Sweet with this name already exists");
  }

  const sweet = new Sweet({
    name,
    category,
    price,
    quantity,
  });

  const createdSweet = await sweet.save();
  res.status(201).json(createdSweet);
});

const getSweets = asyncHandler(async (req, res) => {
  const sweets = await Sweet.find({});
  res.json(sweets);
});

const searchSweets = asyncHandler(async (req, res) => {
  const { name, category, minPrice, maxPrice } = req.query;
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  const sweets = await Sweet.find(query);
  res.json(sweets);
});

const updateSweet = asyncHandler(async (req, res) => {
  const { name, category, price, quantity } = req.body;
  const sweet = await Sweet.findById(req.params.id);

  if (sweet) {
    sweet.name = name || sweet.name;
    sweet.category = category || sweet.category;
    sweet.price = price || sweet.price;
    sweet.quantity = quantity || sweet.quantity;

    const updatedSweet = await sweet.save();
    res.json(updatedSweet);
  } else {
    res.status(404);
    throw new Error("Sweet not found");
  }
});

const deleteSweet = asyncHandler(async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);

  if (sweet) {
    await Sweet.deleteOne({ _id: req.params.id });
    res.json({ message: "Sweet removed" });
  } else {
    res.status(404);
    throw new Error("Sweet not found");
  }
});

const purchaseSweet = asyncHandler(async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);

  if (sweet) {
    if (sweet.quantity > 0) {
      sweet.quantity -= 1;
      const updatedSweet = await sweet.save();
      res.json(updatedSweet);
    } else {
      res.status(400);
      throw new Error("Sweet is out of stock");
    }
  } else {
    res.status(404);
    throw new Error("Sweet not found");
  }
});

const restockSweet = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  
  // Validate quantity
  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be a positive number");
  }

  const sweet = await Sweet.findById(req.params.id);

  if (sweet) {
    sweet.quantity += Number(quantity);
    const updatedSweet = await sweet.save();
    res.json(updatedSweet);
  } else {
    res.status(404);
    throw new Error("Sweet not found");
  }
});

export {
  addSweet,
  getSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
};
