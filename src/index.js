const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const NGO = require("./mongoose.js"); // Updated model name
const port = process.env.PORT || 3030;
const connectDB = require("./db.js");

//connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));

// Render signup and login pages
app.get("/signup", (req, res) => {
  res.render("signup"); // Signup page form should match new fields
});
app.get("/", (req, res) => {
  res.render("login");
});

// Signup Route for NGOs
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    contactPerson: req.body.contactPerson,
    mobileNumber: req.body.mobileNumber,
    email: req.body.email,
    updated12A: req.body.updated12A === "on", // Checkbox or boolean
    updated80G: req.body.updated80G === "on", // Checkbox or boolean
    address: req.body.address,
    password: req.body.password,
  };

  try {
    const existingNGO = await NGO.findOne({ email: req.body.email });

    if (existingNGO) {
      return res.send("NGO already registered with this email");
    } else {
      const newNGO = new NGO(data);
      await newNGO.save();

      return res.status(201).render("home", {
        naming: req.body.name, // Display NGO name after successful signup
      });
    }
  } catch (e) {
    console.error(e);
    return res.send("Error occurred during signup");
  }
});

// Login Route for NGOs
app.post("/login", async (req, res) => {
  try {
    const ngo = await NGO.findOne({ email: req.body.email });

    if (!ngo) {
      return res.send("No NGO found with this email");
    }

    const isMatch = await ngo.comparePassword(req.body.password);

    if (isMatch) {
      return res.status(201).render("home", { naming: ngo.name }); // Display NGO name after successful login
    } else {
      return res.send("Incorrect password");
    }
  } catch (e) {
    console.error(e);
    return res.send("Error occurred during login");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
