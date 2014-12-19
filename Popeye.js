(function (window) {
    'use strict';

    /**
     * Module dependencies
     */
    var on = (window.addEventListener !== undefined) ? 'addEventListener' : 'attachEvent',
        off = (window.removeEventListener !== undefined) ? 'removeEventListener' : 'detachEvent',
        scrollEvent = (on === 'attachEvent') ? 'onscroll' : 'scroll',
        clickEvent = (on === 'attachEvent') ? 'onclick' : 'click',
        loadEvent = (on === 'attachEvent') ? 'onload' : 'load',
        requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000, 60);
                };
        }()),
        cancelAnimFrame = (function () {
            return window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame;
        }()),
        document = window.document,
        rAFId,
        // http://gizma.com/easing/#quad3
        easeInOut = function (time, start, change, duration) {
            time /= duration / 2;
            if (time < 1) {
                return (change / 2 * time * time) + start;
            }
            time -= 1;
            return -change / 2 * (time * (time - 2) - 1) + start;
        };


    /**
     * Create an animated navigation between anchors
     */
    function Popeye(options) {

        this._sections = {};
        this._selector = (typeof options === 'string') ? options : options.navigate;
        this._within = (options.within !== undefined) ? document.querySelector(options.within) : false;

        this._init();

        return this;
    }


    /**
     * Initialize the navigation engine
     * @private
     */
    Popeye.prototype._init = function () {
        var that = this,
            scrolledArea =  this._within || window;

        this._configure();

        document[on](clickEvent, function (event) { that._click(event); }, false);

        scrolledArea[on](scrollEvent, function () {
            if (!that._animating) {
                that._hashCurrentSection();
            }
        }, false);

        // when page is scrolled bind goToSection to move automatically
        if (window.pageYOffset !== 0) {
            window[on](loadEvent, function () {  }, false);
        }

    };

    /**
     * Configures the sectiong
     * @private
     */
    Popeye.prototype._configure = function () {

        var i,
            // cachear document
            collection = document.querySelectorAll(this._selector),
            collectionLenght = collection.length,
            sectionName,
            sectionLink,
            sectionOffset,
            offsetTop;

        for (i = 0; collectionLenght > i; i += 1) {
            sectionLink = collection[i];

            // get the name
            sectionName = sectionLink.getAttribute('href').substring(1);
            // asign the name it will be used on click event
            sectionLink.setAttribute('data-Popeye', sectionName);

            // get the offsets
            sectionOffset = document.getElementById(sectionName);
            offsetTop = sectionOffset.offsetTop;

            this._sections[sectionName] = {
                'offsetTop': offsetTop,
                'offsetBottom': offsetTop + sectionOffset.offsetHeight
            };

        }

    };

    /**
     * Hash the current viewing section
     * @private
     */
    Popeye.prototype._hashCurrentSection = function () {
        var offset = ((this._within) ? (this._within.scrollTop  - this._within.offsetTop) : window.pageYOffset),
            sectionName,
            currentSection;

        for (sectionName in this._sections) {
            currentSection = this._sections[sectionName];

            if (offset >= currentSection.offsetTop && offset < currentSection.offsetBottom) {
                window.location.hash = '#!/' + sectionName;
                break;
            }
        }
    };

    /**
     * Hash the current viewing section
     * @private
     */
    Popeye.prototype._click = function (event) {
        event.preventDefault();

        var that = this,
            target = event.target || event.srcElement,
            sectionName = target.getAttribute('data-Popeye'),
            move = 0,
            step = 0,
            pageYOffset,
            duration = 20,
            gap;

        function s() {
            gap = easeInOut(step, pageYOffset, move, duration) - ((that._within) ? that._within.scrollTop : window.pageYOffset);

            if (that._within) {
                that._within.scrollTop += gap;
            } else {
                window.scrollBy(0, gap);
            }

            if (step >= duration) {
                cancelAnimFrame(rAFId);
                // search for History API
                window.location.hash = '#!/' + sectionName;
                that._animating = false;
            } else {
                rAFId = requestAnimFrame(s);
                step += 1;
            }
        }

        if (target.nodeName === 'A' && sectionName !== null) {
            pageYOffset = (this._within) ? this._within.scrollTop : window.pageYOffset;
            move = this._sections[sectionName].offsetTop - pageYOffset;
            this._animating = true;
            s();
        }
    };

    // dont export direct to the window
    window.Popeye = Popeye;

}(this));