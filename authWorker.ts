import { getActiveUser } from "./src/helpers/user";
import { KryptikFetch } from "./src/kryptikFetch";

async function handleRefreshTokens() {
  console.log("refreshing auth tokens......");
  try {
    const res = await KryptikFetch("/api/auth/refresh", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      throw new Error("Bad request");
    }
  } catch (e) {
    // console.warn("Unable to refresh auth token. May need to log in again.");
  }
}
handleRefreshTokens().then(() => {
  postMessage(true);
});
// silent auth refresh
// runs every twelve minutes
setInterval(() => {
  handleRefreshTokens().then(() => {
    getActiveUser().then((u) => {
      console.log("User refreshed!");
    });
  });
}, 32400000);
