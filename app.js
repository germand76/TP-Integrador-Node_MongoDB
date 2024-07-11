const express = require('express');
const app = express();
const morgan = require('morgan');
const connectDB = require('./db');
const Producto = require('./schemaProduct');

process.loadEnvFile()
const port = process.env.PORT ?? 3000;

connectDB();

app.use(express.json());
app.use(morgan('dev'));

//Ruta principal
app.get('/', (req, res) => 
{
    res.json('Bienvenido a la API de Supermercado!');
});


//Obtener todos los productos de la BD 
app.get('/productos/all', async (req, res) => 
{
  try 
  {
    const productos = await Producto.find();
    productos.length
      ? res.json(productos)
      : res.status(404).json({ message: 'No se encontraron productos' });
  } 
  catch (error) {
    res.status(500).send('Error al buscar los productos');
  }
});


//Devolver un producto por su codigo
app.get("/productos/:codigo", async (req, res) => 
{
  const { codigo } = req.params;
  if (isNaN(codigo)) {
    return res.status(400).json({ message: "Solo se permite un valor numérico para buscar" });
  }
  const producto = await Producto.findOne({ codigo: Number(codigo) });
  producto
    ? res.json(producto)
    : res.status(404).json({ message: "El producto especificado no ha sido encontrado" });
});


//Devolver el/los producto/s que coincide/n con el nombre especificado (coincidencia parcial)
app.get("/productos/nombre/:nombre", async (req, res) => 
{
  const { nombre } = req.params;

  try 
  {
    const productos = await Producto.find({ nombre: { $regex: nombre, $options: 'i' } });
    productos.length
      ? res.json(productos)
      : res.status(404).json({ message: 'Producto no encontrado' });
  } 
  catch (error) {
    res.status(500).send('Error al buscar productos');
  }
});


//Agregar un producto a la BD
app.post('/productos', async (req, res) => 
{
  const { codigo, nombre, precio, categoria } = req.body;

  try 
  {
    // Verificar si el producto ya existe
    const productoExistente = await Producto.findOne({ codigo: Number(codigo) });
    if (productoExistente) 
      return res.status(400).json({ message: 'El producto ya se encuentra almacenado en la base de datos' });
    
    // Crear y guardar el nuevo producto
    const nuevoProducto = new Producto({ codigo, nombre, precio, categoria });
    await nuevoProducto.save();
    res.status(201).json({ message: 'Producto agregado a la base de datos', producto: nuevoProducto });
  } 
  catch (error) {
    res.status(500).json({ message: 'No se pudo añadir el producto' });
  }
});


// Actualizar el precio de un producto por su código
app.patch('/productos/:codigo', async (req, res) => 
{
  const { codigo } = req.params;
  const { precio } = req.body;

  if (!precio || isNaN(precio)) {
    return res.status(400).json({ message: 'Precio no válido' });
  }

  try 
  {
    const producto = await Producto.findOneAndUpdate(
      { codigo: Number(codigo) },
      { $set: { precio: Number(precio) } },
      { new: true }
    );
    producto
      ? res.json({ message: 'El precio del producto ha sido modificado exitosamente', producto })
      : res.status(404).json({ message: 'Producto no encontrado' });
  } 
  catch (error) {
    res.status(500).send('Error al actualizar el producto');
  }
});


//Borrar un producto de la BD
app.delete("/productos/:codigo", async (req, res) => 
{
  const { codigo } = req.params;
  try 
  {
    const resultado = await Producto.deleteOne({ codigo: Number(codigo) });
    resultado
      ? res.json({ message: "El producto ha sido borrado exitosamente" })
      : res
          .status(404)
          .json({ message: "No se encontro el producto para borrar" });
  } 
  catch (error) {
    return res.status(500).json({ message: "Error al borrar el producto" });
  }
});


//Middleware para manejar rutas no definidas
app.use((req, res, next) => 
{
  res.status(404).json({ message: 'Ruta no encontrada. La ruta especificada no existe' });
});

//Middleware para manejo de errores
app.use((err, req, res, next) => 
{
  console.error(err.stack);
  res.status(500).json({ message: 'Error del servidor' });
});

  //Inicializamos el servidor
app.listen(port, () => 
{
    console.log(`Example app listening on http://localhost:${port}`)
})