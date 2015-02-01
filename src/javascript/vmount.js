(function (ELEMENT, PREFIX) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT[PREFIX + "MatchesSelector"];

    ELEMENT.closest = ELEMENT.closest || function (selector) {
        var node = this;

        while (node) {
            if (node.matches(selector)) return node;
            else node = node.parentElement;
        }

        return null;
    };
})(
    Element.prototype,
    (this.getComputedStyle && [].join.call(getComputedStyle(document.documentElement, "")).match(/-(moz|ms|webkit)-/) || [])[1]
);
(function() {
    /*
        Limitations:
            1. You can't create a node list, so NodeList methods return an array

    */
    var resets =".v-mount-host>*:not(v-mount){display: none !important;}}/*! normalize.css v3.0.2 | MIT License | git.io/normalize */`article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}`audio,canvas,progress,video{display:inline-block;vertical-align:baseline}`audio:not([controls]){display:none;height:0}`[hidden],template{display:none}`a{background-color:transparent}`a:active,a:hover{outline:0}`abbr[title]{border-bottom:1px dotted}`b,strong{font-weight:700}`dfn{font-style:italic}`h1{font-size:2em;margin:.67em 0}`mark{background:#ff0;color:#000}`small{font-size:80%}`sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}`sup{top:-.5em}`sub{bottom:-.25em}`img{border:0}`svg:not(:root){overflow:hidden}`figure{margin:1em 40px}`hr{-moz-box-sizing:content-box;box-sizing:content-box;height:0}`pre{overflow:auto}`code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}`button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}`button{overflow:visible}`button,select{text-transform:none}`button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}`button[disabled],html input[disabled]{cursor:default}`button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}`input{line-height:normal}`input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}`input[type=search]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}`input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}`fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}`legend{border:0;padding:0}`textarea{overflow:auto}`optgroup{font-weight:700}`table{border-collapse:collapse;border-spacing:0}`td,th{padding:0}",
        lastUid = 0,
        nextUid = function() {
            return "-cn-" + (++lastUid);
        },
        identify = function(el) {
            if (el.id || el === document) {
                return false;
            }
            el.id = nextUid();
            return true;
        },/*
        find = function(scope, query) {
            var identified = identify(scope),
                pre = (scope !== document) ? "#" + scope.id + " " : "";
            result = scope._querySelector(pre + query);
            if (identified && scope.removeAttribute) {
                scope.removeAttribute("id");
            }
            return result;
        },*/
        findAll = function(scope, query) {
            var identified = identify(scope),
                pre = (scope !== document) ? "#" + scope.id + " " : "";
            result = Array.prototype.slice.call(scope._querySelectorAll(pre + query));
            if (identified && scope.removeAttribute) {
                scope.removeAttribute("id");
            }
            return result;
        },
        qsa = function(scope, query) {
            var full, inside;
            if (query.indexOf("/--mount/") !== -1) {
                return scope._querySelectorAll(query.replace(/\/--mount\//g, "v-mount"));
            } else {
                full = Array.prototype.slice.call(findAll(scope, query));
                inside = Array.prototype.slice.call(findAll(scope, "v-mount " + query + ",v-mount"));
                return full.filter(function(item) {
                    return inside.indexOf(item) === -1;
                });
            }
        },
        filterConnectors = function(coll) {
            var ret = Array.prototype.slice.call(coll).filter(function(el) {
                return el.tagName !== "V-MOUNT";
            });
            ret.item = function (index) {
                return (index < ret.length) ? ret[index] : null;
            };
            return ret;
        },
        noopFilter = function (val) {
            return val;
        };

    HTMLElement.prototype._querySelector = HTMLElement.prototype.querySelector;
    HTMLElement.prototype._querySelectorAll = HTMLElement.prototype.querySelectorAll;
    HTMLDocument.prototype._querySelector = HTMLDocument.prototype.querySelector;
    HTMLDocument.prototype._querySelectorAll = HTMLDocument.prototype.querySelectorAll;

    var proxyMethods = {
        "querySelectorAll": {
            value: function(query) {
                return qsa(this, query);
            }
        },
        "querySelector": {
            value: function(query) {
                var coll = this.querySelectorAll(query);
                return (coll.length > 0) ? coll[0] : null;
            }
        },
        "getElementById": {
            value: function(id) {
                return this.querySelector("#" + id.replace("`", "`#"));
            }
        }
    };

    Object.defineProperty(HTMLElement.prototype, "querySelectorAll", proxyMethods.querySelectorAll);
    Object.defineProperty(HTMLElement.prototype, "querySelector", proxyMethods.querySelector);
    Object.defineProperty(HTMLDocument.prototype, "querySelectorAll", proxyMethods.querySelectorAll);
    Object.defineProperty(HTMLDocument.prototype, "querySelector", proxyMethods.querySelector);
    Object.defineProperty(HTMLDocument.prototype, "getElementById", proxyMethods.getElementById);

    /* inject the rule to hide siblings... */
    //var siblingsRuleElement =
    //document.head.appendChild()

    V_MountNode = window.V_MountNode = Object.create(HTMLElement.prototype, {
        _projectAttribute: {
            value: function (element, sourceAttr, targetElement, destAttrOrCb, optionalCb) {
                var sourceVal = element.getAttribute(sourceAttr);
                var destAttr = (typeof destAttrOrCb === "string") ? destAttrOrCb : null;
                var filter, projects = "projects-attribute-" + sourceAttr + "-tocontent";
                if (destAttr) {
                    projects = projects.replace("-to-content", "-to-" + destAttr);
                }
                targetElement.id = targetElement.id || nextUid();
                filter = optionalCb || this._projectionFilters[projects+":"+targetElement.id] || ((destAttrOrCb && typeof destAttrOrCb !== "string") ? destAttrOrCb : noopFilter);
                sourceVal = filter(sourceVal);
                if (destAttr) {
                    targetElement.setAttribute(destAttr, sourceVal);
                } else {
                    targetElement.innerHTML = sourceVal;
                }
                if (!element.hasAttribute(projects)) {
                    element.setAttribute(projects, targetElement.id);
                    element.setAttribute("projects", "");
                    this._projectionFilters[projects+":"+targetElement.id] = filter;
                }
            }
        },
        _projectElementContent: {
            value: function (element, targetElement, cb) {
                var filter, html;
                targetElement.id = targetElement.id || nextUid();
                filter = cb || this._projectionFilters["projects-tocontent:" + targetElement.id] || noopFilter;
                html = filter(element.innerHTML);
                targetElement.innerHTML = html;
                if (!element.hasAttribute("projects-tocontent")) {
                    element.setAttribute("projects-tocontent", targetElement.id);
                    element.setAttribute("projects", "");
                    this._projectionFilters["projects-tocontent:" + targetElement.id] = filter;
                }
            }
        },
        _projectElementClone: {
            value: function (element, targetElement, cb) {
                var clone, filter;
                targetElement.innerHTML = "";
                targetElement.id = targetElement.id || nextUid();
                filter = cb || this._projectionFilters["projects-clone:" + targetElement.id] || noopFilter;
                // TODO: deal with id/idrefs
                if (element) {
                    clone = filter(element.cloneNode(true));
                    clone.style.display = "";
                    targetElement.appendChild(clone);
                    if (!element.hasAttribute("projects-clone")) {
                        element.setAttribute("projects-clone", targetElement.id);
                        element.setAttribute("projects", "");
                        this._projectionFilters["projects-clone:" + targetElement.id] = filter;
                    }
                }
            }
        },
        _connect: {
            value: function (host) {
                if (!host._mount) {
                    var barrier = document.createElement("v-mount"), specifierSelector;
                    var self = {
                        _children: host.children,
                        _childNodes: host.childNodes
                    };
                    /*
                    so what we'd need to do is create a new child
                    which is <shadow-root> ideally this would not show up in children
                    and it would always be the ... first or last element?

                    It would have to create mutation observer on the *light* DOM
                    and relay its work to the shadow root
                    */
                    host._projectionFilters = {};
                    host._projectElementContent = this._projectElementContent;
                    host._projectElementClone = this._projectElementClone;
                    host._projectAttribute = this._projectAttribute;

                    host.classList.add("v-mount-host");
                    host.insertBefore(barrier, host.firstElementChild);
                    host._mount = barrier;
                    host._mount.id = nextUid();
                    host._mount._hostElement = host;
                    specifierSelector = "#" +host._mount.id + ":not(#-s-boost):not(#-s-boost) ";
                    // TODO:  This should be two step, first only needs included once, next once per custom element defn
                    host._mount.innerHTML = "<style>" + (resets + "\n" + host._styleTemplate).replace(/`|\/--mount\//g, specifierSelector) + "</style>";
                    Object.defineProperties(host, {
                        "children": {
                            get: function () {
                                return filterConnectors(self._children);
                            }
                        },
                        "childNodes": {
                            get: function () {
                                return filterConnectors(self._childNodes);
                            }
                        },
                        "firstElementChild": {
                            get: function () {
                                return this.children.shift();
                            }
                        },
                        "lastElementChild": {
                            get: function () {
                                return this.children.pop();
                            }
                        },
                        "firstChild": {
                            get: function () {
                                return this.childNodes.shift();
                            }
                        },
                        "lastChild": {
                            get: function () {
                                return this.childNodes.pop();
                            }
                        }
                    });

/*
                    for (var i = 0; i < host.children.length; i++) {
                        // todo: mount them into reflected and observe
                        //var clone = host.children[i].cloneNode(true);
                        //clone.setAttribute("projected", true);
                        //host._mount.appendChild(clone);

                        host.children[i].style.display = "none";
                    }
*/
                    if (!host.observer) {
                        host.observer = new MutationObserver(function (mutations) {
                            // we'll just re-project blindly, this is heavy...
                            //V_MountNode._projectElementClone(element, targetElement);
                            mutations.forEach(function (record) {
                                var target = record.target, attr, srcAttrName, proxyTarget;
                                if (!target.hasAttribute) {
                                    target = target.parentElement.closest("[projects]");
                                }
                                if (target && target.hasAttribute("projects")) {
                                    for (var i=0; i<target.attributes.length; i++) {
                                        attr = target.attributes[i];
                                        if (attr.name === "projects-clone") {
                                            proxyTarget = host._mount.querySelector("#" + attr.value);
                                            console.log("clone");
                                        } else if (attr.name === "projects-tocontent") {
                                            proxyTarget = host._mount.querySelector("#" + attr.value);
                                            host._projectElementContent(target, proxyTarget);
                                        } else  if (attr.name.indexOf("projects-attribute") === 0 && record.oldValue !== attr.value) {
                                            proxyTarget = host._mount.querySelector("#" + attr.value);
                                            srcAttrName = attr.name.replace("projects-attribute-", "");
                                            if (attr.name.indexOf("-tocontent") !== -1) {
                                                host._projectAttribute(target, srcAttrName.replace("-tocontent",""), proxyTarget);
                                            } else {
                                                host._projectAttribute(target, srcAttrName.replace(/-to-.*/,""), proxyTarget, srcAttrName.replace("-to-", ""));
                                            }
                                        }
                                    }
                                }
                            });

                        });
                        host.observer.observe(host, {
                            "childList": true,
                            "subtree": true,
                            "attributes": true,
                            "characterData": true
                        });
                    }
                }
            }
        },
        createdCallback: {
            value: function() {
                Object.defineProperty(this, "parentElement", {
                    get: function() {
                        return null;
                    }
                });
                Object.defineProperty(this, "parentNode", {
                    get: function() {
                        return null;
                    }
                });
            }
        }
    });

    document.registerElement(
        "v-mount", {
            "prototype": window.V_MountNode
        }
    );

    //var id = 1;
    document.registerElement(
        "x-foo", {
            "prototype": Object.create(HTMLElement.prototype, {
                _sourceTemplate: { value: "<h1><span id=\"my-title\"></span><span></span></h1><div style=\"background-color:#afafaf;\"></div>" },
                _styleTemplate: {  value: "/--mount/ h1 { color: rebeccapurple;border-bottom: solid 1px black; }" },
                createdCallback: {
                    value: function() {
                        this.style.display = "block";
                        V_MountNode._connect(this);
                        var wrapper = document.createElement("section");
                        // now I want to
                        wrapper.innerHTML = this._sourceTemplate;
                        var hosted = this._mount;
                        hosted.appendChild(wrapper);
                        this._projectElementContent(this.querySelector("x-foo-title"), wrapper.firstChild.firstChild);
                        this._projectElementClone(this.querySelector(":not(x-foo-title)"), wrapper.children[1]);
                        this._projectAttribute(this.querySelector("x-foo-title"), "subtitle", wrapper.firstChild.children[1], function (val) {
                            return (val) ? " (" + val + ")" : "";
                        });
                    }
                }
            })
        }
    );


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

                        // project a clone into it...
                        this._projectElementClone(authorCheckbox, projectableTargetElement);

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
}());
