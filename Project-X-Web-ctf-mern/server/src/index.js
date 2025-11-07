const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MONGO_URI, PORT } = require('./config');
const ctfRoutes = require('./routes/ctf');

(async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Mongo connected');
  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use('/api/ctf', ctfRoutes);
  app.get('/', (req,res)=>res.json({ok:true}));
  app.listen(PORT, ()=>console.log(`🚀 Server running on port ${PORT}`));
})();
