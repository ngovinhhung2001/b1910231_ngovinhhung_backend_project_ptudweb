const ApiError = require("../api-error");
const BookService = require("../services/book.service");
const PublisherService = require("../services/publisher.service");
const AuthorService = require("../services/author.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name cannot be empty!"));
    } else if (!req.body?.author) {
        return next(new ApiError(400, "Author cannot be empty!"));
    } else if (!req.body?.publisher) {
        return next(new ApiError(400, "Publisher cannot be empty!"));
    } else if (!req.body?.quantity) {
        return next(new ApiError(400, "Quantity cannot be empty!"));
    }

    try {
        const bookService = new BookService(MongoDB.client);
        const publisherService = new PublisherService(MongoDB.client);
        const authorService = new AuthorService(MongoDB.client);

        const publisher = await publisherService.findByName(res.body?.name);
        const author = await authorService.findByName(res.body?.name);

        if (publisher.length == 0) {
            const temp = await publisherService.create(req.body?.publisher);
            req.body.publisher = temp;
        }
        if (author.length == 0) {
            const temp = await authorService.create(req.body?.author);
            req.body.author = temp;
        }

        req.body.quantity = parseInt(req.body.quantity);
        req.body.temp_quantity = parseInt(req.body.temp_quantity);

        const document = await bookService.create(req.body);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was created successfully" })
    } catch (error) {
        return next(new ApiError(500, "An error occurred while creating the book"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const bookService = new BookService(MongoDB.client);
        documents = await bookService.find({});
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving books"))
    }

    return res.send(documents);
}

exports.findOne = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Error retrieving book with id = ${req.params.id}`))
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const publisherService = new PublisherService(MongoDB.client);
        const authorService = new AuthorService(MongoDB.client);

        const bookService = new BookService(MongoDB.client);
        const book = await bookService.findById(req.params.id);

        const publisher = await publisherService.findByName(book.publisher.name);
        const author = await authorService.findByName(book.author.name);

        req.body.publisher = publisher[0];
        req.body.author = author[0];
        const document = await bookService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was updated successfully" })
    } catch (error) {
        return next(new ApiError(500, `Error updating book with id = ${req.params.id}`))
    }

};

exports.delete = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was deleted successfully" })
    } catch (error) {
        return next(new ApiError(500, "Could not delete book with id = ", req.params.id))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const deletedCount = await bookService.deleteAll();
        return res.send({ message: `${deletedCount} books were deleted successfully` });
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving favorite books"))
    }
};

exports.search = async (req, res, next) => {
    let documents = [];

    try {
        const bookService = new BookService(MongoDB.client);
        documents = await bookService.findBySimilarName(req.body?.name);
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving books"))
    }

    return res.send(documents);
}

exports.findAllFavorite = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const documents = await bookService.findFavorite();
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving favorite books"))
    }
};