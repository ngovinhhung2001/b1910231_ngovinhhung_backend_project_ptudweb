const { ObjectId } = require("mongodb");

class BookService {
    constructor(client) {
        this.Book = client.db().collection("books");
    }
    extractBookData(payload) {
        const book = {
            _id: payload._id,
            name: payload.name,
            author: payload.author,
            publisher: payload.publisher,
            quantity: payload.quantity,
            temp_quantity: payload.temp_quantity,
            favorite: payload.favorite,
            image: payload.image
        };
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }
    extractWithOutIDBookData(payload) {
        const book = {
            name: payload.name,
            author: payload.author,
            publisher: payload.publisher,
            quantity: payload.quantity,
            temp_quantity: payload.temp_quantity,
            favorite: payload.favorite,
            image: payload.image
        };
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }
    async create(payload) {
        const book = this.extractWithOutIDBookData(payload);
        const result = await this.Book.findOneAndUpdate(book, { $set: {} }, { returnDocument: "after", upsert: true });
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Book.find(filter);
        return await cursor.toArray();
    }

    async findByAuthor(author) {
        return await this.find({ author: author });
    }

    async findByPublisher(publisher) {
        return await this.find({ publisher: publisher });
    }

    async findBySimilarName(name) {
        return await this.find({ name: { $regex: name } });
    }

    async findById(id) {
        return await this.Book.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const update = this.extractWithOutIDBookData(payload);
        const result = await this.Book.findOneAndUpdate(filter, { $set: update }, { returnDocument: "after" });
        return result.value;
    }

    async delete(id) {
        const result = await this.Book.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
        return result.value;
    }

    async deleteAll() {
        const result = await this.Book.deleteMany({});
        return result.deletedCount;
    }

    async findFavorite() {
        const result = await this.find({ favorite: true });
        return result;
    }
}

module.exports = BookService; 