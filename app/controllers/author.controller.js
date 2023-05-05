const ApiError = require("../api-error");
const AuthorService = require("../services/author.service");
const BookService = require("../services/book.service");
const { client } = require("../utils/mongodb.util");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name cannot be empty!"));
    }

    try {
        const authorService = new AuthorService(MongoDB.client);
        const document = await authorService.create(req.body);
        if (!document) {
            return next(new ApiError(404, "Author not found"));
        }
        return res.send({ message: "Author was created successfully" })
    } catch (error) {
        return next(new ApiError(500, "An error occurred while creating the author"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const authorService = new AuthorService(MongoDB.client);
        documents = await authorService.find({});
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving authors"))
    }

    return res.send(documents);
}

exports.findOne = async (req, res, next) => {
    try {
        const authorService = new AuthorService(MongoDB.client);
        const document = await authorService.findById(req.params.id);
        if (!document) {
            return next(404, "Author not found");
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Error retrieving author with id = ${req.params.id}`))
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    const authorService = new AuthorService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);
    const author = await authorService.findById(req.params.id);
    const books = await bookService.findByAuthor(author);

    try {
        const document = await authorService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Author not found"));
        }
        const updated_author = await authorService.findById(req.params.id);
        books.forEach(async (book) => {
            book.author = updated_author;
            await bookService.update(book._id, book);
        });
        return res.send({ message: "Author is updated successfully!" })
    } catch (error) {
        return next(new ApiError(500, `Error updating author with id = ${req.params.id}`))
    }

};

exports.delete = async (req, res, next) => {
    try {
        const authorService = new AuthorService(MongoDB.client);
        const document = await authorService.delete(req.params.id);
        if (!document) {
            return next(404, "Author not found");
        }
        return res.send({ message: "Author was deleted successfully" })
    } catch (error) {
        return next(new ApiError(500, "Could not delete author with id = ", req.params.id))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const authorService = new AuthorService(MongoDB.client);
        const deletedCount = await authorService.deleteAll();
        return res.send({ message: `${deletedCount} authors were deleted successfully` });
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving favorite authors"))
    }
};
