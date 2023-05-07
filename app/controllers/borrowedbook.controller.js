const ApiError = require("../api-error");
const BookService = require("../services/book.service");
const BorrowedBookService = require("../services/borrowedbook.service");
const UserService = require("../services/user.service");
const { client } = require("../utils/mongodb.util");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    if (!req.body?.user) {
        return next(new ApiError(400, "Thông tin người dùng không được trống!"));
    } else if (!req.body?.books) {
        return next(new ApiError(400, "Sách không được trống!"));
    }

    const borrowedBookService = new BorrowedBookService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);
    try {
        const user = await userService.findSecuredById(req.body?.user._id);
        const books = [];
        for (let book of req.body.books) {
            var book_in_dbs = await bookService.findById(book._id);
            if (!book_in_dbs) {
                return next(new ApiError(400, "Không thể tìm thấy sách"));
            }

            var book_in_books = await bookService.extractBookData(book_in_dbs);
            book_in_books.quantity = book.quantity;
            book_in_books.temp_quantity = undefined;
            if (book_in_dbs.quantity - book_in_dbs.temp_quantity < book_in_books.quantity) {
                return next(new ApiError(450, "Số lượng sách trong kho không đủ"));
            }

            books.push(book_in_books);
        }

        req.body.user = user;
        req.body.books = books;

        const document = await borrowedBookService.create(req.body);

        if (!document) {
            return next(new ApiError(404, "Không tạo được phiếu mượn"));
        }

        for (var book of books) {
            var new_book = await bookService.findById(book._id);
            if (!new_book) {
                return next(new ApiError(400, "Không thể tìm thấy sách"));
            }

            new_book.temp_quantity += book.quantity;
            await bookService.update(book._id, new_book);
        }

        return res.send({ message: "Phiếu mượn đã được tạo thành công" });

    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo phiếu mượn"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const borrowedBookService = new BorrowedBookService(MongoDB.client);
        documents = await borrowedBookService.find({});
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm phiếu mượn"))
    }

    return res.send(documents);
}

exports.findOne = async (req, res, next) => {
    try {
        const borrowedbookService = new BorrowedBookService(MongoDB.client);
        const document = await borrowedbookService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Phiếu mượn không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Đã xảy ra lỗi khi tìm phiếu mượn với id = ${req.params.id}`))
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Dữ liệu để cập nhật không được trống"));
    }

    const borrowedBookService = new BorrowedBookService(MongoDB.client);
    const userService = new UserService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);

    try {
        const user = await userService.findById(req.body?.user._id);
        const books = [];

        for (let book of req.body.books) {
            var book_in_dbs = await bookService.findById(book._id);

            var book_in_books = await bookService.extractBookData(book_in_dbs);
            book_in_books.quantity = book.quantity;
            book_in_books.temp_quantity = undefined;

            if (book_in_dbs.quantity < book_in_books.quantity) {
                return next(new ApiError(400, "Số lượng sách trong kho không đủ"));
            }
            books.push(book_in_books);
        }

        req.body.user = user;
        req.body.books = books;
        const document = await borrowedBookService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Cập nhật phiếu mượn không thành công"));
        }
        return res.send({ message: "Cập nhật phiếu mượn thành công" })
    } catch (error) {
        return next(new ApiError(500, `Đã xảy ra lỗi khi cập nhật phiếu mượn với id = ${req.params.id}`))
    }

};

exports.delete = async (req, res, next) => {
    try {
        const borrowedbookService = new BorrowedBookService(MongoDB.client);
        const document = await borrowedbookService.delete(req.params.id);
        if (!document) {
            return next(404, "Xóa phiếu mượn không thành công");
        }
        return res.send({ message: "Xóa phiếu mượn thành công" })
    } catch (error) {
        return next(new ApiError(500, `Đã xảy ra lỗi khi xóa phiếu mượn với id = ${req.params.id}`))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const borrowedbookService = new BorrowedBookService(MongoDB.client);
        const deletedCount = await borrowedbookService.deleteAll();
        return res.send({ message: `Đã xóa ${deletedCount} phiếu mượn thành công` });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa phiếu mượn"))
    }
};

exports.approve = async (req, res, next) => {
    try {
        const borrowedbookService = new BorrowedBookService(MongoDB.client);
        const borrowedbook = await borrowedbookService.findById(req.params.id);
        const bookService = new BookService(MongoDB.client);

        if (!borrowedbook) {
            return next(new ApiError(400, "Phiếu mượn không tồn tại!"))
        } else {
            req.body = borrowedbook;
            req.body.status = 1;
            for (var book of borrowedbook.books) {
                var new_book = await bookService.findById(book._id);
                if (!new_book) {
                    return next(new ApiError(400, "Không thể tìm thấy sách"));
                    // return res.send(book);
                }

                new_book.quantity -= book.quantity;
                new_book.temp_quantity -= book.quantity;
                await bookService.update(book._id, new_book);
            }
            await borrowedbookService.update(req.params.id, req.body);
        }
        return res.send({ message: "Đã duyệt phiếu mượn thành công!" });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi duyệt phiếu mượn"))
    }
}

exports.return = async (req, res, next) => {
    try {
        const borrowedbookService = new BorrowedBookService(MongoDB.client);
        const borrowedbook = await borrowedbookService.findById(req.params.id);
        const bookService = new BookService(MongoDB.client);

        if (!borrowedbook) {
            return next(new ApiError(400, "Phiếu mượn không tồn tại!"))
        } else {
            req.body = borrowedbook;
            req.body.status = -1;
            for (var book of borrowedbook.books) {
                var new_book = await bookService.findById(book._id);
                if (!new_book) {
                    return next(new ApiError(400, "Không thể tìm thấy sách"));
                    // return res.send(book);
                }

                new_book.quantity += book.quantity;
                await bookService.update(book._id, new_book);
            }
            await borrowedbookService.update(req.params.id, req.body);
        }
        return res.send({ message: "Đã duyệt phiếu mượn thành công!" });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi duyệt phiếu mượn"))
    }
}