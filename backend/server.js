require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/databse');

const PORT = Number(process.env.PORT) || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
