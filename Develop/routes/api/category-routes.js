const router = require("express").Router();
// const { response } = require('express');
const { Category, Product } = require("../../models");

// Find all categories - working
router.get("/", async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [
        {
          model: Product,
          as: "products",
        },
      ],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Find one category by its id value - working
router.get("/:id", async (req, res) => {
  try {
    const categoryId = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
        },
      ],
    });
    if (!categoryId) {
      res
        .status(404)
        .json({ message: "Why are you still here - move the eff along" });
      return;
    }
    res.status(200).json(categoryId);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new category - not working
router.post("/", async (req, res) => {
  try {
    const newCategoryData = await Category.create(req.body);
    res.status(201).json(newCategoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update a specific category from its ID
router.put("/:id", async (req, res) => {
  try {
    const updateCategory = await Category.update(
      {
        category_name: req.body.category_name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (!updateCategory) {
      res.status(404).json({ message: "That category doesn't exist, nerd" });
      return;
    }
    res.status(200).json(updateCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a specific category from its ID
router.delete("/:id", async (req, res) => {
  try {
    const deleteCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteCategory) {
      res.status(404).json({ message: "That category still doesn't exist, nerd" });
      return;
    }
    res.status(200).json(deleteCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
