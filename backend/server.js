import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import walletRoutes from "./walletRoutes.js"; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🚀 HelpChain backend is running!");
});

// ✅ Add route mount point
app.use("/api", walletRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});