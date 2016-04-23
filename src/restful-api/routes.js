/**
 * @author Tobias Dorra, Arwed Mett
 */
import { Router } from "express";
import session from "express-session";
import config from "../utils/configuration";
import connect from "connect-mongo";
const MongoStore = connect(session);

//subroutes
import users from "./users";
import entries from "./entries";
import newsfeed from "./newsfeed";


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
    router.use("/entries", entries);
    router.use("/newsfeed", newsfeed);
    
    return router;
}
