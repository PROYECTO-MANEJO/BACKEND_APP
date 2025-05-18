const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());

const adminRoutes = require('./routes/administrador.routes.js');


app.use('/api/admin', adminRoutes);

// Ruta base para probar servidor
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
