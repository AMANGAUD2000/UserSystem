const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const process = require("process");
const JWT_SECRET_KEY = "PROJECT";


var users = [
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
  {
    id: "1643874356926",
    name: "Sid G",
    email: "sid@sid",
    profilePicture: undefined,
    mobile: "7777",
    password: "$2b$10$FungcEIysYYsR6J6zRPake.2UMmw3pTozN7bKO7XX0FUKaZVH3rx6",
  },
];



app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



const middleWareForJWT = (req, res, next) => {
  if (req.headers.authorization) {
    console.log(req.headers.authorization);
    try {
      const decoded = JWT.verify(req.headers.authorization, JWT_SECRET_KEY);
      console.log(decoded);
      req.id = decoded?.id;
      next();
    } catch (error) {
      console.log("IN ERROR", error);
      res.status(401).json({ message: "MESSAGE USER NOT VALID" });
      return;
    }
  } else {
    res.status(401).json({ message: "NO JWT TOKEN" });
    return;
  }
};



app.get("/", middleWareForJWT, (req, res) => {
  res.render("index.ejs");
});


app.get("/users", middleWareForJWT, (req, res) => {
  res.json(
    users.filter((user) => {
      if (user.id != req.id) {
        delete user.password;
        return user;
      }
      return;
    })
  );
});


app.post("/login", async (req, res) => {
  const user = users.find((u) => u.email === req.body.email);
  if (user == null) {
    res.status(400).send("cannot find user");
    return;
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = JWT.sign(
        {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          profilePicture: user.profilePicture,
        },
        JWT_SECRET_KEY
      );
      res.status(200).json({ massage: "Success", token });
    } else {
      res.send("This is not allowed Password");
    }
  } catch {
    res.status(500).send();
  }
});

app
  .route("/user")
  .get(middleWareForJWT, (req, res) => {
    let id = req.id;
    let userFetched = users.find((user) => id === user.id);
    if (userFetched) {
      console.log("USER EXIST");
    } else {
      console.log("USER DEOS EXIST");
    }
    delete userFetched.password;
    res.status(200).json(userFetched);
  })
  .put(middleWareForJWT, (req, res) => {
    const { name, mobile, profilePicture } = req.body;
    let index = users.findIndex((user) => user.id === req.id);
    if (index < 0) {
      res.status(404).send("User not found");
    }
    if (name) users[index].name = name;
    if (mobile) users[index].mobile = mobile;
    if (profilePicture) users[index].profilePicture = profilePicture;
    const token = JWT.sign(
      {
        id: users[index].id,
        name: users[index].name,
        mobile: users[index].mobile,
        email: users[index].email,
        profilePicture: users[index].profilePicture,
      },
      JWT_SECRET_KEY
    );
    res.status(200).json({
      success: true,
      token,
    });
  });



app.put("/user/password", middleWareForJWT, async (req, res) => {
  let index = users.findIndex((user) => user.id === req.id);
  if (index < 0) {
    res.status(404).send("User not found");
  }
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users[index].password = hashedPassword;
  const token = JWT.sign(
    {
      id: users[index].id,
      name: users[index].name,
      mobile: users[index].mobile,
      email: users[index].email,
      profilePicture: users[index].profilePicture,
    },
    JWT_SECRET_KEY
  );
  res.status(200).json({
    success: true,
    token,
  });
});



app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      profilePicture: req.body.profilePicture,
      mobile: req.body.mobile,
      password: hashedPassword,
    };
    users.push(user);
    let message = user;
    const token = JWT.sign(
      {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      JWT_SECRET_KEY
    );
    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    
    console.log(err);
  }
  console.log(users);
});

app.listen(3000);
