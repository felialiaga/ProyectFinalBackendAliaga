import { passportCall } from "../middlewares/passportCall.js";
import BaseRouter from "./BaseRouter.js";
import usersController from "../controllers/users.controller.js";



class SessionsRouter extends BaseRouter {

    init() {

        this.get("/current",["PUBLIC"],usersController.current);
        this.post('/register', ['PUBLIC'], passportCall('register'), usersController.registerUser);
        this.post("/login",["PUBLIC"],passportCall("login"),usersController.loginUser)

    }
}

const sessionsRouter = new SessionsRouter();


export default sessionsRouter.getRouter();