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
    var lastUid = 0,
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
    noopFilter = function (val) {
        return val;
    };
    window._MountProjector = function (el) {
        var host, self = this;
        if (!el || el.nodeType !== 1 || !el.parentElement) {
            throw new Error("_MountProjector constructor requires a valid element with a parentElement");
        }
        this.ref = el;
        this.ref._projectionFilters = {};
        host = el.parentElement;
        if (!host.observer) {
            host.observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (record) {
                    var target = record.target, attr, srcAttrName, proxyTarget;
                    if (!target.hasAttribute) {
                        target = target.parentElement.closest("[projects]");
                    }
                    if (target && target.hasAttribute("projects")) {
                        for (var i=0; i<target.attributes.length; i++) {
                            attr = target.attributes[i];
                            if (attr.name === "projects-clone") {
                                proxyTarget = self.ref._mount.querySelector("#" + attr.value);
                                console.log("clone");
                            } else if (attr.name === "projects-tocontent") {
                                proxyTarget = self.ref._mount.querySelector("#" + attr.value);
                                self._projectElementContent(target, proxyTarget);
                            } else  if (attr.name.indexOf("projects-attribute") === 0 && record.oldValue !== attr.value) {
                                proxyTarget = self.ref._mount.querySelector("#" + attr.value);
                                srcAttrName = attr.name.replace("projects-attribute-", "");
                                if (attr.name.indexOf("-tocontent") !== -1) {
                                    self._projectAttribute(target, srcAttrName.replace("-tocontent",""), proxyTarget);
                                } else {
                                    self._projectAttribute(target, srcAttrName.replace(/-to-.*/,""), proxyTarget, srcAttrName.replace("-to-", ""));
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
    };

    Object.defineProperties(window._MountProjector.prototype, {
        _projectAttribute: {
            value: function (element, sourceAttr, targetElement, destAttrOrCb, optionalCb) {
                var sourceVal = element.getAttribute(sourceAttr);
                var destAttr = (typeof destAttrOrCb === "string") ? destAttrOrCb : null;
                var filter, projects = "projects-attribute-" + sourceAttr + "-tocontent";
                if (!targetElement) { debugger; }
                if (destAttr) {
                    projects = projects.replace("-to-content", "-to-" + destAttr);
                }
                targetElement.id = targetElement.id || nextUid();
                filter = optionalCb || this.ref._projectionFilters[projects+":"+targetElement.id] || ((destAttrOrCb && typeof destAttrOrCb !== "string") ? destAttrOrCb : noopFilter);
                sourceVal = filter(sourceVal);
                if (destAttr) {
                    targetElement.setAttribute(destAttr, sourceVal);
                } else {
                    targetElement.innerHTML = sourceVal;
                }
                if (!element.hasAttribute(projects)) {
                    element.setAttribute(projects, targetElement.id);
                    element.setAttribute("projects", "");
                    this.ref._projectionFilters[projects+":"+targetElement.id] = filter;
                }
            }
        },
        _projectElementContent: {
            value: function (element, targetElement, cb) {
                var filter, html;
                if (!targetElement) { debugger; }
                targetElement.id = targetElement.id || nextUid();
                filter = cb || this.ref._projectionFilters["projects-tocontent:" + targetElement.id] || noopFilter;
                html = filter(element.innerHTML);
                targetElement.innerHTML = html;
                if (!element.hasAttribute("projects-tocontent")) {
                    element.setAttribute("projects-tocontent", targetElement.id);
                    element.setAttribute("projects", "");
                    this.ref._projectionFilters["projects-tocontent:" + targetElement.id] = filter;
                }
            }
        },
        _projectElementClone: {
            value: function (element, targetElement, cb) {
                var clone, filter;
                if (!targetElement) { debugger; }
                targetElement.innerHTML = "";
                targetElement.id = targetElement.id || nextUid();
                filter = cb || this.ref._projectionFilters["projects-clone:" + targetElement.id] || noopFilter;
                // TODO: deal with id/idrefs
                if (element) {
                    clone = filter(element.cloneNode(true));
                    clone.style.display = "";
                    targetElement.appendChild(clone);
                    if (!element.hasAttribute("projects-clone")) {
                        element.setAttribute("projects-clone", targetElement.id);
                        element.setAttribute("projects", "");
                        this.ref._projectionFilters["projects-clone:" + targetElement.id] = filter;
                    }
                }
            }
        }
    });
}());
