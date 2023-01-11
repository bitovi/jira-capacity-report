// https://yumbrands.atlassian.net/issues/?filter=10897
import { StacheElement, type, ObservableObject, stache } from "//unpkg.com/can@6/core.mjs";
import { getStartOfNextQuarter, getEndOfNextQuarter, getStartOfThisQuarter, getEndOfThisQuarter } from "./dateUtils.js";


const serializeDate = (date) => {
    return date.toISOString().split('T')[0];
}


export class DateRange extends StacheElement {
    static view = `
        <div class="row mb-3">
            <div class="col-md-6">
                <label class="form-label">Start Date</label>
                <input class="form-control mb-3" value:bind="this.startDate" type='date'/>
            </div>
            <div class="col-md-6">
                <label class="form-label">End Date</label>
                <input class="form-control mb-3" value:bind="this.endDate" type='date'/>
            </div>
        </div>
    `

    static props = {
        startDate: {
            value({ lastSet, listenTo, resolve }) {
                if (lastSet.value) {
                    console.log(lastSet.value);
                    resolve(lastSet.value)
                } else {
                    resolve(
                        new URL(window.location).searchParams.get("startDate") || serializeDate(getStartOfThisQuarter(new Date()))
                    )
                }

                listenTo(lastSet, (value) => {
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set("startDate", value)
                    history.pushState({}, '', newUrl);
                    resolve(value);

                });

            }
        },
        endDate: {
            value({ lastSet, listenTo, resolve }) {
                if (lastSet.value) {
                    resolve(lastSet.value)
                } else {
                    resolve(
                        new URL(window.location).searchParams.get("endDate") || serializeDate(getEndOfThisQuarter(new Date()))
                    )
                }

                listenTo(lastSet, (value) => {
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set("endDate", value)
                    history.pushState({}, '', newUrl);
                    resolve(value);
                });
            }
        },

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

customElements.define("date-range", DateRange);