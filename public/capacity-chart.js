import { StacheElement, type } from "//unpkg.com/can@6/core.mjs";
import './chart.js';


export class CapacityChart extends StacheElement {

    static view = `
        <h2>Capacity Chart</h2>
        {{chartData}}
        <canvas id="capacityChart" width="400" height="400"></canvas>
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
        }
    }

    // when this is finally defined, we need to call something like:
    // new Chart(this.querySelector('#capacityChart'), this.chartData)
    get chartData() {
        if (this.countEpicsAsDateRangePerWeekRange && this.labels) {
            const result = {
                type: 'line',
                data: {
                    labels: this.labels,
                    datasets: [{
                        label: 'Epics per week',
                        data: this.countEpicsAsDateRangePerWeekRange,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            }
            console.log(result)
            return result;
        }
    }

    get labels() {
        if (this.weekRanges) {
            return this.weekRanges.map(week => {
                return week.start.toLocaleDateString("en-US");
            });
        }
    }

    get countEpicsAsDateRangePerWeekRange() {
        if (this.epicsBetweenDates && this.weekRanges) {
            return this.weekRanges.map(week => {
                const epicsInWeek = this.epicsBetweenDates.filter(epic => {
                    const epicStart = new Date(epic["Start date"]);
                    const epicEnd = new Date(epic["Due date"]);
                    const overlaps = (epicStart <= week.end && epicEnd >= week.start);

                    return overlaps;
                });
                return epicsInWeek.length;
            })
        }
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

customElements.define('capacity-chart', CapacityChart);