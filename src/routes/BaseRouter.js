import { Router } from "express";
import { passportCall } from "../middlewares/passportCall.js";
import { executePolicies } from "../middlewares/policies.js";


export default class BaseRouter {

    constructor() {
        this.router = Router();
        this.init();
    }

    init() {}

    getRouter() {
        return this.router;
    }


    get(path, policies, ...callbacks) {
        if(!policies||!Array.isArray(policies)) throw new Error('Policies required for endpoint '+path);
        this.router.get(path, this.generateCustomResponses, passportCall('current'), executePolicies(policies) ,this.applyCallbacks(callbacks) )
    }

    post(path, policies, ...callbacks) {
        if(!policies||!Array.isArray(policies)) throw new Error('Policies required for endpoint '+path);
        this.router.post(path, this.generateCustomResponses, passportCall('current'), executePolicies(policies) , this.applyCallbacks(callbacks) )
    }

    put(path, policies, ...callbacks) {
        if(!policies||!Array.isArray(policies)) throw new Error('Policies required for endpoint '+path);
        this.router.put(path, this.generateCustomResponses, passportCall('current'), executePolicies(policies) , this.applyCallbacks(callbacks) )
    }

    delete(path, policies, ...callbacks) {
        if(!policies||!Array.isArray(policies)) throw new Error('Policies required for endpoint '+path);
        this.router.delete(path, this.generateCustomResponses, passportCall('current'), executePolicies(policies) , this.applyCallbacks(callbacks) )
    }

    generateCustomResponses(req, res, next) {
        res.sendSuccess = (message) => res.status(200).send({status: 'success', message});
        res.sendBadRequest = (reason) => res.status(400).send({status: 'error', error: reason});
        res.sendUnauthorized = (reason) => res.status(401).send({status: 'error', error: reason || 'Unauthorized'});
        res.sendServerError = (message) => res.status(500).send({status:"error", error:message})
        res.sendPayload = (payload) => res.status(200).send({status:"success", payload});
        next();
    }


    applyCallbacks(callbacks) {
        return callbacks.map((callback) => async(...params) => {
            try {
                await callback.apply(this, params);
            } catch (error) {
                params[1].status(500).send({status: 'error', error: `${error.name} ${error.message}` })
            }
        } )
    }

}