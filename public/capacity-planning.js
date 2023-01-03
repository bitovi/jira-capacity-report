// https://yumbrands.atlassian.net/issues/?filter=10897
import { StacheElement, type, ObservableObject, stache } from "//unpkg.com/can@6/core.mjs";
import { getBusinessDatesCount } from "./status-helpers.js";
import { estimateExtraPoints } from "./confidence.js";
import { JQLInput } from "./jql-input.js";
import { CapacityChart } from "./capacity-chart.js"
import { getStartOfNextQuarter, getEndOfNextQuarter, getStartOfThisQuarter, getEndOfThisQuarter } from "./dateUtils.js";
import "./team-breakdown.js"

const DAY = 1000 * 60 * 60 * 24;

export class CapacityPlanning extends StacheElement {
	static view = `
		<h2>Capacity Planner</h2>
		
		<div class="container">
			<jql-input jql:to="jql" />
			<input class="form-control mb-3" valueAsDate:bind="this.startDate" type='date'/>
			<input class="form-control mb-3" valueAsDate:bind="this.endDate" type='date'/>
		</div>

		{{# if(this.workBreakdownSummary)}}

			<capacity-chart startDate:from="this.startDate" endDate:from="this.endDate" epicsBetweenDates:from="this.epicsBetweenDates" />

			{{# for(team of this.workBreakdownSummary)}}
				<team-breakdown name:from="team.name" sum:from="team.dev.sum" issues:from="team.dev.issues" />
			{{/}}
		{{/ if}}


		{{# if(this.epicsBetweenDates)}}
			{{# for(epic of this.epicsBetweenDates)}}
				<p>{{epic.Summary}} -  {{epic.workingDaysInPeriod}}</p>
			{{/ }}
		{{/}}
	`;

	static props = {
		jql: {
			type: String,
		},
		startDate: {
			type: type.convert(Date),
			default: getStartOfThisQuarter(new Date()),
		},
		endDate: {
			type: type.convert(Date),
			default: getEndOfThisQuarter(new Date()),
		},
		rawIssues: {
			async(resolve) {
				if (this.jql) {
					const serverInfoPromise = this.jiraHelpers.getServerInfo();

					const issuesPromise = this.jiraHelpers.fetchAllJiraIssuesWithJQLAndFetchAllChangelogUsingNamedFields({
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
					});

					return Promise.all([
						issuesPromise, serverInfoPromise
					]).then(([issues, serverInfo]) => {
						return addWorkingBusinessDays(toCVSFormat(issues, serverInfo));
					})

				}

				return Promise.resolve();
			}
		},
		get epicsBetweenDates() {
			if (this.rawIssues && this.startDate && this.endDate) {
				return this.rawIssues.filter((issue) => {
					if (issue["Issue Type"] === "Epic") {
						if (issue["Start date"] || issue["Due date"]) {
							const epicStart = issue["Start date"] ? new Date(issue["Start date"]).getTime() : 0;
							const epicEnd = issue["Due date"] ? new Date(issue["Due date"]).getTime() : Infinity;
							return this.startDate.getTime() <= epicEnd && epicStart <= this.endDate.getTime()
						}

					}
					return false;
				}).map((epic) => {
					let epicStart = epic["Start date"] ? new Date(epic["Start date"]) : this.startDate;
					let epicEnd = epic["Due date"] ? new Date(epic["Due date"]) : this.endDate;
					if (epicStart <= this.startDate) {
						epicStart = this.startDate
					}
					if (epicEnd >= this.endDate) {
						epicEnd = this.endDate
					}

					return {
						...epic,
						workingDaysInPeriod: getBusinessDatesCount(epicStart, epicEnd)
					}
				})
			}
		}
	}
	get teams() {
		if (!this.rawIssues) {
			return new Set();
		}
		return new Set(this.rawIssues.map(issue => issue["Project key"]));
	}
	get workBreakdownSummary() {
		if (this.epicsBetweenDates) {
			const teams = [...this.teams].map((team) => {
				return {
					name: team,
					dev: {
						issues: [],
						sum: 0
					},
					qa: {
						issues: [],
						sum: 0
					},
					uat: {
						issues: [],
						sum: 0
					}
				}
			})
			this.epicsBetweenDates.forEach((epic) => {
				// fix O(n^2) later
				const team = teams.find(team => epic["Project key"] === team.name);
				team[epic.workType].issues.push(epic);
				team[epic.workType].sum += epic.workingDaysInPeriod;
			});

			return teams;
		}
	}
}

const ISSUE_KEY = "Issue key";
const PRODUCT_TARGET_RELEASE_KEY = "Product Target Release";
const ISSUE_TYPE_KEY = "Issue Type";
const PARENT_LINK_KEY = "Parent Link";
const START_DATE_KEY = "Start date";
const DUE_DATE_KEY = "Due date";
const LABELS_KEY = "Labels";
const STATUS_KEY = "Status";
const FIX_VERSIONS_KEY = "Fix versions";

function addWorkingBusinessDays(issues) {
	return issues.map(issue => {
		let weightedEstimate = null;
		if (issue["Story Points"]) {
			if (issue["Confidence"]) {
				weightedEstimate = issue["Story Points"] + Math.round(estimateExtraPoints(issue["Story Points"], issue["Confidence"]));
			} else {
				weightedEstimate = issue["Story Points"];
			}
		}

		return {
			...issue,
			workType: isQAWork(issue) ? "qa" : (isPartnerReviewWork(issue) ? "uat" : "dev"),
			workingBusinessDays:
				issue["Due date"] && issue["Start date"] ?
					getBusinessDatesCount(new Date(issue["Start date"]), new Date(issue["Due date"])) : null,
			weightedEstimate: weightedEstimate
		};
	})
}

function filterByLabel(issues, label) {
	return issues.filter(
		issue => (issue[LABELS_KEY] || []).filter(
			l => l.includes(label)
		).length
	);
}
function filterQAWork(issues) {
	return filterByLabel(issues, "QA")
}
function isQAWork(issue) {
	return filterQAWork([issue]).length > 0
}
function filterPartnerReviewWork(issues) {
	return filterByLabel(issues, "UAT")
}
function isPartnerReviewWork(issue) {
	return filterPartnerReviewWork([issue]).length > 0
}

function addDays(date, days) {
	const copy = new Date(Number(date));
	copy.setDate(date.getDate() + days);
	return copy;
}

function toCVSFormat(issues, serverInfo) {
	return issues.map(issue => {
		return {
			...issue.fields,
			changelog: issue.changelog,
			"Project key": issue.key.replace(/-.*/, ""),
			[ISSUE_KEY]: issue.key,
			url: serverInfo.baseUrl + "/browse/" + issue.key,
			[ISSUE_TYPE_KEY]: issue.fields[ISSUE_TYPE_KEY].name,
			[PRODUCT_TARGET_RELEASE_KEY]: issue.fields[PRODUCT_TARGET_RELEASE_KEY]?.[0],
			[PARENT_LINK_KEY]: issue.fields[PARENT_LINK_KEY]?.data?.key,
			[STATUS_KEY]: issue.fields[STATUS_KEY]?.name
		}
	})
}

customElements.define("capacity-planning", CapacityPlanning);

