/**
 * @author Tobias Dorra
 */
import { Router } from "express";
import users from "./users";
import session from "express-session";
import config from "../utils/configuration";
import connect from "connect-mongo";

const MongoStore = connect(session);



export function initialRoutes(core) {
    // create router
    const router = new Router;

    router.use(session({
        secret: config.get("db.secret") || "dsjfsoapfdjasöoidfjadjfö",
        store: new MongoStore({db: core.db}),
        proxy: true,
        resave: true,
        saveUninitialized: true
    }))
    // add the routes
    router.use('/users', users);
    
    return router;
}
