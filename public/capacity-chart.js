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
                console.log
                listenTo('labels', () => {
                    console.log('labels changed')
                    resolve(this.chartData);
                });
                listenTo('countEpicsAsDateRangePerWeekRange', () => {
                    console.log('countEpicsAsDateRangePerWeekRange changed')
                    resolve(this.chartData);
                });
            },
            get() {
                if (this.countEpicsAsDateRangePerWeekRange && this.labels) {
                    const result = {
                        type: 'line',
                        data: {
                            labels: this.labels,
                            datasets: [{
                                label: 'Epics in Flight During Week',
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
customElements.define('capacity-chart-canvas', CapacityChartCanvas);
customElements.define('capacity-chart', CapacityChart);