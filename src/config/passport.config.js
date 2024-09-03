import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";

import { UsersService } from "../services/repositories.js";
import AuthService from "../services/AuthService.js";
import config from '../config/config.js';



const initializePassportConfig = () =>{

    passport.use('register', new LocalStrategy({usernameField:'email',passReqToCallback:true},async (req,email,password,done)=>{
        
        const {firstName,lastName,birthDate, cart} = req.body;

        if(!firstName||!lastName || !cart){
            return done(null,false,{message:'Incomplete values'});
        }
        const user = await usersService.getUserByEmail(email);
        if(user){
            return done(null,false,{message:"User already exists"});
        };
        let parsedDate;
        if(birthDate){
            parsedDate = new Date(birthDate).toISOString();
        }
        const authService = new AuthService()
        const hashedPassword = await authService.hashPassword(password);
        const newUser = {
            firstName,
            lastName,
            email,
            birthDate:parsedDate,
            password:hashedPassword,
            cart
        }
        const result = await usersService.createUser(newUser);
        return done(null,result);
    }))


    passport.use('login', new LocalStrategy({usernameField:'email'},async(email,password,done)=>{
        const user = await usersService.getUserByEmail(email);
        if(!user){
            return done(null,false,{message:"Incorrect credentials"});
        };
        const authService = new AuthService();
        const isValidPassword = await authService.validatePassword(password,user.password);
        if(!isValidPassword){
            return done(null,false,{message:"Incorrect credentials"});
        }

        return done(null,user);
    }))


    passport.use('current', new JWTStrategy({

        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor])
    
    }, async(payload, done) => {
        console.log(payload);
        return done(null, payload);
    }))
    

}


function cookieExtractor(req) {
    return req?.cookies?.[process.env.JWT_COOKIE];
}

export default initializePassportConfig;