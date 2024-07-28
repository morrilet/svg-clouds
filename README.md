# svg-clouds

A dependency-free, SVG filter-based cloud generator for rendering animated clouds on the web.

## Installation

TODO: Describe the installation process

## Usage

Making a cloud is as easy as adding `<svg-cloud><svg-cloud-part></svg-cloud-part></svg-cloud>` anywhere in your markup. Clouds, by default, consist of three layers and slowly animate.

TODO: Note about styling.

You can style clouds and their layers to alter their look. Generally speaking, for realistic clouds you'll want to mess around with `background-color`, `box-shadow`, and `border-radius` to achieve a pillow-y look. Because this effect is achieved with SVG filters, however, you should be able to style your `<svg-cloud-part>`s in just about any way you'd like and it should *Do The Thing*.

You can adjust any of the cloud settings via Javascript or as attributes on the individual `<svg-cloud-part>` elements. 

**Note:** Attributes will always override their respective Javascript options.

When working with Javascript, this is done via the `layers` key of the `options` dictionary on the `<svg-cloud>` element.
``` html
<script>
    const options = {
        // Layers allows you to specify per-layer settings. By default, there will be three layers to each cloud.
        // Keys are CSS selectors that'll run against the children of the `<svg-cloud>` element.
        layers: {
            ".my-example-part": {
                seed: 0,  // The random seed to use for noise generation.
                animate: true,  // Whether or not we should animate this layer.
                animationDuration: "20s",  // How fast the cloud performs one full animation cycle.
                numOctaves: 4,  // The number of octaves to use for turbulence generation. Impacts performance.
                blurAmount: 15,  // How much gaussian blur (std. deviation) to apply to the layer.
                displacementScale: 120,  // How much to displace the cloud noise. This generates the final look.
                ignoreEffect: false,  // Ignores the effect entirely. Useful for debugging the underlying shape.
            }
        }
    };

    window.addEventListener("load", () => {
        const cloud = document.getElementById("my-example-cloud");
        cloud.options = options;
    });
</script>

<svg-cloud id="my-example-cloud">
    <svg-cloud-part class=".my-example-part"></svg-cloud-part>
</svg-cloud>
```

When working with attributes, it's the same but... attributes.
``` html
<svg-cloud>
    <svg-cloud-part
        seed="0"
        animate="true"
        animation-duration="20s"
        num-octaves="4"
        blur-amount="15"
        displacement-scale="120"
        ignore-effect="false"
    ></svg-cloud-part>
</svg-cloud>
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request!

## History

TODO: Write history

## Credits

Written and maintained by Ethan Morrill-Ploum.

Special thanks to Beau Jackson, whose ["Drawing Realistic Clouds with SVG and CSS"](https://css-tricks.com/drawing-realistic-clouds-with-svg-and-css/) article served as the foundation for this effect.

## License

TODO: Write license