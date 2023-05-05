const { ObjectId } = require("mongodb");

class AuthorService {
    constructor(client) {
        this.Author = client.db().collection("authors");
    }
    extractAuthorData(payload) {
        const author = {
            name: payload.name,
        };
        Object.keys(author).forEach(
            (key) => author[key] === undefined && delete author[key]
        );
        return author;
    }

    async create(payload) {
        const author = this.extractAuthorData(payload);
        const result = await this.Author.findOneAndUpdate(author, { $set: {} }, { returnDocument: "after", upsert: true });
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Author.find(filter);
        return await cursor.sort({ name: 1 }).toArray();
    }

    async findByName(name) {
        return await this.find({ name: name });
    }

    async findById(id) {
        return await this.Author.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const update = this.extractAuthorData(payload);
        const result = await this.Author.findOneAndUpdate(filter, { $set: update }, { returnDocument: "after" });
        return result.value;
    }

    async delete(id) {
        const result = await this.Author.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
        return result.value;
    }

    async deleteAll() {
        const result = await this.Author.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = AuthorService; 