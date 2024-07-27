class SVGCloud extends HTMLElement {
    constructor() {
        super();
        this.onMutation = this.onMutation.bind(this);
    }

    connectedCallback() {
        this.observer = new MutationObserver(this.onMutation);
        this.observer.observe(this, {
            childList: true,
        })
    }

    disconnectCallback() {
        this.observer.disconnect();
    }

    onMutation(mutations) {
        // Note that we only watch for child list changes here, as defined in the `connectedCallback`.
        for (const mutation of mutations) {
            for (const el of mutation.addedNodes) {
                if (el.nodeName == "CLOUD-COMPONENT") {
                    if (el.getAttribute("data-uuid") === null) {
                        const cloudComponentUUID = crypto.randomUUID();
                        el.connectFilter(cloudComponentUUID);
                    };
                };
            };
        };
    }
}

class SVGCloudComponent extends HTMLElement {
    get options() {
        return this.options
    }

    set options(options) {
        this._options = options;
        this.updateValues();
        this.redeployFilter();
    }

    constructor() {
        super();
        this._options = {}

        this.updateValues();

        this.filterUUID = crypto.randomUUID();
        this.filterSVG = this.getFilterSVG();
    }

    updateValues() {
        this._seed = this.getAttribute("seed") ?? this._options["seed"] ?? 0;
        this._turbulenceFrequency = this.getAttribute("turbulenceFrequency") ?? this._options["turbulenceFrequency"] ?? 0.012;
        this._turbulenceOctaves = this.getAttribute("turbulenceOctaves") ?? this._options["turbulenceOctaves"] ?? 4;
        this._animationDuration = this.getAttribute("animationDuration") ?? this._options["animationDuration"] ?? "20s";
        this._blurAmount = this.getAttribute("blurAmount") ?? this._options["blurAmount"] ?? 15;
        this._displacementScale = this.getAttribute("displacementScale") ?? this._options["displacementScale"] ?? 120;
    }

    getFilterSVG() {
        return `
            <svg data-uuid="${this.filterUUID}">
                <filter id="${this.filterUUID}">
                    <feTurbulence type="fractalNoise" seed=${this._seed} result="base" baseFrequency="${this._turbulenceFrequency}" numOctaves="${this._turbulenceOctaves}" />
                    <feColorMatrix in="base" type="hueRotate" values="0" result="base-shifted">
                        <animate attributeName="values" values="0;360" dur="${this._animationDuration}" repeatCount="indefinite"/>
                    </feColorMatrix>
                    <feColorMatrix in="base-shifted" result="cloud-tex" type="matrix" 
                        values="1 0 0 0 -1
                                1 0 0 0 -1
                                1 0 0 0 -1
                                1 0 0 0 0"
                    />
                    <feGaussianBlur in="SourceGraphic" result="blur-base" stdDeviation="${this._blurAmount}"/>
                    <feDisplacementMap in="blur-base" in2="cloud-tex" scale="${this._displacementScale}" />
                </filter>
            </svg>
        `;
    }

    connectFilter(uuid) {
        this.setAttribute('data-uuid', uuid);

        const newStyle = document.createElement("style");
        newStyle.innerHTML = `
            cloud-component[data-uuid="${uuid}"] {
                filter: url(#${this.filterUUID});
            }

            svg[data-uuid="${this.filterUUID}"] {
                width: 0;
                height: 0;
                position: absolute;
            }
        `;
        this.insertAdjacentElement("beforebegin", newStyle);

        const newFilter = document.createElementNS("svg", "svg");
        this.insertAdjacentElement("beforebegin", newFilter);
        newFilter.outerHTML = this.getFilterSVG();
    }

    redeployFilter() {
        const filter = document.querySelector(`svg[data-uuid="${this.filterUUID}"]`);
        filter.outerHTML = this.getFilterSVG();
    }
}

customElements.define('svg-cloud', SVGCloud);
customElements.define('cloud-component', SVGCloudComponent);