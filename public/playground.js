import { Playground } from "./playground/playground.js";
import { route, RoutePushstate } from "//unpkg.com/can@6/core.mjs";
// import qaMetrics from "./qa-metrics/main.js";

export default async function main(jiraHelpers) {

    mainElement.textContent = "Checking for Jira Access Token";

    if (!jiraHelpers.hasValidAccessToken()) {
        await sleep(100);
        mainElement.textContent = "Getting access token";
        const accessToken = await jiraHelpers.getAccessToken();
        return;
    }

    const accessToken = await jiraHelpers.getAccessToken();

    mainElement.textContent = "Got Access Token";
    mainElement.style.display = "none";

    const playground = new Playground();
    playground.jiraHelpers = jiraHelpers;
    playground.mode = "TEAMS";
    document.body.append(playground);

}


function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}