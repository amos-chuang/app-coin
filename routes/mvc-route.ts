import * as Express from "express";
const router = Express.Router();

class MVCRoute {
    public static process(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        let controllerName: string = req.params.controller_name;
        let actionName: string = req.params.action_name;
        console.log("");
        console.log("original_controllerName = " + controllerName);
        console.log("original_actionName = " + actionName);
        if (!controllerName) {
            controllerName = "index";
        }
        if (!actionName) {
            actionName = "index";
        }
        console.log("controllerName = " + controllerName);
        console.log("actionName = " + actionName);
        console.log("");
        const ControllerClass = require("../controllers/" + controllerName + "-controller");
        const controller = new ControllerClass.Controller(req, res);
        controller[actionName]();
    }
}

router.all("/", (req, res, next) => {
    MVCRoute.process(req, res, next);
});

router.all("/:controller_name/", (req, res, next) => {
    MVCRoute.process(req, res, next);
});

router.all("/:controller_name/:action_name", (req, res, next) => {
    MVCRoute.process(req, res, next);
});

module.exports = router;
