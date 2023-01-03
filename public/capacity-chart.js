import { StacheElement, type } from "//unpkg.com/can@6/core.mjs";
import './chart.js';

export class CapacityChartCanvas extends StacheElement {
    static view = `
        <canvas id="capacityChart" width="400" height="400"></canvas>
    `

    connected() {
        this.chartRef = this.querySelector('#capacityChart');
        if (this.chartData) {
            this.chart = new Chart(this.chartRef, this.chartData);
        }

        return () => {
            this.chart.destroy();
        }
    }

    static props = {
        chart: {
            type: type.maybe(Object),
        },
        chartRef: {
            type: type.maybe(Object),
        },
        chartData: {
            type: type.maybe(Object),
            set(newVal, oldVal) {
                if (this.chartRef) {
                    if (!oldVal) {
                        this.chart = new Chart(this.chartRef, newVal);
                    } else {
                        this.chart.data = newVal.data;
                        this.chart.update();
                    }
                }

                return newVal;
            }
        }
    }
}

export class CapacityChart extends StacheElement {

    static view = `
    <div class="container">
        <h2>Capacity Chart</h2>
        <div class="row">
            <div class="col-6">
                <capacity-chart-canvas chartData:from="chartData"></capacity-chart-canvas>
            </div>
        </div>
    </div>
    `;

    static props = {
        startDate: {
            type: type.convert(Date),
        },
        endDate: {
            type: type.convert(Date),
        },
        epicsBetweenDates: {
            type: type.maybe(Array),
            default: [],
        },
        labels: {
            get() {
                if (this.weekRanges) {
                    return this.weekRanges.map(week => {
                        return week.start.toLocaleDateString("en-US");
                    });
                }
            }
        },
        chartData: {
            value({ listenTo, lastSet, resolve }) {
                listenTo('labels', () => {
                    resolve(this.chartData);
                });
                listenTo('epicsByTeamAsDateRangePerWeekRange', () => {
                    resolve(this.chartData);
                });
            },
            get() {
                if (this.epicsByTeamAsDateRangePerWeekRange && this.labels) {

                    const datasets = Object.entries(this.epicsByTeamAsDateRangePerWeekRange).map(([team, data], i) => {
                        return {
                            label: team,
                            data,
                            fill: false,
                            tension: 0.1
                        }
                    });

                    const result = {
                        type: 'line',
                        data: {
                            labels: this.labels,
                            datasets,
                        }
                    }
                    return result;
                }
            }
        }
    }


    get epicsByTeamAsDateRangePerWeekRange() {
        const teams = {};

        if (this.epicsBetweenDates && this.weekRanges) {
            console.log(this.epicsBetweenDates)

            this.epicsBetweenDates.forEach(epic => {
                const epicStart = new Date(epic["Start date"]);
                const epicEnd = new Date(epic["Due date"]);
                const epicTeam = epic["Project key"];

                if (!teams[epicTeam]) {
                    teams[epicTeam] = Array.from({ length: this.weekRanges.length }, () => 0);
                }

                this.weekRanges.forEach((week, index) => {
                    const overlaps = (epicStart <= week.end && epicEnd >= week.start);
                    if (overlaps) {
                        teams[epicTeam][index] += 1;
                    }
                });
            });


        }

        return teams;
    }

    get chartData() {
        const epics = this.epicsBetweenDates;
        const labels = this.chartLabels;
        if (epics && labels) {

            return data;
        }
    }

    get weekRanges() {
        if (this.startDate && this.endDate) {
            const weeks = [];
            let currentDate = this.startDate;
            while (currentDate <= this.endDate) {
                weeks.push({
                    start: currentDate,
                    end: addDays(currentDate, 6),
                });
                currentDate = addDays(currentDate, 7);
            }
            return weeks;
        }
    }

}

function addDays(date, days) {
    const copy = new Date(Number(date));
    copy.setDate(date.getDate() + days);
    return copy;
}
customElements.define('capacity-chart-canvas', CapacityChartCanvas);
customElements.define('capacity-chart', CapacityChart);