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

    const methods = route.methods.toString().padEnd(8);
    const url = `"http://localhost:${process.env.PORT}${route.path}"`;
    const admin = route.middlewares.includes("isAdmin")
      ? "admin".padEnd(7)
      : "".padEnd(7);

    return result + `${methods}${admin}${url}`;
  });
  routes.unshift("# Routes");
  const finalString = routes.join("\n") + "\n";
  fs.writeFile("routes.md", finalString, (err) => {
    if (err) throw err;
  });
};
