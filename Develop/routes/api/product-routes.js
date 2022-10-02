const router = require('express').Router();
// const { response } = require('express');
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async(req, res) => {
  try {
      const productData = await Product.findAll({
          include: [{ model: Category, as: 'category' }, { model: Tag, through: ProductTag, as: 'tagIds' }]
      });
      res.status(200).json(productData);
  } catch (err) {
      res.status(500).json(err);
  }
});


// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const productDataById = await Product.findByPk(req.params.id, {
      // be sure to include its associated Category and Tag data
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Tag,
          through: ProductTag,
          as: 'tagIds'
        }
      ]
    });
    if (!productDataById) {
      res.status(404).json({ message: 'Move along - nothing to see here' });
      return;
    }
    res.status(200).json(productDataById);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {

  Product.create(req.body)
    .then((product) => {
      // If there are product tags, create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(201).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
  });

router.put('/:id', async (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
    try {
        const deleteProduct = await Product.destroy({
            where: {
                id: req.params.id,
            },
        });
        if (!deleteProduct) {
            res.status(404).json({ message: "No product found with that id!" });
            return;
        }

        res.status(200).json(deleteProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
