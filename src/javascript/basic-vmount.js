(function() {
    /* Limitation: You can't create a node list, so NodeList methods return an array */
    var resets =".v-mount-host>*:not(v-mount){display: none !important;}}/*! normalize.css v3.0.2 | MIT License | git.io/normalize */`*{font-size: 1em; color: black; display: inline;}`article,`aside,`details,`figcaption,`figure,`footer,`header,`hgroup,`main,`menu,`nav,`section,`summary{display:block}`audio,`canvas,`progress,`video{display:inline-block;vertical-align:baseline}`audio:not([controls]){display:none;height:0}`[hidden],`template{display:none}`a{background-color:transparent}`a:active,a:hover{outline:0}`abbr[title]{border-bottom:1px dotted}`b,`strong{font-weight:700}`dfn{font-style:italic}`h1{font-size:2em;margin:.67em 0}`mark{background:#ff0;color:#000}`small{font-size:80%}`sub,`sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}`sup{top:-.5em}`sub{bottom:-.25em}`img{border:0}`svg:not(:root){overflow:hidden}`figure{margin:1em 40px}`hr{-moz-box-sizing:content-box;box-sizing:content-box;height:0}`pre{overflow:auto}`code,`kbd,`pre,`samp{font-family:monospace,monospace;font-size:1em}`button,`input,`optgroup,`select,`textarea{color:inherit;font:inherit;margin:0}`button{overflow:visible}`button,`select{text-transform:none}`button,html `input[type=button],`input[type=reset],`input[type=submit]{-webkit-appearance:button;cursor:pointer}`button[disabled],html `input[disabled]{cursor:default}`button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}`input{line-height:normal}`input[type=checkbox],`input[type=radio]{box-sizing:border-box;padding:0}`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}`input[type=search]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}`input[type=search]::-webkit-search-cancel-button,`input[type=search]::-webkit-search-decoration{-webkit-appearance:none}`fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}`legend{border:0;padding:0}`textarea{overflow:auto}`optgroup{font-weight:700}`table{border-collapse:collapse;border-spacing:0}`td,`th{padding:0}",
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
        },
        findAll = function(scope, query) {
            var identified = identify(scope),
                pre = (scope !== document && query.indexOf("#" + scope.id) === -1)? "#" + scope.id + " " : "";
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


    V_MountNode = window.V_MountNode = Object.create(HTMLElement.prototype, {
        _connect: {
            value: function (host) {
                var temp, barrier, self, specifierSelector;
                if (!host._mount) {
                    barrier = document.createElement("v-mount");
                    self = {
                        _children: host.children,
                        _childNodes: host.childNodes,
                        cssInitialized: {}
                    };
                    Object.defineProperty(barrier, "parentElement", {
                        get: function() {
                            return null;
                        }
                    });
                    Object.defineProperty(barrier, "parentNode", {
                        get: function() {
                            return null;
                        }
                    });
                    barrier._connectConstructed = true;

                    host.classList.add("v-mount-host");
                    host.insertBefore(barrier, host.firstElementChild);
                    host._mount = barrier;
                    host._mount.id = nextUid();
                    host._mount._hostElement = host;
                    specifierSelector = "v-mount:not(#-s-boost):not(#-s-boost):not(#-s-boost) ";
                    //TODO: refactor to a method...
                    if (!self.cssInitialized.root) {
                        temp = document.createElement("style");
                        temp.innerHTML = resets.replace(/`|\/--mount\//g, specifierSelector);
                        document.head.appendChild(temp);
                        self.cssInitialized.root = true;
                    }
                    if (!self.cssInitialized[host.tagName]) {
                        temp = document.createElement("style");
                        temp.innerHTML = (host._styleTemplate || "").replace(/`|\/--mount\//g, specifierSelector);
                        document.head.appendChild(temp);
                        self.cssInitialized[host.tagName] = true;
                    }
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
                }
            }
        },
        createdCallback: {
            value: function() {
                var self = this;
                setTimeout(function () {
                    if (!self._connectConstructed) {
                        self.parentElement.removeChild(self);
                    }
                }, 10);
            }
        }
    });

    document.registerElement(
        "v-mount", {
            "prototype": window.V_MountNode
        }
    );
}());