# svg-clouds

A dependency-free, SVG filter-based cloud generator for rendering animated clouds on the web.

## Installation

1. Install the package with `npm install svg-clouds`
2. Add the svg-cloud script to your markup with `<script src="node_modules/svg-clouds/src/index.js"></script>`
3. (Optional) Include default styles in your markup with `<link rel="stylesheet" href="node_modules/svg-clouds/src/default.css">`

## Usage

### Basic markup and styling

Making a cloud is as easy as adding an `<svg-cloud>`, filling it with as many `<svg-cloud-part>` elements as desired, and styling it. For example, if you want to build a realistic cloud you may want to include three `<svg-cloud-part>` elements and style them as semi-circles of decreasing size and color value. Once the filters are applied you'll get something that looks like the side-by-side here:

![](./img/Comparison.png)

I've included some default styles to get you started, which include three classes - `cloud-front`, `cloud-mid`, and `cloud-back`. Adding the following markup and positioning the containing `<svg-cloud>` element should get you more or less the same cloud as I show in the comparison above.

``` html
<svg-cloud>
    <svg-cloud-part class="cloud-back"></svg-cloud-part>
    <svg-cloud-part class="cloud-mid"></svg-cloud-part>
    <svg-cloud-part class="cloud-front"></svg-cloud-part>
</svg-cloud>
```

If you're looking to style your own clouds (and you totally should), here are some tips:

* Adding a `box-shadow` to your underlying elements greatly enhances the effect by reducing jagged edges and smoothing out the transitions between layers.
* Messing with the `background-color` and the color of your `box-shadow` is one of the fastest ways to change the mood of your cloud.
* Playing with `border-radius` can help you achieve a more rounded, pillow-y look.

Because this effect is achieved with SVG filters you should be able to style your `<svg-cloud-part>`s in just about any way you'd like and it should *Do The Thing*.

### Advanced options

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

## Credits

Written and maintained by Ethan Morrill-Ploum.

Special thanks to Beau Jackson, whose ["Drawing Realistic Clouds with SVG and CSS"](https://css-tricks.com/drawing-realistic-clouds-with-svg-and-css/) article served as the foundation for this effect.

## License

Licensed under the [MIT License](LICENSE.txt). 