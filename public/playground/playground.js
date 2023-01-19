import { StacheElement, ObservableObject } from "//unpkg.com/can@6/core.mjs";

import '../jql-input.js';
import '../navbar.js';

import "./json-viewer.js";

export class Playground extends StacheElement {
    static view = `
        <nav-bar name:from="this.name" />

        <div class="container">
            <div class="row mt-3">
                <jql-input jql:to="jql" />
                {{# if(this.json)}}
                <json-viewer json:from="json" />
                {{/ if}}
            </div>
            
        </div>
    `;

    static props = {
        name: "JIRA Playground",
        json: {
            async(resolve) {
                if (this.jql) {
                    return this.jiraHelpers.fetchAllJiraIssuesWithJQLAndFetchAllChangelogUsingNamedFields({
                        jql: this.jql,
                        fields: ["summary",
                            "Start date",
                            "Due date",
                            "Issue Type",
                            "Fix versions",
                            "Story Points",
                            "Confidence",
                            "Product Target Release"], // LABELS_KEY, STATUS_KEY ],
                        expand: ["changelog"]
                    }).then(res => {
                        resolve(JSON.stringify({ result: res.issues }, null, 2));
                    });
                }
            }
        }

    }

}

customElements.define('playground-app', Playground);