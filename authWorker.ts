import { handleRefreshTokens } from "./src/helpers/auth";

handleRefreshTokens().then(() => {
  postMessage(true);
});
// silent auth refresh
// runs every hour
setInterval(() => {
  console.log("refreshing auth tokens......");
  handleRefreshTokens().then(() => {
    // pass for now
  });
}, 60 * 60 * 1000);
