import { StacheElement, type, ObservableObject, stache } from "//unpkg.com/can@6/core.mjs";

export class Navbar extends StacheElement {
    static view = `
    <header class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
    <nav class="container-xxl bd-gutter flex-wrap flex-lg-nowrap">
        <div class="container">
            <a class="navbar-brand">Capacity Planning</a>
            <button class="clipboard-button btn btn-sm btn-dark mb-1" on:click="copyLink()">
                <span class="copy-link">
                    {{# if(linkCopied)}}
                    <i class="bi bi-clipboard-check"></i> Copied
                    {{else}}
                    <i class="bi bi-clipboard"></i> Copy Link
                    {{/ if}}
                </span>
            </button>
        </div>
        
    </nav>
    </header>
    `

    static props = {
        linkCopied: {
            type: Boolean,
            default: false
        },
    };


    copyLink() {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        this.linkCopied = true;

        setTimeout(() => {
            this.linkCopied = false;
        }, 2000);
    }
}

customElements.define("nav-bar", Navbar);