class SVGCloud extends HTMLElement {
    get options() {
        return this.options
    }

    set options(options) {
        this._options = Object.assign(this._options, options);
        this.redeployCloud();
    }

    constructor() {
        super();
        this.onMutation = this.onMutation.bind(this);
        this._options = { layers: {} }
    }
    
    // Set layer options. Triggers a re-deploy of the filter objects for each layer.
    redeployCloud() {
        Object.entries(this._options['layers']).forEach((entry) => {
            const [ selector, options ] = entry;
            const children = this.querySelectorAll(selector);
            
            children.forEach(child => {
                console.log(child);
                if (child.nodeName === "SVG-CLOUD-PART") {
                    child.options = Object.assign(child.options, options);
                };
            });
        });
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
                if (el.nodeName == "SVG-CLOUD-PART") {
                    if (el.getAttribute("data-uuid") === null) {
                        const cloudPartUUID = crypto.randomUUID();
                        el.connectFilter(cloudPartUUID);
                    };
                };
            };
        };
    }
}

class SVGCloudPart extends HTMLElement {
    static get observedAttributes() {
        return [
            "seed",
            "animate",
            "animation-duration",
            "turbulence-frequency",
            "turbulence-octaves",
            "blur-amount",
            "displacement-scale",
        ];
    }

    getDefaultOptions() {
        return {
            seed: 0,
            animate: true,
            animationDuration: "20s",
            turbulenceFrequency: 0.012,
            turbulenceOctaves: 4,
            blurAmount: 15,
            displacementScale: 120,
        };
    }

    get options() {
        if (this._options === undefined) {
            this._options = {};
        }
        return this._options;
    }

    set options(options) {
        this._options = Object.assign(this._options, options);
        this.updateValues();
        this.redeployFilter();
    }

    constructor() {
        super();
        this._options = this.getDefaultOptions();
        this.updateValues();

        // Internal stuff for tracking our filter node.
        this._filterUUID = crypto.randomUUID();
        this._filterSVG = this.getFilterSVG();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.updateValues();
        this.redeployFilter();
    }

    updateValues() {
        this._seed = this.getAttribute("seed") ?? this._options["seed"];
        this._animate = this.getAttribute("animate") ?? this._options["animate"]
        this._animationDuration = this.getAttribute("animation-duration") ?? this._options["animationDuration"];
        this._turbulenceFrequency = this.getAttribute("turbulence-frequency") ?? this._options["turbulenceFrequency"];
        this._turbulenceOctaves = this.getAttribute("turbulence-octaves") ?? this._options["turbulenceOctaves"];
        this._blurAmount = this.getAttribute("blur-amount") ?? this._options["blurAmount"];
        this._displacementScale = this.getAttribute("displacement-scale") ?? this._options["displacementScale"];

        console.log(this)
        console.log(this.getAttribute("animation-duration"))
    }

    getFilterSVG() {
        const animationTag = `<animate attributeName="values" values="0;360" dur="${this._animationDuration}" repeatCount="indefinite"/>`
        return `
            <svg data-uuid="${this._filterUUID}">
                <filter id="${this._filterUUID}">
                    <feTurbulence type="fractalNoise" seed=${this._seed} result="base" baseFrequency="${this._turbulenceFrequency}" numOctaves="${this._turbulenceOctaves}" />
                    <feColorMatrix in="base" type="hueRotate" values="0" result="base-shifted">
                        ${this._animate ? animationTag : ""}
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
            svg-cloud-part[data-uuid="${uuid}"] {
                filter: url(#${this._filterUUID});
            }

            svg[data-uuid="${this._filterUUID}"] {
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
        const filter = document.querySelector(`svg[data-uuid="${this._filterUUID}"]`);
        filter.outerHTML = this.getFilterSVG();
    }
}

customElements.define('svg-cloud', SVGCloud);
customElements.define('svg-cloud-part', SVGCloudPart);