import { Express } from "express";
import listEndpoints from "express-list-endpoints";
import fs from "fs";

export const endpointList = (app: Express) => {
  let category = "";

  const routes = listEndpoints(app).map((route) => {
    let result = "";

    const routeCategory = route.path.split("/")[1];
    if (routeCategory !== category) {
      result = `\n## ${
        routeCategory.charAt(0).toUpperCase() + routeCategory.slice(1)
      }\n\n`;
      category = routeCategory;
    }

    const url = `"http://localhost:${process.env.PORT}${route.path}"`;
    return result + `${route.methods.toString().padEnd(8)}${url}`;
  });
  routes.unshift("# Routes");
  const finalStrig = routes.join("\n") + "\n";
  fs.writeFile("routes.md", finalStrig, (err) => {
    if (err) throw err;
  });
};
