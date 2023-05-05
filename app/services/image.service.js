const { ObjectId } = require("mongodb");

class ImageService {
    constructor(client) {
        this.Image = client.db().collection("images");
    }
    extractImageData(payload) {
        const image = {
            name: payload.name,
        };
        Object.keys(image).forEach(
            (key) => image[key] === undefined && delete image[key]
        );
        return image;
    }

    async create(payload) {
        const image = this.extractImageData(payload);
        const result = await this.Image.findOneAndUpdate(image, { $set: {} }, { returnDocument: "after", upsert: true });
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Image.find(filter);
        return await cursor.sort({ name: 1 }).toArray();
    }

    async findByName(name) {
        return await this.find({ name: name });
    }

    async findById(id) {
        return await this.Image.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const update = this.extractImageData(payload);
        const result = await this.Image.findOneAndUpdate(filter, { $set: update }, { returnDocument: "after" });
        return result.value;
    }

    async delete(id) {
        const result = await this.Image.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
        return result.value;
    }

    async deleteAll() {
        const result = await this.Image.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ImageService; 