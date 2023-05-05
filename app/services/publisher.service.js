const { ObjectId } = require("mongodb");

class PublisherService {
    constructor(client) {
        this.Publisher = client.db().collection("publishers");
    }
    extractPublisherData(payload) {
        const publisher = {
            name: payload.name,
        };
        Object.keys(publisher).forEach(
            (key) => publisher[key] === undefined && delete publisher[key]
        );
        return publisher;
    }

    async create(payload) {
        const publisher = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(publisher, { $set: {} }, { returnDocument: "after", upsert: true });
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Publisher.find(filter);
        return await cursor.sort({ name: 1 }).toArray();
    }

    async findByName(name) {
        return await this.find({ name: name });
    }

    async findById(id) {
        return await this.Publisher.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const update = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(filter, { $set: update }, { returnDocument: "after" });
        return result.value;
    }

    async delete(id) {
        const result = await this.Publisher.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
        return result.value;
    }

    async deleteAll() {
        const result = await this.Publisher.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = PublisherService; 