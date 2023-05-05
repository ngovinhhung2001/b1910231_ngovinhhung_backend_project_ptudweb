const express = require("express");
const users = require("../controllers/user.controller");

const router = express.Router();

router.route("/user").get(users.authentication);

router.route("/signout").post(users.signOut)

router.route("/signin").post(users.signIn);

router.route("/signup").post(users.signUp);

router.route("/").get(users.findAll).delete(users.deleteAll);

router.route("/:id").get(users.findOne).put(users.update).delete(users.delete);

router.route("/secured/:id").get(users.findSecuredOne)



module.exports = router;