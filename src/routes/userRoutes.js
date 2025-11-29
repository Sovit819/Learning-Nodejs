import express from "express";
import { createUser, getAllUsers, getUserById, updateUser, softDeleteUser, hardDeleteUser } from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/Authentication.js";
import { isAdmin, isAdminOrManagerOrSelf } from "../middlewares/Authorization.js";

const router = express.Router();

router.route("/create-user").post(createUser);

router.route("/users").get(verifyJWT, getAllUsers);
router.route("/get-user/:_id").get(verifyJWT, getUserById);
router.route("/update-user/:_id").put(verifyJWT, updateUser);
router.route("/delete-user/:_id").delete(verifyJWT, isAdminOrManagerOrSelf, softDeleteUser);
router.route("/purge-user/:_id").delete(verifyJWT, isAdmin, hardDeleteUser);

export default router;