import { CartsService, UsersService, ProductsService, TicketsService } from "../services/repositories.js";

const createCart = async(req, res) => {

    const cart = {
        products: []
    };
    const result = await CartsService.createCart(cart);
    if (!result) {
        return res.sendServerError('Server error');
    }
    res.sendPayload(result);

};

const addProduct = async(req, res) => {

    if(req.user.cart==req.params.cid){
        const {cid,pid} = req.params;

        const qty = req.body.quantity || 1;

        const cart = await CartsService.getCart(cid);

        if (!cart) {
            return res.sendBadRequest("Cart doesn't exist");
        }

        const product = await ProductsService.getProductById(pid);

        if (!product) {
            return res.sendBadRequest("Product doesn't exist");
        }

        let productExists = false;

        cart.products.forEach(pr => {
            if (pr.product._id == pid) {
                pr.quantity += qty;
                productExists = true;
            }
        });

        if (!productExists) {

            cart.products.push({ product: product._id, quantity: qty });

            const result = await CartsService.updateCart(cid, { products: cart.products });

            if (!result) {
                return res.sendServerError("Error adding the product");
            }

            return res.sendPayload(result);

        } else {

            const result = await CartsService.updateCart(cid, { $set: { products: cart.products } });

            if (!result) {
                return res.sendServerError("Error adding the product");
            } else {
                return res.sendPayload(result);
            }
        }
    }

    return res.sendUnauthorized('Unauthorized');

}

const getCart = async(req,res) => {
    if(req.user.cart==req.params.cid){
        const cid  = req.params.cid;
        const result = await CartsService.getCart(cid);        
        if (!result) {
            return res.sendServerError("Couldn't find cart");
        }
        return res.sendPayload(result);
    }
    return res.sendUnauthorized('Unauthorized');
}

const updateCart = async(req,res) => {
    if(req.user.cart==req.params.cid){
        const cid  = req.params.cid;
        const result = await CartsService.updateCart(cid, { products: data });
        if (!result) {
            return res.sendServerError("Couldn't update cart");
        }
        return res.sendPayload(result);
    }
    return res.sendUnauthorized('Unauthorized');
}

const updateProductQuantity = async(req,res) => {
    if(req.user.cart==req.params.cid){
        const {cid, pid, qty}  = req.params;
        const cart = await CartsService.getCart(cid);
        if (!cart) {
            return res.sendServerError("Couln't find cart");
        }
        const product = await ProductsService.getProductById(pid);
        if (!product) {
            return res.sendBadRequest("Product doesn't exist");
        }
        cart.products.forEach(pr => {
            if (pr.product._id == pid) {
                pr.quantity = qty;
            }
        });
        const result = await CartsService.updateCart(cid, cart);
        if (!result) {
            return res.sendServerError("Couldn't update cart");
        }
        return res.sendPayload(result);
    }
    return res.sendUnauthorized('Unauthorized');
}

const deleteAProduct = async(req,res) => {
    if(req.user.cart==req.params.cid){
        const {cid, pid}  = req.params;
        const cart = await CartsService.getCart(cid);
        if (!cart) {
            return res.sendServerError("Couldn't find cart");
        }
        const product = await ProductsService.getProductById(pid);
        if (!product) {
            return res.sendBadRequest("Product doesn't exist");
        }
        for (let i = cart.products.length - 1; i >= 0; i--) {
            if (cart.products[i].product._id == pid) {
                cart.products.splice(i, 1);
            }
        }
        const result = await CartsService.updateCart(cid, cart);
        if (!result) {
            return res.sendServerError("Couldn't delete product from cart");
        }
        return res.sendPayload(result);
    }
    return res.sendUnauthorized('Unauthorized');
}

const deleteAllProducts = async(req,res) => {
    if(req.user.cart==req.params.cid){
        const cid  = req.params.cid;
        const cart = await CartsService.getCart(cid);
        if (!cart) {
            return res.sendServerError("Couldn't find cart");
        }
        const result = await CartsService.updateCart(cid, { $set: { products: [] } });
        if (!result) {
            return res.sendServerError("Couldn't delete all products");
        }
        return res.sendPayload(result);
    }
    return res.sendUnauthorized('Unauthorized');
}

const createTicket = async(req, res) => {
    const cid = req.params.cid;

    if(req.user.cart == cid){
        const cart = await CartsService.getCart(cid);        
        if (!cart) {
            return res.sendServerError("Couldn't find cart");
        }
        const user = await UsersService.getUser(req.user.id);
        if(!user){
            return res.sendServerError("Couldn't find user");
        }

        const itemList = [];
        let amount = 0;
        const missingItems = cart.products.map((pr)=>{
            if(pr.quantity>pr.product.stock){
                return pr.product.title;
            }
            itemList.push({id:pr.product._id, stock:pr.quantity, price:pr.product.price});
            amount+=pr.product.price*pr.quantity;
        }).filter(item => item != null);
    
        if(missingItems.length){
            return res.sendPayload(missingItems);
        }else{
            const ticket = {
                amount:amount,
                purchaser:user.email
            }

            const ticketResult = await TicketsService.createTicket(ticket);
            
            if(!ticketResult){
                res.sendServerError("Couldn't create ticket");
            }
            itemList.forEach(async(pr)=>{
                const product = await ProductsService.getProductById(pr.id);
                const productResult = await ProductsService.updateProduct(pr.id, {stock:product.stock-=pr.stock});
                if(!productResult){
                    res.sendServerError("Couldn't create ticket");
                }
            });
            const cartResult = await CartsService.updateCart(cid, { $set: { products: [] } });
            if(!cartResult){
                res.sendServerError("Couldn't create ticket");
            }
            return res.sendPayload(ticketResult);
        }
    }
    return res.sendUnauthorized('Unauthorized');
}


export default {
    addProduct,
    createCart,
    createTicket,
    deleteAllProducts,
    deleteAProduct,
    getCart,
    updateCart,
    updateProductQuantity
}