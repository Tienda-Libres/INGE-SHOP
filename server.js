const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURACIÓN DE VARIABLES DINÁMICAS ---
// Render llenará process.env.MONGO_URI automáticamente con lo que pusimos en su panel.
// Si no existe (estás en tu PC), usará la base de datos local.
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tienda_db';
const PORT = process.env.PORT || 10000;

// --- CONEXIÓN A MONGODB ---
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Conexión exitosa a MongoDB"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Esquema del Producto
const productoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    existencias: Number,
    categoria: String,
    imagen: String 
});

const Producto = mongoose.model('Producto', productoSchema);

// --- RUTAS API ---

// RUTA PARA CLIENTES
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find({});
        res.status(200).json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
});

// RUTA PARA TI (ADMIN)
app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json({ mensaje: "Producto guardado con éxito" });
    } catch (error) {
        res.status(400).json({ mensaje: "Error al guardar producto" });
    }
});

// RUTA PARA EDITAR (ACTUALIZAR)
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!actualizado) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        console.log("✅ Producto actualizado:", actualizado.nombre);
        res.status(200).json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar:", error);
        res.status(500).json({ mensaje: "Error al actualizar", error: error.message });
    }
});

// RUTA PARA ELIMINAR
app.delete('/api/productos/:id', async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
});

// --- ENCENDER SERVIDOR ---
// IMPORTANTE: Agregamos '0.0.0.0' para que Render pueda encontrar el servicio externamente
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo y escuchando en el puerto ${PORT}`);
});