const { ObjectId } = require("mongodb");

class BorrowedBookService {
    constructor(client) {
        this.BorrowedBook = client.db().collection("borrowedbooks");
    }
    extractBorrowedBookData(payload) {
        const borrowedBook = {
            user: payload.user,
            books: payload.books,
            status: payload.status,
            borrowed_date: payload.borrowed_date,
            duo_date: payload.duo_date
        };
        Object.keys(borrowedBook).forEach(
            (key) => borrowedBook[key] === undefined && delete borrowedBook[key]
        );
        return borrowedBook;
    }

    async create(payload) {
        const borrowedBook = this.extractBorrowedBookData(payload);
        const result = await this.BorrowedBook.findOneAndUpdate(borrowedBook, { $set: { status: borrowedBook.status = 0 } }, { returnDocument: "after", upsert: true });
        return result.value;
    }

    async find(filter) {
        const cursor = await this.BorrowedBook.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({ name: { $regex: new RegExp(name), $option: "i" } });
    }

    async findById(id) {
        return await this.BorrowedBook.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const update = this.extractBorrowedBookData(payload);
        const result = await this.BorrowedBook.findOneAndUpdate(filter, { $set: update }, { returnDocument: "after" });
        return result.value;
    }

    async delete(id) {
        const result = await this.BorrowedBook.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
        return result.value;
    }

    async deleteAll() {
        const result = await this.BorrowedBook.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = BorrowedBookService; 