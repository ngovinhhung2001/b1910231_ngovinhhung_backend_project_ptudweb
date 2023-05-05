const express = require("express");
const borrowedbooks = require("../controllers/borrowedbook.controller");

const router = express.Router();

router.route("/").get(borrowedbooks.findAll).post(borrowedbooks.create).delete(borrowedbooks.deleteAll);

router.route("/:id").get(borrowedbooks.findOne).put(borrowedbooks.update).delete(borrowedbooks.delete);

router.route("/approve/:id").post(borrowedbooks.approve);

router.route("/return/:id").post(borrowedbooks.return);

module.exports = router;