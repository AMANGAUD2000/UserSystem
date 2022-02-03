const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

const users = [
  {
    id: 1,
    name: "James",
    email: "james@gmail.com",
    mobile: "8888555522",
    profilePicture: "James.png",
    password: "$2b$10$M5ZuwZoIpcL1836E0H4xoOoO8uR8.e5RQgQycx4W7ty92hK7vjqgy",
  },
  {
    id: 2,
    name: "Tony",
    email: "tony@gmail.com",
    mobile: "8898555522",
    profilePicture: "Tony.png",
    password: "$2b$10$Nt7ZM/vgAQxpfkmoSOwiVu0V2TjGYzndkKHiJQrxhKRnOyy400xNK",
  },
];

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const user = user.find((user) => user.name === req.body.name);
  if (user == null) {
    return res.status(400).send("cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("Success");
    } else {
      res.send("This is not allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      profilePicture: req.body.profilePicture,
      password: hashedPassword,
    };
    users.push(user);
    let message = user;
    res.status(200).json({
      success: true,
      message,
    });
    // res.redirect("/login");
  } catch {
    // res.redirect("/register");
  }
  console.log(users);
});

app.listen(3000);
