import { ProductsService } from "../services/repositories.js";


const getProducts = async(req,res) => {
    const p = req.params.p || 1;
    const result = await ProductsService.getProducts(p);
    if(!result){
        return res.sendServerError("Couldn't get products");
    }
    return res.sendPayload(result);
}

const createProduct = async(req,res) => {
    if(req.user.role=="admin"){
        const data = req.body;
        const newProduct = {
            title: data.title,
            description: data.description,
            stock: data.stock || 1,
            category: data.category,
            code: data.code,
            price: data.price,
            status: data.status || true
        }

        const exists = await ProductsService.searchProduct({ code: newProduct.code });

        if (exists) {
            const updatedProduct = await ProductsService.updateProduct(exists[0]._id, { stock: (exists[0].stock + newProduct.stock) });
            if(!updatedProduct){
                return res.sendServerError("Couldn't create product");
            }
            return res.sendPayload(updatedProduct);
        } else {
            const product = await ProductsService.createProduct(newProduct);
            if (!product) {
                return res.sendServerError("Couldn't create product");
            }
            return res.sendPayload(product);
        }
    }
    return res.sendUnauthorized('Unauthorized');
}

const updateProduct = async(req,res) => {
    if(req.user.role=="admin"){
        const pid = req.params.pid;
        const data = req.body;
        const update = {
            title: data.title,
            description: data.description,
            stock: data.stock,
            category: data.category,
            code: data.code,
            price: data.price,
            status: data.status
        }

        const updatedProduct = await ProductsService.updateProduct(pid, update);

        if (!updatedProduct) {
            return res.sendServerError("Couldn't update product");
        }
        return res.sendPayload(updateProduct);
    }
    return res.sendUnauthorized('Unauthorized');
}

const deleteProduct = async(req,res) => {
    if(req.user.role=="admin"){
        const pid = req.params.pid;

        const result = await ProductsService.deleteProduct(pid);

        if(!result){
            return res.sendServerError("Couldn't delete product");
        }
        return res.sendPayload(result);
    }
    return res.sendUnauthorized('Unauthorized');
}

export default {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct
}