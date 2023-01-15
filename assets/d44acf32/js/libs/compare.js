jQuery(document).ready(function ($) {
    var dragging = false,
        scrolling = false,
        resizing = false;
    //cache jQuery objects
    var imageComparisonContainers = $('.compare-slider-container');
    //check if the .compare-slider-container is in the viewport
    //if yes, animate it
    checkPosition(imageComparisonContainers);
    $(window).on('scroll', function () {
        if (!scrolling) {
            scrolling = true;
            ( !window.requestAnimationFrame )
                ? setTimeout(function () {
                    checkPosition(imageComparisonContainers);
                }, 100)
                : requestAnimationFrame(function () {
                    checkPosition(imageComparisonContainers);
                });
        }
    });

    //make the .cd-handle element draggable and modify .compare-slider-content width according to its position
    imageComparisonContainers.each(function () {
        var actual = $(this);
        drags(actual.find('.cd-handle'), actual.find('.compare-slider-content'), actual, actual.find('.featuresWrapper:not(.grey) .tpl-label'), actual.find('.featuresWrapper.grey .tpl-label'));
    });

    //upadate images label visibility
    $(window).on('resize', function () {
        if (!resizing) {
            resizing = true;
            ( !window.requestAnimationFrame )
                ? setTimeout(function () {
                    checkLabel(imageComparisonContainers);
                }, 100)
                : requestAnimationFrame(function () {
                    checkLabel(imageComparisonContainers);
                });
        }
    });

    function checkPosition(container) {
        container.each(function () {
            var actualContainer = $(this);
            // if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
            actualContainer.addClass('is-visible');
            // }
        });

        scrolling = false;
    }

    function checkLabel(container) {
        container.each(function () {
            var actual = $(this);
            updateLabel(actual.find('.featuresWrapper.grey .tpl-label'), actual.find('.compare-slider-content'), 'left');
            updateLabel(actual.find('.featuresWrapper:not(.grey) .tpl-label'), actual.find('.compare-slider-content'), 'right');
        });

        resizing = false;
    }

    //draggable funtionality - credits to http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
    function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
        dragElement.on("mousedown vmousedown", function (e) {
            dragElement.addClass('draggable');
            resizeElement.addClass('resizable');


            var delta = 100;
            if ($(window).width() < 1024) {
                delta = 50;
            }

            var dragWidth = dragElement.outerWidth(),
                // xPosition = dragElement.offset().left + dragWidth - e.pageX,
                xPosition = 0,
                containerOffset = container.offset().left,
                containerWidth = container.outerWidth(),
                minLeft = containerOffset + delta - (dragWidth / 2),
                maxLeft = containerOffset + containerWidth - delta - (dragWidth / 2);
            // minLeft = containerOffset - dragWidth,
            // maxLeft = containerOffset + containerWidth + dragWidth;
            // minLeft = containerOffset + 10,
            // maxLeft = containerOffset + containerWidth - dragWidth - 10;

            dragElement.parents().on("mousemove vmousemove", function (e) {
                if (!dragging) {
                    dragging = true;
                    ( !window.requestAnimationFrame )
                        ? setTimeout(function () {
                            animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);
                        }, 100)
                        : requestAnimationFrame(function () {
                            animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);
                        });
                }
            }).on("mouseup vmouseup", function (e) {
                dragElement.removeClass('draggable');
                resizeElement.removeClass('resizable');
            });
            e.preventDefault();
        }).on("mouseup vmouseup", function (e) {
            dragElement.removeClass('draggable');
            resizeElement.removeClass('resizable');
        });
    }

    function animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement) {
        var leftValue = e.pageX + xPosition - dragWidth / 2 + 1;
        //constrain the draggable element to move inside his container
        if (leftValue < minLeft) {
            leftValue = minLeft;
        } else if (leftValue > maxLeft) {
            leftValue = maxLeft;
        }

        var widthValue = (leftValue + dragWidth / 2 - containerOffset) * 100 / containerWidth + '%';

        $('.draggable').css('left', widthValue).on("mouseup vmouseup", function () {
            $(this).removeClass('draggable');
            resizeElement.removeClass('resizable');
        });

        $('.resizable').css('width', widthValue);

        updateLabel(labelResizeElement, resizeElement, 'left');
        updateLabel(labelContainer, resizeElement, 'right');
        dragging = false;
    }

    $('.mainWrapper section.sideBySide .featuresWrapper.grey .featureColumn .feature .contentWrapper .title,' +
        '.mainWrapper section.sideBySide .featuresWrapper.grey .featureColumn .feature .contentWrapper .text').each(function (num, el) {
        var text = $(el).text().trim();
        $(el).text('');
        for (var i in text) {
            $(el).append('<span>' + text[i] + '</span>');
        }
    });

    function updateLabel(label, resizeElement, position) {
        if (resizeElement.outerWidth() > $('.wishlistTrigger').offset().left + ($('.wishlistTrigger').width() / 2)) {
            $('.wishlistTrigger').addClass('dark');
        } else {
            $('.wishlistTrigger').removeClass('dark');
        }
        if (resizeElement.outerWidth() > $('.cartTrigger').offset().left + ($('.cartTrigger').width() / 2)) {
            $('.cartTrigger').addClass('dark');
        } else {
            $('.cartTrigger').removeClass('dark');
        }

        if (!resizeElement.outerWidth()) {
            return;
        }
        if (position == 'left') {
            // ( label.offset().left + label.outerWidth() < resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('centered') : label.addClass('centered');
            ( resizeElement.outerWidth() < $('section.sideBySide .imageColumn').offset().left ) ? label.addClass('centered') : label.removeClass('centered');
        } else {
            ( resizeElement.outerWidth() > $('section.sideBySide .imageColumn').offset().left + $('section.sideBySide .imageColumn').outerWidth()) ? label.addClass('centered') : label.removeClass('centered');
        }
    }
});