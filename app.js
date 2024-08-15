const express = require("express");
const path = require("path");
require("dotenv").config();
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");
const sanitizeHtml = require("sanitize-html");
const app = express();

const mongoConnection = require("./connection.js");
const { User, Blog } = require("./models/users.js");
const passportConfig = require("./utility/passport");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_DB_URL }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

mongoConnection();

app.get("/", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
  const sanitizedBlogs = blogs.map((blog) => ({
    ...blog.toObject(),
    content: sanitizeHtml(blog.content, { allowedTags: [] }),
  }));
  res.render("index", { blogs: sanitizedBlogs, user: req.user });
});

app.get("/blogs", async (req, res) => {
  const blogs = await Blog.find().populate("userId").sort({ createdAt: -1 });
  const sanitizedBlogs = blogs.map((blog) => ({
    ...blog.toObject(),
    content: sanitizeHtml(blog.content, { allowedTags: [] }),
  }));
  res.render("blogs", { blogs: sanitizedBlogs });
});

app.get("/my-blogs", async (req, res) => {
  const { id } = req.user;
  const blogs = await Blog.find({ userId: id }).sort({ createdAt: -1 });
  const sanitizedBlogs = blogs.map((blog) => ({
    ...blog.toObject(),
    content: sanitizeHtml(blog.content, { allowedTags: [] }),
  }));
  res.render("my-blogs", { blogs: sanitizedBlogs });
});

app.get("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate("userId");
  const category = blog.category;
  const relatedblogs = await Blog.find({
    category: category,
    _id: { $ne: id },
  }).populate("userId");

  const sanitizedBlogs = relatedblogs.map((relatedblog) => ({
    ...relatedblog.toObject(),
    content: sanitizeHtml(relatedblog.content, { allowedTags: [] }),
  }));

  res.render("singleBlog", { blog, relatedblogs: sanitizedBlogs });
});

app.post("/blogs", async (req, res) => {
  const { title, category, image, content } = req.body;
  try {
    const newBlog = new Blog({
      userId: req.user._id,
      title,
      category,
      image,
      content,
    });
    await newBlog.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { blogs: newBlog },
    });

    req.flash("success_msg", "Blog is Uploaded Successfully");
    res.redirect("/blogs");
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Error Uploading Blog");
    res.status(500).redirect("/create-blog");
  }
});

app.get("/blogs/edit/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  res.render("edit", { blog });
});

app.delete("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  await Blog.deleteOne({ _id: id });
  res.redirect("/my-blogs");
});

app.patch("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  const { title, category, image, content } = req.body;
  try {
    await Blog.findByIdAndUpdate(id, {
      $set: {
        title,
        category,
        image,
        content,
      },
    });
    req.flash("success_msg", "Blog is updated Successfully");
    res.redirect("/my-blogs");
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Error updating Blog");
    res.status(500).redirect(`/blogs/edit/${id}`);
  }
});

app.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/blogs");
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const newUser = new User({ ...req.body });
    await newUser.save();
    req.flash("success_msg", "You are now registered and can log in");
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Error registering new user.");
    res.status(500).redirect("/register");
  }
});

app.get("/create-blog", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("create-blog");
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on localhost:${process.env.PORT}`);
});
