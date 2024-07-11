const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
{
    codigo: { type: Number, required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: String,
});

const Producto = mongoose.model('Producto', productoSchema);
module.exports = Producto;