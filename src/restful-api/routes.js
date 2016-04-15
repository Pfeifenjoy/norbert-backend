/**
 * @author Tobias Dorra
 */
import { Router } from "express";
import users from "./users";

// create router
const router = new Router;

// add the routes
router.use('/users', users);

module.exports = router;
