import Morgan from "koa-morgan";

export default Morgan(":method :url :status :response-time ms");
