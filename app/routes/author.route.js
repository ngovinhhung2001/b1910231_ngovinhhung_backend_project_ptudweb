const express = require("express");
const authors = require("../controllers/author.controller");

const router = express.Router();

router.route("/").get(authors.findAll).post(authors.create).delete(authors.deleteAll);

router.route("/:id").get(authors.findOne).put(authors.update).delete(authors.delete);

module.exports = router;