/*
 * ScrollSpy JavaScript Library v1.0.0
 * https://scrollspy.github.io
 *
 * Note : this source code is written in ES6 Standard which is not supported in old browsers
 * Alternatively you could use the JS file in the test folder which is compiled with babel for all browsers
 *
 */
"use strict";

function ScrollSpy(
    settings = {
        contexts_class: 'scrollspy',
        delay: 200,
        callbackOnChange: () => {},
        callbackOnDestroy: () => {}
    }
) {

    let callback_OnChange = (typeof settings['callbackOnChange'] !== 'undefined') ? settings['callbackOnChange'] : () => {},
        callback_OnDestroy = (typeof settings['callbackOnDestroy'] !== 'undefined') ? settings['callbackOnDestroy'] : () => {},
        delay = settings['delay'],
        page_visible_height = window.innerHeight,
        SpySections = [],
        indicator_settings_saved = [],
        CurrentPositionTop = -1,
        lastItemPercent = -1,
        lastScrollFireTime = 0,
        scrollTimer,
        fakePercent = true,
        firstScroll = true,
        ForceActiveIndicator = false,
        hasIndicator = false;

    const self = {

        "destroy": (callbackOnDestroy = callback_OnDestroy) => {
            DestroyOnScrollEvent(callbackOnDestroy());
        },

        Indicator: (settings_indicator = {
            element: null,
            indicator_container_class: '',
            indicator_item_class: '',
            clickable: true,
            forceActive: false,
        }) => {

            indicator_settings_saved = settings_indicator;

            ForceActiveIndicator = settings_indicator['forceActive'];

            if (settings_indicator['element'] !== null || typeof settings_indicator['element'] !== 'undefined') {

                settings_indicator['element'].innerHTML = '';

                let indicator = document.createElement('ul');

                indicator.classList.add('scrollspy-indicator-container');

                if (typeof settings_indicator['indicator_container_class'] !== 'undefined') {
                    indicator.classList.add(settings_indicator['indicator_container_class']);
                }

                settings_indicator['element'].appendChild(indicator);

                Array.prototype.forEach.call(SpySections, (element) => {
                    let indicator_item = document.createElement('li');

                    if (typeof settings_indicator['indicator_item_class'] !== 'undefined') {
                        indicator_item.classList.add(settings_indicator['indicator_item_class']);
                    }

                    indicator_item.innerHTML = element[0].getAttribute('spy-title');
                    indicator.appendChild(indicator_item);

                    if (settings_indicator['clickable'] !== false) {
                        indicator_item.classList.add('spy-clickable');

                        indicator_item.onclick = (event) => {

                            Array.prototype.forEach.call(SpySections, (element) => {

                                if (element[1] === event.target) {

                                    ScrollToSection(element[0]);

                                }

                            });

                        };
                    }

                    element.push(indicator_item);
                });


                hasIndicator = true;

            }
        }

    };

    const CheckIsInView = (element, ScrollPos = ScrollPosition()) => {

        return ((element.offsetTop > ScrollPos[0]) && (element.offsetTop < ScrollPos[1])) || (((element.offsetTop + element.offsetHeight) > ScrollPos[0]) && ((element.offsetTop + element.offsetHeight) < ScrollPos[1])) || ((element.offsetTop < ScrollPos[0]) && ((element.offsetTop + element.offsetHeight) > ScrollPos[1]));

    };

    const GetVisibilityPercent = (element, ScrollPos = ScrollPosition()) => {

        if (CheckIsInView(element, ScrollPos)) {

            let item_top = element.offsetTop;
            let item_height = element.offsetHeight;
            let item_bottom = item_top + item_height;

            let page_top = ScrollPos[0];
            let page_bottom = ScrollPos[1];

            let visible_pixels = 0;

            if ((item_top >= page_top) && (item_bottom <= page_bottom)) {
                visible_pixels = item_height;
            }

            if ((item_top < page_top) && (item_bottom <= page_bottom)) {
                visible_pixels = item_bottom - page_top;
            }

            if ((item_top >= page_top) && (item_bottom > page_bottom)) {
                visible_pixels = page_bottom - item_top;
            }

            if ((item_top < page_top) && (item_bottom > page_bottom)) {
                visible_pixels = page_bottom - page_top;
            }

            return Math.round(((visible_pixels / page_visible_height) * 100));

        } else {

            return 0;

        }

    };

    const GetVisibilityDistanceFromCenter = (element, ScrollPos = ScrollPosition()) => {

        if (CheckIsInView(element, ScrollPos)) {

            let item_top = element.offsetTop;
            let item_height = element.offsetHeight;
            let item_bottom = item_top + item_height;

            let page_top = ScrollPos[0];
            let page_center = page_top + (page_visible_height / 2);

            let distance_from_center = 0;

            if ((item_top < page_center) && (item_bottom < page_center)) {
                distance_from_center = page_center - item_bottom;
            }

            if ((item_top >= page_center) && (item_bottom > page_center)) {
                distance_from_center = item_bottom - page_center;
            }

            if ((item_top <= page_center) && (item_bottom >= page_center)) {
                distance_from_center = 0;
            }

            return distance_from_center;

        } else {

            return 0;

        }

    };

    const ScrollPosition = () => {
        if (window.pageYOffset !== undefined) {
            return [pageYOffset, (pageYOffset + page_visible_height)];
        } else {
            let page_y_top_offset, page_y_bottom_offset;
            page_y_top_offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
            page_y_bottom_offset = page_y_top_offset + page_visible_height;
            return [page_y_top_offset, page_y_bottom_offset];
        }
    };

    const ScrollToSection = (element) => {
        let offset;

        if (element.offsetHeight > page_visible_height) {
            offset = element.offsetTop - 24;
        } else {
            offset = element.offsetTop - ((page_visible_height - element.offsetHeight) / 2);
        }

        window.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
    };

    const OnScroll = (force = false) => {

        let minScrollTime = delay;
        let now = new Date().getTime();

        const processScroll = () => {

            let ScrollPos = ScrollPosition(),
                StagesPositionPercentage = [],
                currentElement = null,
                currentIndicator = null;

            Array.prototype.forEach.call(SpySections, (element) => {

                let Percent = [element[0].offsetTop, GetVisibilityPercent(element[0], ScrollPos)];

                if (Percent[1] !== 0) {
                    StagesPositionPercentage.push(Percent);
                }

            });

            if (StagesPositionPercentage.length === 0) {
                StagesPositionPercentage[0] = [0, 0];
                StagesPositionPercentage[1] = [0, 0];
                fakePercent = true;

                if (hasIndicator && !(ForceActiveIndicator)) {

                    Array.prototype.forEach.call(SpySections, (element) => {
                        element[1].classList.remove('spy-active');
                    });

                    fakePercent = false;
                    currentIndicator = -1;
                }

            } else {
                fakePercent = false;
            }

            if (StagesPositionPercentage.length === 1) {
                StagesPositionPercentage[1] = [0, 0];
            }


            let max = StagesPositionPercentage.reduce((a, b) => {
                return Math.max(a[1], b[1]);
            });

            if (isNaN(max)) {

                let TempStagesPositionPercentage = [];

                Array.prototype.forEach.call(StagesPositionPercentage, (objectPositionPercentage) => {

                    Array.prototype.forEach.call(SpySections, (element) => {

                        if (element[0].offsetTop === objectPositionPercentage[0]) {


                            let DistanceFromCenter = [element[0].offsetTop, GetVisibilityDistanceFromCenter(element[0], ScrollPos)];

                            if (!(TempStagesPositionPercentage.includes(DistanceFromCenter))) {
                                TempStagesPositionPercentage.push(DistanceFromCenter);
                            }

                        }

                    });

                });

                TempStagesPositionPercentage.reduce((a, b) => {
                    if (typeof a !== 'undefined' && typeof b != "undefined") {
                        max = (Math.min(a[1], b[1]));
                    }
                });

                StagesPositionPercentage = TempStagesPositionPercentage;

            }

            if (max !== lastItemPercent) {

                lastItemPercent = max;
                Array.prototype.forEach.call(StagesPositionPercentage, (objectPositionPercentage) => {

                    if (firstScroll && !(fakePercent)) {
                        objectPositionPercentage[1] = max;
                        firstScroll = false;
                        CurrentPositionTop = 0;
                        lastItemPercent = 0;
                    }

                    if (objectPositionPercentage[1] === max && objectPositionPercentage[0] !== CurrentPositionTop && !(fakePercent)) {

                        CurrentPositionTop = objectPositionPercentage[0];

                        Array.prototype.forEach.call(SpySections, (element) => {

                            if (element[0].offsetTop === objectPositionPercentage[0]) {

                                currentElement = element[0];
                                currentIndicator = element[1];
                            }

                        });

                        if (hasIndicator && currentIndicator !== -1) {

                            Array.prototype.forEach.call(SpySections, (element) => {
                                element[1].classList.remove('spy-active');
                            });

                            currentIndicator.classList.add('spy-active');

                        }

                        if (currentElement !== null && typeof currentElement !== 'undefined') {
                            callback_OnChange(currentElement);
                        }

                    }

                });

            }


        };

        if (!scrollTimer && !(force)) {
            if (now - lastScrollFireTime > (3 * minScrollTime)) {
                processScroll(); // fire immediately on first scroll
                lastScrollFireTime = now;
            }
            scrollTimer = setTimeout(() => {
                scrollTimer = null;
                lastScrollFireTime = new Date().getTime();
                processScroll();
            }, minScrollTime);
        } else {
            processScroll();
        }

    };

    const OnWindowResize = () => {
        if (page_visible_height !== window.innerHeight) {
            page_visible_height = window.innerHeight;
            Initialize();
            self.Indicator(indicator_settings_saved);
        }
    };

    const InitializeOnScrollEvent = () => {

        let SpySectionsObject = document.getElementsByClassName(settings['contexts_class']);
        let SpySectionsUnfiltered = [];

        Array.prototype.forEach.call(SpySectionsObject, (object) => {
            SpySectionsUnfiltered[object.offsetTop] = object;
        });

        SpySectionsObject = null;

        SpySectionsUnfiltered = SpySectionsUnfiltered.filter((element) => {
            return element !== undefined;
        });

        Array.prototype.forEach.call(SpySectionsUnfiltered, (item) => {

            let SpySection = [item];

            if (!(SpySections.includes(SpySection))) {

                SpySections.push(SpySection);

            }

        });

        SpySectionsUnfiltered = null;

        document.addEventListener("scroll", OnScroll);
        window.addEventListener("resize", OnWindowResize);
    };

    const Initialize = (callbackOnChange = callback_OnChange()) => {

        SpySections = [];

        if (typeof callbackOnChange !== 'undefined') {
            callback_OnChange = callbackOnChange;
        }

        InitializeOnScrollEvent();

    };

    const DestroyOnScrollEvent = (callbackOnDestroy = () => {}) => {
        document.removeEventListener("scroll", OnScroll);

        if (hasIndicator) {
            indicator_settings_saved['element'].innerHTML = '';
        }

        delay = null;
        page_visible_height = null;
        SpySections = null;
        CurrentPositionTop = null;
        lastItemPercent = null;
        fakePercent = null;
        firstScroll = null;
        hasIndicator = null;
        indicator_settings_saved = null;

        callbackOnDestroy();
    };

    Initialize(callback_OnChange);

    OnScroll();

    return self;

}