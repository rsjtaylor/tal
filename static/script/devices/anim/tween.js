/**
 * @fileOverview Requirejs modifier for animations based on scroll offsets
 *
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
 * (http://www.bbc.co.uk) and TAL Contributors (1)
 *
 * (1) TAL Contributors are listed in the AUTHORS file and at
 *     https://github.com/fmtvp/TAL/AUTHORS - please extend this file,
 *     not this notice.
 *
 * @license Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * All rights reserved
 * Please contact us for an alternative licence
 */

require.def(
    'antie/devices/anim/tween',
    [
        'antie/devices/browserdevice',
        'antie/lib/tween',
        'antie/devices/anim/shared/transitionendpoints'
    ],
    function (Device, TWEEN, TransitionEndPoints) {
        var fps = 50;
        function startAnimationLoop() {
            function animFrameLoop() {
                TWEEN.update();
                window.requestAnimationFrame(animFrameLoop);
            }

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(animFrameLoop);
            } else {
                window.setInterval(TWEEN.update, 1000 / fps);
                TWEEN.update();
            }
        }

        startAnimationLoop();

        var easingMap = {
            'linear'            : ['Linear', 'None'],
            // Penner equations
            'easeInCubic'       : ['Cubic', 'In'],
            'easeOutCubic'      : ['Cubic', 'Out'],
            'easeInOutCubic'    : ['Cubic', 'InOut'],
            'easeInCirc'        : ['Circular', 'In'],
            'easeOutCirc'       : ['Circular', 'Out'],
            'easeInOutCirc'     : ['Circular', 'InOut'],
            'easeInExpo'        : ['Exponential', 'In'],
            'easeOutExpo'       : ['Exponential', 'Out'],
            'easeInOutExpo'     : ['Exponential', 'InOut'],
            'easeInQuad'        : ['Quadratic', 'In'],
            'easeOutQuad'       : ['Quadratic', 'Out'],
            'easeInOutQuad'     : ['Quadratic', 'InOut'],
            'easeInQuart'       : ['Quartic', 'In'],
            'easeOutQuart'      : ['Quartic', 'Out'],
            'easeInOutQuart'    : ['Quartic', 'InOut'],
            'easeInQuint'       : ['Quintic', 'In'],
            'easeOutQuint'      : ['Quintic', 'Out'],
            'easeInOutQuint'    : ['Quintic', 'InOut'],
            'easeInSine'        : ['Sinusoidal', 'In'],
            'easeOutSine'       : ['Sinusoidal', 'Out'],
            'easeInOutSine'     : ['Sinusoidal', 'InOut'],
            'easeInBack'        : ['Back', 'In'],
            'easeOutBack'       : ['Back', 'Out'],
            'easeInOutBack'     : ['Back', 'InOut'],
            // we use easeFromTo for some reason which is the same as easeInOutQuart
            'easeFromTo'    : ['Quartic', 'InOut']
        };

        Device.prototype._tween = function (options) {
            var self = this;

            function update() {

                var prop, unit, styleValue;
                for (prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        unit = options.units ? options.units[prop] : TransitionEndPoints.defaultUnits[prop];
                        unit = unit || "";
                        styleValue = this[prop] + unit;
                        options.el.style.setProperty(prop, styleValue, '');
                    }
                }
            }

            function start() {
                if (options.className) {
                    self.removeClassFromElement(options.el, "not" + options.className);
                    self.addClassToElement(options.el,  options.className);
                }
                self.removeClassFromElement(self.getTopLevelElement(), "notanimating");
                self.addClassToElement(self.getTopLevelElement(), "animating");
                if (options.onStart) {
                    options.onStart();
                }
            }

            function end() {
                if (options.className) {
                    self.removeClassFromElement(options.el, options.className);
                    self.addClassToElement(options.el, "not" + options.className);
                }
                self.removeClassFromElement(self.getTopLevelElement(), "animating");
                self.addClassToElement(self.getTopLevelElement(), "notanimating");

                // Fire client callback if it exists
                if (typeof options.onComplete === 'function') {
                    options.onComplete();
                }
            }

            var anim = new TWEEN.Tween(options.from).to(options.to, options.duration);
            anim.onUpdate(update);
            anim.onStart(start);
            anim.onComplete(end);
            var easingRoute = ['Linear', 'None'];
            if (options.easing) {
                easingRoute = easingMap[options.easing] || easingRoute;
            }
            var easing, i;
            easing = TWEEN.Easing;
            for (i = 0; i !== easingRoute.length; i += 1) {
                easing = easing[easingRoute[i]];
            }
            anim.easing(easing);
            anim.start();

            return anim;
        };
    }
);