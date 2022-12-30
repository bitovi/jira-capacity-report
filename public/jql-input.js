// https://yumbrands.atlassian.net/issues/?filter=10897
import { StacheElement, type, ObservableObject, stache } from "//unpkg.com/can@6/core.mjs";
import { getBusinessDatesCount } from "./status-helpers.js";
import { estimateExtraPoints } from "./confidence.js";



export class JQLInput extends StacheElement {
	static view = `
        <div class="mb-3">
            <label class="form-label">JQL to retrieve initiatives and epics:</label>
            <input class="form-control" value:bind='this.jql'/>
        </div>
    `

	static props = {
		jql: {
			value({ lastSet, listenTo, resolve }) {
				if (lastSet.value) {
					resolve(lastSet.value)
				} else {
					resolve(new URL(window.location).searchParams.get("jql") || "issueType = Epic");
				}

				listenTo(lastSet, (value) => {
					const newUrl = new URL(window.location);
					newUrl.searchParams.set("jql", value)
					history.pushState({}, '', newUrl);
					resolve(value);
				})
			}
		},
	}
}

customElements.define("jql-input", JQLInput);