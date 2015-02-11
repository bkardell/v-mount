(function() {
    var lastUid = 0,
    nextUid = function() {
        return "-cn-" + (++lastUid);
    };
    document.registerElement(
        "x-checkbox", {
            "prototype": Object.create(HTMLElement.prototype, {
                _sourceTemplate: { value: "" },
                _styleTemplate: {  value: "/--mount/ input[type=checkbox]{position: absolute; left: -1000px;} /--mount/ label::before { content: \"\\2000\"; width: 2em; height: 2em; border: 5px solid gray; display: inline-block; text-align: center; border-radius: 4em; } /--mount/ input[type=checkbox]:checked ~ label::before { background-color: green; } /--mount/ input[type=checkbox]:checked ~ label::before { content: \"\\2713\"; color: white; border-color: black; } " },
                createdCallback: {
                    value: function() {
                        var projectableTargetElement, internalCheckbox, authorCheckbox = this.querySelector("input[type=\"checkbox\"]"), label;
                        this.style.display = "inline";
                        V_MountNode._connect(this);

                        // create an element that we can project into...
                        projectableTargetElement = document.createElement("span");

                        // append it to the mount...
                        this._mount.appendChild(projectableTargetElement);


                        var projector = new _MountProjector(this);

                        // project a clone into it...
                        projector._projectElementClone(authorCheckbox, projectableTargetElement);

                        // grab a reference to it...
                        internalCheckbox = this._mount.querySelector("input[type=\"checkbox\"]");

                        // create or use it's id
                        internalCheckbox.id = internalCheckbox.id || nextUid();

                        // create a label for use inside the mount
                        label = document.createElement("label");

                        // connect it
                        label.setAttribute("for", internalCheckbox.id);

                        // place it after
                        projectableTargetElement.appendChild(label);

                        // remove the original's name attribute so it won't submit
                        authorCheckbox.removeAttribute("name");
                    }
                }
            })
        }
    );

    document.registerElement(
        "x-foo", {
            "prototype": Object.create(HTMLElement.prototype, {
                _sourceTemplate: { value: "<h1><span id=\"my-title\"></span><span></span></h1><div style=\"background-color:#afafaf;\"></div>" },
                _styleTemplate: {  value: "/--mount/ h1 { color: rebeccapurple;border-bottom: solid 1px black; }" },
                createdCallback: {
                    value: function() {
                        var projector, wrapper, hosted;
                        this.style.display = "block";
                        V_MountNode._connect(this);
                        wrapper = document.createElement("section");
                        // now I want to
                        wrapper.innerHTML = this._sourceTemplate;
                        hosted = this._mount;
                        hosted.appendChild(wrapper);

                        projector = new _MountProjector(this);
                        projector._projectElementContent(this.querySelector("x-foo-title"), wrapper.firstChild.firstChild);
                        projector._projectElementClone(this.querySelector(":not(x-foo-title)"), wrapper.children[1]);
                        projector._projectAttribute(this.querySelector("x-foo-title"), "subtitle", wrapper.firstChild.children[1], function (val) {
                            return (val) ? " (" + val + ")" : "";
                        });
                    }
                }
            })
        }
    );

}());
