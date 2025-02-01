const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const unzipper = require("unzipper");

const app = express();

const dotenv = require("dotenv");

// Load the environment file based on the current environment
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.development" });
}

const PORT = process.env.PORT || 2105;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const carSchema = new mongoose.Schema({
  name: String,
  collectionNumber: String,
  year: Number,
  color: String,
  series: String,
  number: String,
  quantity: { type: Number, default: 0, min: 0 },
  type: { type: String, enum: ["Car", "Playset", "Others"], default: "Car" },
  subType: {
    type: String,
    enum: ["Car", "Bike", "Plane", "Monster Trucks", "Rigs", "Others"],
    default: "Car",
  },
  owned: { type: Boolean, default: false },
  missing: { type: Boolean, default: false },
  brand: { type: String, required: true, default: "Hot Wheels" },
  image: String,
});

const Car = mongoose.model("Car", carSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/cars", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || "name";
  const order = req.query.order || "asc";
  const skip = (page - 1) * limit;

  // Extract filter parameters
  const { type, subType, brand, owned, missing, query } = req.query;

  // Build the filter object
  const filter = {};
  if (type && type !== "All") filter.type = type;
  if (subType && subType !== "All") filter.subType = subType;
  if (brand && brand !== "All") filter.brand = brand;
  if (owned && owned !== "All") filter.owned = owned === "Yes";
  if (missing && missing !== "All") filter.missing = missing === "Yes";

  const searchConditions = [
    { name: { $regex: query, $options: "i" } },
    { series: { $regex: query, $options: "i" } },
    { color: { $regex: query, $options: "i" } },
    { number: { $regex: query, $options: "i" } },
    { type: { $regex: query, $options: "i" } },
    { subType: { $regex: query, $options: "i" } },
    { brand: { $regex: query, $options: "i" } },
  ];

  // Handle year separately (convert it to a string for regex matching)
  if (!isNaN(query)) {
    searchConditions.push({ year: { $eq: parseInt(query, 10) } });
  }

  // Add search query to the filter
  if (query) {
    filter.$or = searchConditions;
  }

  try {
    const cars = await Car.find(filter)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);
    const totalCars = await Car.countDocuments(filter);

    res.json({
      cars,
      totalPages: Math.ceil(totalCars / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cars/search", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || "name";
  const order = req.query.order || "asc";
  const skip = (page - 1) * limit;

  // Extract filter parameters
  const { type, subType, brand, owned, missing, query } = req.query;

  // Build the filter object
  const filter = {};
  if (type && type !== "All") filter.type = type;
  if (subType && subType !== "All") filter.subType = subType;
  if (brand && brand !== "All") filter.brand = brand;
  if (owned && owned !== "All") filter.owned = owned === "Yes";
  if (missing && missing !== "All") filter.missing = missing === "Yes";

  const searchConditions = [
    { name: { $regex: query, $options: "i" } },
    { series: { $regex: query, $options: "i" } },
    { color: { $regex: query, $options: "i" } },
    { number: { $regex: query, $options: "i" } },
    { type: { $regex: query, $options: "i" } },
    { subType: { $regex: query, $options: "i" } },
    { brand: { $regex: query, $options: "i" } },
  ];

  // Handle year separately (convert it to a string for regex matching)
  if (!isNaN(query)) {
    searchConditions.push({ year: { $eq: parseInt(query, 10) } });
  }

  // Add search query to the filter
  if (query) {
    filter.$or = searchConditions;
  }

  try {
    const cars = await Car.find(filter)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);
    const totalCars = await Car.countDocuments(filter);

    res.json({
      cars,
      totalPages: Math.ceil(totalCars / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error searching cars:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/cars", upload.single("image"), async (req, res) => {
  const newCar = new Car({
    ...req.body,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  });
  await newCar.save();
  res.json(newCar);
});

app.put("/api/cars/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { isImageRemoved } = req.body;

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Handle image removal
    if (isImageRemoved === "true" && car.image) {
      const imagePath = path.join(__dirname, "..", car.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
      }
      car.image = null; // Remove the image reference
    }

    // Handle new image upload
    if (req.file) {
      if (car.image) {
        const oldImagePath = path.join(__dirname, "..", car.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete the old image file
        }
      }
      car.image = `/uploads/${req.file.filename}`; // Update with the new image path
    }

    // Update other fields
    for (const key in req.body) {
      if (key !== "isImageRemoved" && key !== "image") {
        car[key] = req.body[key];
      }
    }

    await car.save();
    res.json(car);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/cars/:id", async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ message: "Car deleted" });
});

app.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Export endpoint
app.get("/api/export", async (req, res) => {
  try {
    // Export database
    const cars = await Car.find({});
    const dbData = JSON.stringify(cars, null, 2);

    // Create a temporary directory for the export
    const exportDir = path.join(__dirname, "export");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Write database data to a file
    const dbFilePath = path.join(exportDir, "cars.json");
    fs.writeFileSync(dbFilePath, dbData);

    // Copy images to the export directory
    const imagesDir = path.join(__dirname, "uploads");
    const exportImagesDir = path.join(exportDir, "uploads");
    if (fs.existsSync(imagesDir)) {
      fs.cpSync(imagesDir, exportImagesDir, { recursive: true });
    }

    // Create a zip file
    const zipFilePath = path.join(__dirname, "export.zip");
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      // Send the zip file as a response
      res.download(zipFilePath, "export.zip", (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        // Clean up the temporary export directory and zip file
        fs.rmSync(exportDir, { recursive: true, force: true });
        fs.rmSync(zipFilePath, { force: true });
      });
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);

    // Add cars.json and uploads folder to the zip file
    archive.file(dbFilePath, { name: "cars.json" });
    archive.directory(exportImagesDir, "uploads");

    archive.finalize();
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ message: "Error exporting data" });
  }
});

// Import endpoint
app.post("/api/import", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const importDir = path.join(__dirname, "import");

    // Extract the zip file
    await fs
      .createReadStream(filePath)
      .pipe(unzipper.Extract({ path: importDir }))
      .promise();

    // Read the database file
    const dbFilePath = path.join(importDir, "cars.json");
    const dbData = fs.readFileSync(dbFilePath, "utf8");
    const cars = JSON.parse(dbData);

    // Check for duplicates and insert new data
    for (const car of cars) {
      const existingCar = await Car.findOne({ name: car.name });
      if (!existingCar) {
        await Car.create(car);
      }
    }

    // Copy images to the uploads directory
    const importImagesDir = path.join(importDir, "uploads");
    const uploadsDir = path.join(__dirname, "uploads");
    if (fs.existsSync(importImagesDir)) {
      fs.cpSync(importImagesDir, uploadsDir, { recursive: true });
    }

    // Clean up the temporary import directory
    fs.rmSync(importDir, { recursive: true, force: true });

    res.json({ message: "Data imported successfully" });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ message: "Error importing data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
