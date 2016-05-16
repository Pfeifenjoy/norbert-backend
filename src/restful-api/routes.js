/**
 * @author Tobias Dorra, Arwed Mett, Simon Oswald
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
import recommendations from "./recommendations";
import search from "./search";
import information from "./information";


//Set up the Session and all the API-Routes 
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
    router.use("/recommendations", auth, recommendations);
    router.use("/search", auth, search);
    router.use("/information", auth, information);
    
    return router;
}
