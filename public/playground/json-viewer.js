import { StacheElement, type } from "//unpkg.com/can@6/core.mjs";
import jsonviewer from "./util/jsonViewer.js"


export class JsonViewer extends StacheElement {
    static view = `
        <div class="json-viewer">
            <div class="json-container"></div>
        </div>
    `;

    static props = {
        json: {
            type: type.convert(String),
            set(newVal) {
                if (this.jsonviewer) {
                    this.jsonviewer = new jsonviewer({
                        container: this.querySelector(".json-container"),
                        data: newVal,
                        theme: 'light',
                        expand: false
                    });
                }

                return newVal;
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();

        this.jsonviewer = new jsonviewer({
            container: this.querySelector(".json-container"),
            data: this.json || "{}",
            theme: 'light',
            expand: false
        });
    }
}

customElements.define('json-viewer', JsonViewer);