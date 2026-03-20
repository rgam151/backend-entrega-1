import express from "express";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./managers/productManager.js";
import mongoose from "mongoose";

mongoose.connect("mongodb://rgamboni151_db_user:eRSJfXbvC4U7x65F@ac-p50v2te-shard-00-00.avxkh9w.mongodb.net:27017,ac-p50v2te-shard-00-01.avxkh9w.mongodb.net:27017,ac-p50v2te-shard-00-02.avxkh9w.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-x97f6z-shard-0&authSource=admin&appName=Cluster1", {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log("Error Mongo:", err));

import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";

const app = express();
const productManager = new ProductManager();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  console.log("Cliente conectado");

  const products = await productManager.getProducts();
  socket.emit("updateProducts", products);

  socket.on("addProduct", async (product) => {
    await productManager.addProduct(product);
    const updatedProducts = await productManager.getProducts();
    io.emit("updateProducts", updatedProducts);
  });

  socket.on("deleteProduct", async (id) => {
    await productManager.deleteProduct(id);
    const updatedProducts = await productManager.getProducts();
    io.emit("updateProducts", updatedProducts);
  });
});

server.listen(8080, () => {
  console.log("Servidor escuchando en puerto 8080");
});
