import 'dotenv/config';
import app from './app';
import { initDb } from './app';

const port = process.env.PORT || 5000;

// Initialize database
initDb();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
