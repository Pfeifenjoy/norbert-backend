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
import files from "./files";
import notifications from "./notifications";


export function initialRoutes(core) {
    // create router
    const router = new Router;

    router.use(session({
        secret: config.get("db.secret") || "dsjfsoapfdjasöoidfjadjfö",
        store: new MongoStore({db: core.db}),
        proxy: true,
        resave: true,
        saveUninitialized: true
    }));

    // auth
    var auth = users.authenticate;

    // add the routes
    router.use('/users', users);
    router.use("/entries", auth, entries);
    router.use("/newsfeed", auth, newsfeed);
    router.use("/files", auth, files);
    router.use("/notifications", auth, notifications);
    
    return router;
}
