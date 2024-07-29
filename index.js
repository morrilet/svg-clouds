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
                        // Connect the filter on the new child element. We might be able to do this in the constructor of the child directly,
                        // but I haven't had success with that just yet. I suspect we need the parent to be connected first, so we do it here.
                        el.connectFilter();
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
            "ignore-effect",
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
            ignoreEffect: false,
        };
    }

    getAttributes() {
        const attributes = {}
        this.hasAttribute("seed") ? attributes['seed'] = parseInt(this.getAttribute("seed")) : undefined;
        this.hasAttribute("animate") ? attributes['animate'] = this.getAttribute("animate") === "true" : undefined;
        this.hasAttribute("animation-duration") ? attributes['animationDuration'] = this.getAttribute("animation-duration") : undefined;
        this.hasAttribute("turbulence-frequency") ? attributes['turbulenceFrequency'] = parseFloat(this.getAttribute("turbulence-frequency")) : undefined;
        this.hasAttribute("turbulence-octaves") ? attributes['turbulenceOctaves'] = parseInt(this.getAttribute("turbulence-octaves")) : undefined;
        this.hasAttribute("blur-amount") ? attributes['blurAmount'] = parseInt(this.getAttribute("blur-amount")) : undefined;
        this.hasAttribute("displacement-scale") ? attributes['displacementScale'] = parseInt(this.getAttribute("displacement-scale")) : undefined;
        this.hasAttribute("ignore-effect") ? attributes['ignoreEffect'] = this.getAttribute("ignore-effect") === "true" : undefined;
        return attributes;
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
        this._partUUID = crypto.randomUUID();
        this._filterUUID = crypto.randomUUID();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.updateValues();
        this.redeployFilter();
    }

    updateValues() {
        const attributes = this.getAttributes();
        this._seed = attributes["seed"] ?? this._options["seed"];
        this._animate = attributes["animate"] ?? this._options["animate"];
        this._animationDuration = attributes["animationDuration"] ?? this._options["animationDuration"];
        this._turbulenceFrequency = attributes["turbulenceFrequency"] ?? this._options["turbulenceFrequency"];
        this._turbulenceOctaves = attributes["turbulenceOctaves"] ?? this._options["turbulenceOctaves"];
        this._blurAmount = attributes["blurAmount"] ?? this._options["blurAmount"];
        this._displacementScale = attributes["displacementScale"] ?? this._options["displacementScale"];
        this._ignoreEffect = attributes["ignoreEffect"] ?? this._options["ignoreEffect"];
    }

    getFilterSVG() {
        if (this._ignoreEffect === true) {
            return "";
        }

        const animationTag = `<animate attributeName="values" values="0;360" dur="${this._animationDuration}" repeatCount="indefinite"/>`
        return `
            <svg data-uuid="${this._filterUUID}">
                <filter id="${this._filterUUID}">
                    <feTurbulence type="fractalNoise" seed="${this._seed}" result="base" baseFrequency="${this._turbulenceFrequency}" numOctaves="${this._turbulenceOctaves}" />
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

        // <svg xmlns="http://www.w3.org/2000/svg" viewBox="100 100 900 400">
        // <filter id="filter" filterUnits="userSpaceOnUse" height="500" width="900" y="0" x="0" style="color-interpolation-filters:sRGB">
        //   <feTurbulence type="fractalNoise" seed="462" baseFrequency="0.011" numOctaves="5" result="noise1" />
        //   <feTurbulence type="fractalNoise" seed="462" baseFrequency="0.011" numOctaves="2" result="noise2" />
          
        //   <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        //   <feDisplacementMap in="blur1" scale="100" in2="noise1" result="cloud1" />
        //   <feFlood flood-color="rgb(215,215,215)" flood-opacity="0.3" />
        //   <feComposite operator="in" in2="SourceGraphic" />
        //   <feOffset dx="-10" dy="-3" />
        //   <feMorphology radius="20" />
          
        //   <feGaussianBlur stdDeviation="20" />
        //   <feDisplacementMap scale="100" in2="noise1" result="cloud2" />
        //   <feFlood flood-color="rgb(66,105,146)" flood-opacity="0.2" />
        //   <feComposite operator="in" in2="SourceGraphic" />
        //   <feOffset dx="-10" dy="40" />
        //   <feMorphology radius="0 40" />
        //   <feGaussianBlur stdDeviation="20" />
        //   <feDisplacementMap scale="80" in2="noise2" result="cloud3" />
        //   <feFlood flood-color="rgb(0,0,0)" flood-opacity="0.4" />
        //   <feComposite operator="in" in2="SourceGraphic" />
        //   <feOffset dx="20" dy="60" />
        //   <feMorphology radius="0 65" />
        //   <feGaussianBlur stdDeviation="20" />
        //   <feDisplacementMap scale="50" in2="noise2" result="cloud4" />
        //   <feMerge>
        //     <feMergeNode in="cloud1" id="feMergeNode954" />
        //     <feMergeNode in="cloud2" id="feMergeNode956" />
        //     <feMergeNode in="cloud3" id="feMergeNode958" />
        //     <feMergeNode in="cloud4" id="fe
    }

    connectFilter() {
        this.setAttribute('data-uuid', this._partUUID);

        const newStyle = document.createElement("style");
        newStyle.innerHTML = `
            svg-cloud-part[data-uuid="${this._partUUID}"] {
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
        const filter = this.parentElement.querySelector(`svg[data-uuid="${this._filterUUID}"]`);
        filter.outerHTML = this.getFilterSVG();
    }
}

customElements.define('svg-cloud', SVGCloud);
customElements.define('svg-cloud-part', SVGCloudPart);