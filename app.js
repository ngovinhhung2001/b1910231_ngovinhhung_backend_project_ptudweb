const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const booksRouter = require("./app/routes/book.route");
const usersRouter = require("./app/routes/user.route");
const publishersRouter = require("./app/routes/publisher.route");
const authorsRouter = require("./app/routes/author.route");
const borrowedBooksRouter = require("./app/routes/borrowedbook.route");
const ApiError = require("./app/api-error");
const ImageService = require("./app/services/image.service");
const MongoDB = require("./app/utils/mongodb.util");

var multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
var upload = multer({ storage: storage });

app.use(cookieParser());
app.use(cors({ credentials: true, origin: ["http://localhost:8080"], allowedHeaders: ['Content-Type', 'X-Requested-With'] }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to library application." });
});

app.use("/api/books", booksRouter);
app.use("/api/users", usersRouter);
app.use("/api/publishers", publishersRouter);
app.use("/api/authors", authorsRouter);
app.use("/api/borrowedbooks", borrowedBooksRouter);

app.post('/api/images', upload.array('image', 10), async function (req, res, next) {
    const imageService = new ImageService(MongoDB.client);
    for (var i = 0; i < req.files.length; i++) {
        await imageService.create({ name: req.files[i].path.split('\\')[1] })
    }

    res.send({ message: 'Thành công' })
});

app.get('/api/images', async function (req, res, next) {
    let images = [];

    try {
        const imageService = new ImageService(MongoDB.client);
        images = await imageService.find({});
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving books"))
    }

    return res.send(images);
});

app.get('/api/images/:filename', function (req, res, next) {
    res.sendFile(__dirname + '/uploads/' + req.params.filename);
});

app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;
