// https://yumbrands.atlassian.net/issues/?filter=10897
import { StacheElement, type, ObservableObject, stache } from "//unpkg.com/can@6/core.mjs";
import { getBusinessDatesCount } from "./status-helpers.js";
import { estimateExtraPoints } from "./confidence.js";



export class JQLInput extends StacheElement {
	static view = `
        <div>
            <label class="form-label" area-describedby="jql-help">
				JQL Query
			</label>
            <input class="form-control" value:bind='this.jql'/>
			<small id="jql-help" class="form-text text-muted">
				Use
				<a href="https://www.atlassian.com/blog/jira-software/jql-the-most-flexible-way-to-search-jira-14#:~:text=JQL%20stands%20for%20Jira%20Query,project%20managers%2C%20and%20business%20users." target="_blank">
				JQL</a> to filter issues (defaults to "issuetype = Epic")
			</small>
        </div>
    `

	static props = {
		jql: {
			value({ lastSet, listenTo, resolve }) {
				if (lastSet.value) {
					resolve(lastSet.value)
				} else {
					resolve(new URL(window.location).searchParams.get("jql") || "issuetype = Epic");
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