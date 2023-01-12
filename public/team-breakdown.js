import { StacheElement, type, ObservableObject, stache } from "//unpkg.com/can@6/core.mjs";

export class TeamBreakdown extends StacheElement {
    static view = `
        <h3>Work for {{this.name}}</h3>
        <h4>Dev Work (total = {{this.sum}})</h4>

        <table class="table table-striped-columns">
            <thead>
                <tr><th>Features</th><th>Jira Link</th><th>Working Days</th></tr>
            </thead>
            <tbody>
                {{# for(epic of this.issues)}}
                    <tr>
                        <td>{{epic.Summary}}</td>
                        <td>
                            <a href="{{epic.url}}">{{epic["Issue key"]}}</a>
                        </td>
                        <td>
                            {{epic.workingDaysInPeriod}}
                        </td>
                    </tr>
                {{/ for}}
            </tbody>
        </table>
    `

    static props = {
        name: {
            type: type.check(String),
        },
        sum: {
            type: type.maybe(Number),
        },
        issues: {
            type: type.maybe(Array),
        }
    }
}

customElements.define("team-breakdown", TeamBreakdown);