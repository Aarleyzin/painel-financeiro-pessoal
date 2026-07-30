import { app } from "./app.js";
import { env } from "./config/env.js";
import { bootstrapOwnerUser } from "./lib/bootstrap-owner.js";

(async () => {
  try {
    await bootstrapOwnerUser();
  } catch (error) {
    console.error("Failed to seed owner user", error);
  }

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
})();
