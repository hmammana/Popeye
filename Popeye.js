(function (window) {
    'use strict';

    /**
     * Module dependencies
     */
    var on = (window.addEventListener !== undefined) ? 'addEventListener' : 'attachEvent',
        off = (window.removeEventListener !== undefined) ? 'removeEventListener' : 'detachEvent',
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
        animID,
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
    function Popeye(selector) {

        this._sections = {};
        this._selector = selector;

        this._init();

        return this;
    }


    /**
     * Initialize the navigation engine
     * @private
     */
    Popeye.prototype._init = function () {
        var that = this;

        this._configure();

        document[on]('click', function (event) { that._click(event); }, false);

        window[on]('scroll', function () { that._hashCurrentSection(); }, false);

        // when page is scrolled bind goToSection to move automatically
        if (window.pageYOffset !== 0) {
            window[on]('load', function () {  }, false);
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
            sectionOffset;

        for (i = 0; collectionLenght > i; i += 1) {
            sectionLink = collection[i];

            // get the name
            sectionName = sectionLink.getAttribute('href').substring(1);
            // asign the name it will be used on click event
            sectionLink.setAttribute('data-Popeye', sectionName);

            // get the offsets
            sectionOffset = document.getElementById(sectionName).getBoundingClientRect();

            this._sections[sectionName] = {
                'offsetTop': sectionOffset.top,
                'offsetBottom': sectionOffset.bottom
            };

        }

    };

    /**
     * Hash the current viewing section
     * @private
     */
    Popeye.prototype._hashCurrentSection = function () {
        var offset = window.pageYOffset,
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

        var target = event.target || event.srcElement,
            sectionName = target.getAttribute('data-Popeye'),
            move = 0,
            step = 0,
            pageYOffset,
            duration = 20,
            s = function () {

                window.scrollBy(0, easeInOut(step, pageYOffset, move, duration) - window.pageYOffset);

                if (step >= duration) {
                    cancelAnimFrame(animID);
                } else {
                    animID = requestAnimFrame(s);
                    step += 1;
                }
            };

        if (target.nodeName === 'A' && sectionName !== undefined) {
            // search for History API
            window.location.hash = '#!/' + sectionName;
            pageYOffset = window.pageYOffset;
            move = this._sections[sectionName].offsetTop - pageYOffset;
            s();
        }
    };

    // dont export direct to the window
    window.Popeye = Popeye;

}(this));