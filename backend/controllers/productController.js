const Product = require('../models/Product');


const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, countInStock } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Product name and price are required' });
        }
        const product = new Product({
            name,
            description: description || '',
            price: Number(price),
            category: category || 'General',
            image: image || '',
            countInStock: Number(countInStock) || 0
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message || 'Product creation failed' });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, category, countInStock } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name !== undefined ? name : product.name;
            product.price = price !== undefined ? Number(price) : product.price;
            product.description = description !== undefined ? description : product.description;
            product.image = image !== undefined ? image : product.image;
            product.category = category !== undefined ? category : product.category;
            if (countInStock !== undefined) {
                product.countInStock = Number(countInStock);
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update Product Error:', error.message);
        res.status(400).json({ message: error.message || 'Server Error' });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne(); 
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = { 
    getProducts, 
    createProduct, 
    getProductById, 
    deleteProduct,
    updateProduct 
};