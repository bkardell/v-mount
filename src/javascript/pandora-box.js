(function() {
    /*! modified normalize.css v3.0.2 | MIT License | git.io/normalize */
    var resets ="` *{font: normal;font-size:1em;height:auto;letter-spacing:normal;line-height:normal;max-width:none;max-height:none;min-height:0;min-width:0;opacity:1;overflow:visible;position:static;text-shadow:none;text-transform:none;tranform:none;transition:none;vertical-align:baseline;visibility:visible;white-space:normal;width:auto;word-spacing:normal;z-index:auto;color:black;border:0;margin:0;box-shadow:none;clear:none;content:normal;display:inline;}`style,`script {display:none;}`li {display: list-item; }`ul,`menu,`dir{display: block;list-style-type: disc;}`a{color:blue;text-decoration:underline;}`div,`article,`aside,`details,`figcaption,`figure,`footer,`header,`hgroup,`main,`menu,`nav,`section,`summary{display:block}`audio,`canvas,`progress,`video{display:inline-block;vertical-align:baseline}`audio:not([controls]){display:none;height:0}`[hidden],`template{display:none}`a{background-color:transparent}`a:active,a:hover{outline:0}`abbr[title]{border-bottom:1px dotted}`b,`strong{font-weight:700}`dfn{font-style:italic}`h1{font-size:2em;margin:.67em 0}`mark{background:#ff0;color:#000}`small{font-size:80%}`sub,`sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}`sup{top:-.5em}`sub{bottom:-.25em}`img{border:0}`svg:not(:root){overflow:hidden}`figure{margin:1em 40px}`hr{-moz-box-sizing:content-box;box-sizing:content-box;height:0}`pre{overflow:auto}`code,`kbd,`pre,`samp{font-family:monospace,monospace;font-size:1em}`button,`input,`optgroup,`select,`textarea{color:inherit;border: 1px solid gray;font:inherit;margin:0}`button{overflow:visible}`button,`select{text-transform:none}`button,html `input[type=button],`input[type=reset],`input[type=submit]{-webkit-appearance:button;cursor:pointer}`button[disabled],html `input[disabled]{cursor:default}`button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}`input{line-height:normal}`input[type=checkbox],`input[type=radio]{box-sizing:border-box;padding:0}`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}`input[type=search]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}`input[type=search]::-webkit-search-cancel-button,`input[type=search]::-webkit-search-decoration{-webkit-appearance:none}`fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}`legend{border:0;padding:0}`textarea{overflow:auto}`optgroup{font-weight:700}`table{border-collapse:collapse;border-spacing:0}`td,`th{padding:0}",
        lastUid = 0,
        nextUid = function() {
            return "-stylemount-" + (++lastUid);
        },
        boost = ":not(#-_-):not(#-_-):not(#-_-)";

    /* Boost and inject the CSS provided */
    window.CSS._contain = function (cssText) {
        var styleEl = document.createElement("style"), index = -1, q = [];
        styleEl.title = nextUid();
        styleEl.disabled = true;
        styleEl.innerHTML = cssText;
        document.head.appendChild(styleEl);
        Array.prototype.slice.call(document.styleSheets).some(function (item) {
            index++;
            return item.title === styleEl.title;
        });
        Array.prototype.slice.call(document.styleSheets[index].rules).forEach(function (rule) {
            var buff = [];
            if (rule.selectorText) {
                rule.selectorText.split(",").forEach(function (selector) {
                    buff.push("[pandora-box] " + selector + ":not(#-_-):not(#-_-):not(#-_-)");
                });
                rule.selectorText = buff.join(",");
            }
            q.push(rule.cssText);
        });
        var temp = document.createElement("style");
        temp.innerHTML = q.join("\n");
        styleEl.parentElement.replaceChild(temp, styleEl);
    };

    /* Takes a markup, fragment or element, mounts <style> tags contained therein and removes them and returns the markup remaining (also mods by ref) */
    window.CSS._parseAndContain = function (markupOrFragment) {
        var temp = markupOrFragment, theme;
        if (typeof markupOrFragment === "string") {
            temp = document.createElement("div");
            temp.innerHTML = markupOrFragment;
        }
        Array.prototype.slice.call(temp.querySelectorAll("style")).forEach(function (styleEl) {
            window.CSS._contain(styleEl.innerHTML);
            styleEl.parentElement.removeChild(styleEl);
        });
        if (typeof markupOrFragment !== "string") {
            markupOrFragment.id = markupOrFragment.id || nextUid();
            theme = document.querySelector("style[type='text/theme-" + markupOrFragment.id + "']");
            window.CSS.contain(theme.innerHTML);
        }
        return temp.innerHTML;
    };

    window.CSS._specifyContainer = function (containerEl) {
        containerEl.setAttribute("pandora-box", true);
        window.CSS._parseAndContain(containerEl);
    };

    // we could use methods here for this, but this should be faster & we can be sure it happens just once...
    var isolator = document.createElement("style");
    isolator.innerHTML = resets.replace(/`/g, "[pandora-box]" + boost + " ");
    document.head.appendChild(isolator);
}());
