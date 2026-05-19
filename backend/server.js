require("dotenv").config();
require("dns").setDefaultResultOrder("ipv4first");
const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB();
