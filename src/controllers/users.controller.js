import jwt from "jsonwebtoken";

const registerUser = async(req, res) => {
    return res.sendSuccess("Registered succesfully");
}

const loginUser = async(req, res) => {
    if(req.user){
        const sessionUser = {
            name:`${req.user.first_name} ${req.user.last_name}`,
            cart:req.user.cart,
            role:req.user.role,
            id:req.user._id
        }

        try{
            const token = jwt.sign(sessionUser,process.env.JWT_SECRET,{expiresIn:"1d"});
            res.cookie(process.env.JWT_COOKIE, token);
        }catch(error){
            return res.sendBadRequest("Server error");
        }
        return res.sendSuccess("Logged in succesfully")
    }
}

const current = async(req,res) => {
    if(req.user){
        res.sendPayload(req.user);
    }else{
        res.sendUnauthorized("You have to log in");
    }
}


export default {
    current,
    loginUser,
    registerUser
}