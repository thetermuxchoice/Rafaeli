/**
 * Created by VuZ on 07.10.15.
 */
$(document).ready(function () {

    $.widget("custom.combobox", {
        _create: function () {
            this.wrapper = $("<span>")
                .addClass("custom-combobox")
                .insertAfter(this.element);

            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
        },

        _createAutocomplete: function () {
            var selected = this.element.children(":selected"),
                value = selected.val() ? selected.text() : "";
            // value = selected.text();

            this.input = $("<input>")
                .appendTo(this.wrapper)
                .val(value)
                .attr("title", "")
                .attr("placeholder", "SEARCH")
                .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
                .autocomplete({
                    appendTo: '.mainSelectWrapper .autocompleteWrapper',
                    delay: 0,
                    minLength: 0,
                    source: $.proxy(this, "_source"),
                    open: function () {
                        $('.mainSelectWrapper .ui-selectmenu-text, .mainSelectWrapper .ui-menu-item-wrapper').each(function (num, el) {
                            if (!$(el).find('.count').length) {
                                var html = $(el).html().trim().split('(');
                                if (html.length == 1) {
                                    html = html[0] + ' <span class="count">(0)</span>';
                                } else {
                                    html = html[0] + ' <span class="count">(' + html[1] + '</span>';
                                }
                                $(el).html(html);
                            }
                        });
                        $('.mainSelectWrapper').addClass('opened');
                        setTimeout(function () {
                            $('.ui-selectmenu-menu,.autocompleteWrapper').scrollTop(1);
                            $('.ui-selectmenu-menu,.autocompleteWrapper').scrollTop(0);
                        }, 500);
                    },
                    close: function () {
                        $('.mainSelectWrapper').removeClass('opened');
                    }
                })
                .focus(function () {
                    $(this).autocomplete("search", $(this).val());
                })
            // .tooltip({
            //     classes: {
            //         "ui-tooltip": "ui-state-highlight"
            //     }
            // });

            this._on(this.input, {
                autocompleteselect: function (event, ui) {
                    ui.item.option.selected = true;
                    this._trigger("select", event, {
                        item: ui.item.option
                    });
                },

                autocompletechange: "_removeIfInvalid"
            });
        },

        _createShowAllButton: function () {
            var input = this.input,
                wasOpen = false;

            $("<a>")
                .attr("tabIndex", -1)
                .attr("title", "Show All Items")
                // .tooltip()
                .appendTo(this.wrapper)
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass("ui-corner-all")
                .addClass("custom-combobox-toggle ui-corner-right")
                .on("mousedown", function () {
                    wasOpen = input.autocomplete("widget").is(":visible");
                })
                .on("click", function () {
                    input.trigger("focus");

                    // Close if already visible
                    if (wasOpen) {
                        return;
                    }

                    // Pass empty string as value to search for, displaying all results
                    input.autocomplete("search", "");
                });
        },

        _source: function (request, response) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            response(this.element.children("option").map(function () {
                var text = $(this).text();
                if ((!request.term || matcher.test(text)))
                    return {
                        label: text,
                        value: text,
                        option: this
                    };
            }));
        },

        _removeIfInvalid: function (event, ui) {

            // Selected an item, nothing to do
            if (ui.item) {
                return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
                valueLowerCase = value.toLowerCase(),
                valid = false;
            this.element.children("option").each(function () {
                if ($(this).text().toLowerCase() === valueLowerCase) {
                    this.selected = valid = true;
                    return false;
                }
            });

            // Found a match, nothing to do
            if (valid) {
                return;
            }

            // Remove invalid value
            this.input
                .val("")
                .attr("title", value + " didn't match any item")
            // .tooltip("open");
            this.element.val("");
            this._delay(function () {
                // this.input.tooltip("close").attr("title", "");
            }, 2500);
            this.input.autocomplete("instance").term = "";
        },

        _destroy: function () {
            this.wrapper.remove();
            this.element.show();
        }
    });


    window.canMoveSection = function (direction) {
        var $section = $('section.withDraggable.fp-section.active');
        if (!$section.length) {
            return true;
        }
        var ind = $section.find('.textBlock .inner.active').index();
        if (direction == 'up') {
            return true;
            if (ind == 0) {
                return true;
            } else {
                $section.find('.controlWrapper .dropAreas > div').eq(ind - 1).trigger('click');
            }
        } else {
            if (ind == 2) {
                return true;
            } else {
                $section.find('.controlWrapper .dropAreas > div').eq(ind + 1).trigger('click');
            }
        }
        return false;
    };

    var setDesktopView = function () {
        $('.templateDetail .main .about').perfectScrollbar();
        $('.mainWrapper section.templateDetail .infoBlock .tabs > div.policy >div, .mainWrapper section.templateDetail .infoBlock .tabs > div.howToEdit >div').perfectScrollbar();
        if ($('section.templateDetail').length) {
            $('.ratingWrapper').before($('h1.title'));
            $('.ratingWrapper').before($('.categories'));
            $('.ratingWrapper').before($('.about'));
        }
        $('.checkoutWrapper nav').perfectScrollbar('destroy');
    };

    var setMobileView = function () {
        $('.templateDetail .main .about').perfectScrollbar('destroy');
        $('.mainWrapper section.templateDetail .infoBlock .tabs > div.policy >div, .mainWrapper section.templateDetail .infoBlock .tabs > div.howToEdit >div').perfectScrollbar('destroy');

        $('.checkoutWrapper nav').perfectScrollbar({
            suppressScrollY: true
        });

        if ($('.checkoutWrapper nav').length) {
            $('.checkoutWrapper nav').animate({scrollLeft: $('.checkoutWrapper nav a.active').position().left}, 600);
        }

        if ($('section.templateDetail .mobileSlider').length) {
            var swiper = new Swiper('section.templateDetail .mobileSlider.swiper-container', {
                pagination: 'section.templateDetail .mobileSlider .swiper-pagination',
                paginationClickable: true
            });
        }

        if ($('#filter-form').length) {
            var initPosition = $('.templatesStart .counter').offset().top + 42;
            $(window).scroll(function (e) {
                if ($(window).width() < 1023 && $('#filter-form').length) {
                    $.cookie('lastScrollPos', $(window).scrollTop());
                    if ($(window).scrollTop() + 60 > initPosition) {
                        $('#filter-form').addClass('fixed')
                    } else {
                        $('#filter-form').removeClass('fixed');
                    }
                }
            });
        }

        if ($('section.templateDetail').length) {
            $('.backBtn').after($('.categories'));
            $('.backBtn').after($('h1.title'));
            $('.howToEdit').before($('.about'));
        }
    };

    $(window).resize(function () {
        $('.fullHeight').css('height', $(window).height());
        $('.fullWidth').css('width', $(window).width());
        if ($('body').hasClass('loaded')) {

            if ($(window).width() > 1023) {
                if (!$('html').hasClass('fp-enabled')) {
                    $('.mainWrapper.fullpage').fullpage({
                        sectionSelector: 'section',
                        css3: true,
                        scrollingSpeed: 700,
                        easing: 'easeInOutCubic',
                        easingcss3: 'easeInOutCubic',
                        onLeave: function (index, nextIndex, direction) {
                            loaded = false;
                            $('header,footer').addClass('transparent');
                            setTimeout(function () {
                                if (!loaded) {
                                    $('header,footer,.pager,header .actionBtnWrapper').removeClass('light');
                                }
                            }, 300);
                            $('.pager a').removeClass('active');
                            $('.pager a').fadeOut(500);
                            $('.pointer').removeClass('loading resetSpin');
                            clearTimeout(loadingTimeout);
                        },
                        afterLoad: function (anchorLink, index) {
                            loaded = true;
                            var $section = $('.mainWrapper section').eq(index - 1);
                            setTimeout(function () {
                                if (!$section.hasClass('init')) {
                                    $section.addClass('init');
                                }
                                if ($section.hasClass('withDraggable')) {
                                    $section.find('.controlWrapper .dropAreas > div').eq(0).trigger('click');
                                }
                            }, 1);

                            if ($section.data('header') == 'light') {
                                $('header,.pager').addClass('light');
                            }
                            if ($section.data('footer') == 'light') {
                                $('footer').addClass('light');
                            }
                            if ($section.data('action') == 'light') {
                                $('header .actionBtnWrapper').addClass('light');
                            }

                            $('header,footer').removeClass('transparent');

                            $('.pager a').fadeIn(500);
                            $('.pager a').eq(index - 1).addClass('active');


                        },
                    });
                }
                setDesktopView();
            } else {
                if ($('html').hasClass('fp-enabled')) {
                    $.fn.fullpage.destroy('all');
                }
                setMobileView();
            }
        }
    });
    $(window).resize();


    $('img.svg').svgConvert();


    $('.categorySelect').combobox({
        appendTo: '.mainSelectWrapper',
        open: function (event, ui) {

        },
        select: function (event, ui) {
            var html = $(event.currentTarget).find('.ui-menu-item-wrapper').html();
            $('.mainSelectWrapper .ui-selectmenu-text').html(html);
            $('.mainSelectWrapper select').parents('form').submit();
        }
    });

    $('.mainSelectWrapper .ui-selectmenu-text, .mainSelectWrapper .ui-menu-item-wrapper').each(function (num, el) {
        var html = $(el).html().trim().split('(');
        if (html.length == 1) {
            html = html[0] + ' <span class="count">(0)</span>';
        } else {
            html = html[0] + ' <span class="count">(' + html[1] + '</span>';
        }
        $(el).html(html);
    });

    $('.ui-selectmenu-menu,.autocompleteWrapper').perfectScrollbar();

    $('.templateDetail .main .about').perfectScrollbar();
    $('.mainWrapper section.templateDetail .infoBlock .tabs > div.policy >div, .mainWrapper section.templateDetail .infoBlock .tabs > div.howToEdit >div').perfectScrollbar();

    $('section.templateDetail .imgBlock .thumbsList').perfectScrollbar({
        suppressScrollX: true
    });


    var loadingTimeout;

    $(".controlWrapper .pointer").data('drop-ind', 0);

    $(".main .controlWrapper .pointer").draggable({
        containment: ".main .controlWrapper",
        axis: 'y'
    });

    $(".about .controlWrapper .pointer").draggable({
        containment: ".about .controlWrapper",
        axis: 'y'
    });


    var moveDraggable = function ($draggable, $droppable) {
        var index = $droppable.index(),
            oldIndex = $draggable.data("drop-ind"),
            controlPosition = -5,
            $section = $draggable.parents('section');

        clearTimeout(loadingTimeout);
        $draggable.removeClass('loading');
        setTimeout(function () {
            $draggable.addClass('resetSpin').removeClass('loading');
        }, 500);
        setTimeout(function () {
            $draggable.removeClass('resetSpin').addClass('loading');
            var timeout = 10000;
            if ($draggable.parents('section').hasClass('about')) {
                timeout = 20000;
            }
            loadingTimeout = setTimeout(function () {
                if ($draggable.hasClass('ui-draggable-dragging')) {
                    return;
                }
                if (index == 2) {
                    $.fn.fullpage.moveSectionDown();
                    // index = -1;
                } else {
                    $draggable.parents('.controlWrapper').find('.dropAreas > div').eq(index + 1).trigger('click');
                }
            }, timeout);
        }, 600);

        $draggable.data("drop-ind", index);

        switch ($droppable.index()) {
            case 1:
                controlPosition = ($draggable.parents(".controlWrapper").height() - $draggable.height()) / 2
                break;
            case 2:
                $section.find('.scrollBtn').addClass('show');
                controlPosition = $draggable.parents(".controlWrapper").height() - $draggable.height() + 5
                break;
        }
        $draggable.animate({top: controlPosition}, 1000, 'easeInOutQuart');

        if (oldIndex != index) {

            $section.find('.textBlock .inner.active').addClass('hide');
            setTimeout(function () {
                $section.find('.imageBlock .imgWrapper').removeClass('active');
                $section.find('.imageBlock .imgWrapper').eq(index).addClass('active');

                $section.find('.textBlock .inner.active').removeClass('active');
                $section.find('.textBlock .inner').eq(index).addClass('active');
                setTimeout(function () {
                    $section.find('.textBlock .inner').eq(index).removeClass('hide');
                }, 10);
            }, 500);
        }
    };

    $(".controlWrapper .dropAreas > div").droppable({
        drop: function (e, ui) {
            moveDraggable($(ui.draggable), $(this));
        }
    });

    $(document).on('click', '.controlWrapper .dropAreas > div', function (e) {
        e.preventDefault();
        moveDraggable($(e.currentTarget).parents('.controlWrapper').find('.pointer'), $(e.currentTarget));
        return false;
    });

    // $(document).on('click', 'footer .snTrigger', function (e) {
    //     e.preventDefault();
    //     $('footer .snLinks').slideToggle();
    //     return false;
    // });

    $(document).on('click', '.menuTrigger', function (e) {
        e.preventDefault();
        $('body').toggleClass('showMenu');
        $('header,footer').addClass('transparent');
        setTimeout(function () {
            $('header,footer').removeClass('transparent');
        }, 1200);
        return false;
    });

    $(document).on('click', '.templatesWrapper:not(.showList) .templatesList', function (e) {
        e.preventDefault();
        $(e.currentTarget).parents('.templatesWrapper').addClass('showList');
        return false;
    });

    $(document).on('click', '.templatesWrapper .scrollTrigger', function (e) {
        e.preventDefault();
        $(e.currentTarget).parents('.templatesWrapper').addClass('showList');
        return false;
    });

    $('.templatesWrapper').bind('mousewheel', function (event) {
        if (event.originalEvent.wheelDelta >= 0) {
            if ($('.templatesWrapper').hasClass('showList') && $('.templatesList').scrollTop() == 0) {
                $('.templatesWrapper').removeClass('showList');
            }
        } else {
            if (!$('.templatesWrapper').hasClass('showList')) {
                $('.templatesWrapper').addClass('showList');
            }
        }
    });

    $(document).on('click', '.templateDetail .thumbWrapper', function (e) {
        e.preventDefault();
        $(e.currentTarget).siblings().removeClass('active');
        $(e.currentTarget).addClass('active');
        var vcenter = ($('.thumbsList').outerHeight() - $(e.currentTarget).outerHeight()) / 2;
        $('.thumbsList').animate({scrollTop: $('.thumbsList').scrollTop() + ($(e.currentTarget).position().top - vcenter)});
        $('.bigImgWrapper').removeClass('show').addClass('change');
        setTimeout(function () {
            $('.bigImgWrapper img').attr('src', $(e.currentTarget).find('img').attr('src'));
            $('.bigImgWrapper').removeClass('change').addClass('show');
        }, 300);
        return false;
    });

    $(document).on('click', '.navigation a:not(.active)', function (e) {
        e.preventDefault();
        $('.navigation .hint').fadeOut();
        $(e.currentTarget).siblings().removeClass('active');
        $(e.currentTarget).addClass('active');
        $('.navigation .line').width($(e.currentTarget).width());
        $('.navigation .line').css('left', $(e.currentTarget).position().top);
        $('.tabs>div.hide').removeClass('hide');
        $('.tabs>div.active').removeClass('active').addClass('hide');
        $('.tabs>div').eq($(e.currentTarget).index()).addClass('active');
        return false;
    });


    var loaded = false;

    $('.pager').hide();
    $('header,footer').addClass('transparent');


    var afterPreload = function () {
        $('.preloader').fadeOut(500, function () {
            $('.pager').fadeIn(500);
            $('header,footer').removeClass('transparent');
            if ($(window).width() > 1023) {
                $('.mainWrapper.fullpage').fullpage({
                    sectionSelector: 'section',
                    css3: true,
                    scrollingSpeed: 1000,
                    easing: 'easeInOutCubic',
                    easingcss3: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
                    onLeave: function (index, nextIndex, direction) {
                        loaded = false;
                        $('header,footer').addClass('transparent');
                        setTimeout(function () {
                            if (!loaded) {
                                $('header,footer,.pager,header .actionBtnWrapper').removeClass('light');
                            }
                        }, 300);
                        $('.pager a').removeClass('active');
                        $('.pager a').fadeOut(500);
                        $('.pointer').removeClass('loading resetSpin');
                        clearTimeout(loadingTimeout);
                    },
                    afterLoad: function (anchorLink, index) {
                        loaded = true;
                        var $section = $('.mainWrapper section').eq(index - 1);
                        setTimeout(function () {
                            if (!$section.hasClass('init')) {
                                $section.addClass('init');
                            }
                            if ($section.hasClass('withDraggable')) {
                                $section.find('.controlWrapper .dropAreas > div').eq(0).trigger('click');
                            }
                        }, 1);

                        if ($section.data('header') == 'light') {
                            $('header,.pager').addClass('light');
                        }
                        if ($section.data('footer') == 'light') {
                            $('footer').addClass('light');
                        }
                        if ($section.data('action') == 'light') {
                            $('header .actionBtnWrapper').addClass('light');
                        }

                        $('header,footer').removeClass('transparent');

                        $('.pager a').fadeIn(500);
                        $('.pager a').eq(index - 1).addClass('active');


                    },
                });
            } else {
                setMobileView();
            }
            $('body').removeClass('beforePreload').addClass('loaded');


            if ($('.mainWrapper section.templateDetail .infoBlock .navigation .hint').length) {
                setTimeout(function () {
                    $('.mainWrapper section.templateDetail .infoBlock .navigation .hint').fadeOut();
                }, 6000);
            }
        });

        if (typeof bannerDelay != 'undefined') {
            if ($.cookie('bannerShown') != 'true') {
                setTimeout(function () {
                    $('.bannerWrapper').fadeIn('slow');
                    $.cookie('bannerShown', true, {
                        path: '/',
                        expires: 7
                    });
                }, bannerDelay);
            }
        }
    };

    $('#circle').circleProgress({
        value: 0,
        startAngle: -Math.PI / 2,
        size: 150,
        thickness: 2,
        fill: $('body').hasClass('firstPage') ? "#ffffff" : "#181818",
        emptyFill: "rgba(0,0,0,0)",
        animation: {duration: 500, easing: "easeOutCubic"}
    });

    if ($('body').hasClass('firstPage')) {

        $('.preloader .text >div').first().addClass('show');
        setTimeout(function () {
            var $cur = $('.preloader .text >div.show');
            $cur.removeClass('show');
            setTimeout(function () {
                $cur.next().addClass('show');
                setTimeout(function () {
                    $('body').jpreLoader({}, function () {
                        setTimeout(function () {
                            var $ncur = $('.preloader .text >div.show');
                            $ncur.removeClass('show');
                            setTimeout(function () {
                                $ncur.next().addClass('show');
                                $('#circle').circleProgress('value', 0);
                                setTimeout(function () {
                                    afterPreload();
                                }, 1500);
                            }, 1000);
                        }, 1000);
                    });
                }, 1000);
            }, 1000);
        }, 1000);
    } else {
        $('body').jpreLoader({}, function () {
            setTimeout(function () {
                afterPreload();
            }, 1000);
        });
    }


    $('.cartWrapper .itemsWrapper').perfectScrollbar({
        suppressScrollY: true
    });

    $(document).on('click', '.addFormattingPopup .cancelBtn', function (e) {
        e.preventDefault();
        $('.addFormattingPopup').fadeOut('slow');
        return;
    });

    $(document).on('click', '.toCartBtn', function (e) {
        e.preventDefault();
        var $el = $(e.currentTarget),
            url = $el.attr('href');
        if ($el.hasClass('formatting')) {
            if ($el.parents('.addFormattingPopup').find('#formatting_cb').prop('checked')) {
                url += '?formatting_price=' + $el.data('formatting');
            }
            $('.addFormattingPopup').fadeOut('slow');
        } else {

            if ($el.data('formatting')) {
                $('.addFormattingPopup').find('.formattingInfo.main').show();
            } else {
                $('.addFormattingPopup').find('.formattingInfo.main').hide();
            }

            $('.addFormattingPopup').find('.imgWrapper img').attr('src', $el.data('img'));
            $('.addFormattingPopup').find('.productInfo .title').html($el.data('title'));
            $('.addFormattingPopup').find('.productInfo .price').html($el.data('price'));
            $('.addFormattingPopup').find('.formattingInfo .price .value').html($el.data('formatting-html'));
            $('.addFormattingPopup').find('.toCartBtn').attr('href', url).data('formatting', $el.data('formatting'));
            $('.addFormattingPopup').find('.formattingInfo input[type=checkbox]').prop('checked', false);
            $('.addFormattingPopup').fadeIn('slow');
            return;
        }
        $.get(url, function (data) {
            $('.cartWrapper').html(JSON.parse(data).cart);
            $('.cartWrapper .itemsWrapper').perfectScrollbar({
                suppressScrollY: true
            });
            $('.notify div').text('CV has been added to your cart');
            $('.notify').addClass('show');
            $('.cartTrigger').addClass('added');
            setTimeout(function () {
                $('.cartTrigger .counter').html(JSON.parse(data).count ? JSON.parse(data).count : '');
                $('.cartTrigger').removeClass('added');
                $('.notify').removeClass('show');
                $('body').addClass('showCart');
            }, 2000);
        });
        return false;
    });

    $(document).on('click', '.removeFromCart', function (e) {
        e.preventDefault();
        var url = $(e.currentTarget).attr('href');
        $.get(url, function (data) {
            $('.cartWrapper').html(JSON.parse(data).cart);
            $('.cartWrapper .itemsWrapper').perfectScrollbar({
                suppressScrollY: true
            });
            $('.cartTrigger .counter').html(JSON.parse(data).count ? JSON.parse(data).count : '');
            if (!JSON.parse(data).count) {
                $('body').removeClass('showCart');
            }
        });
        return false;
    });

    $(document).on('click', '.cartTrigger', function (e) {
        e.preventDefault();
        $('body').toggleClass('showCart');
        return false;
    });

    $(document).on('click', '.notify', function (e) {
        e.preventDefault();
        $('.notify').removeClass('show');
        $('body').addClass('showCart');
        return false;
    });

    $(document).on('click', '.cartOverlay', function (e) {
        e.preventDefault();
        $('body').removeClass('showCart');
        return false;
    });

    $(document).on('click', '.mainWrapper section.main .imageBlock .imgWrapper:not(.active)', function (e) {
        if ($(window).width() < 1024) {
            e.preventDefault();
            $('.mainWrapper section.main .imageBlock .imgWrapper.active').removeClass('active');
            $(e.currentTarget).addClass('active');
            return false;
        }
    });

    if ($('section.main .mobileSection').length) {
        var swiper = new Swiper('section.main .mobileSection .swiper-container', {
            pagination: 'section.main .mobileSection .swiper-pagination',
            paginationClickable: true
        });
    }

    if ($('section.video').length) {
        var videoSwiper = new Swiper('section.video .videosWrapper.swiper-container', {
            centeredSlides: true,
            slidesPerView: 'auto',
            slideToClickedSlide: true,
            nextButton: 'section.video .nextBtn',
            prevButton: 'section.video .prevBtn',
            onSlideChangeStart: function (a, b, c) {
                $('section.video  video').each(function (num, el) {
                    $(el)[0].pause();
                });
            }
        });
    }

    $(document).on('click', 'section.video .playBtn', function (e) {
        e.preventDefault();
        var $el = $(e.currentTarget).parents('.videoEl');
        $el.find('.videoInfo').fadeOut(function () {
            var video = $el.find('video');
            if (video.length) {
                video[0].play();
            }
        });
        var iframe = $el.find('iframe');
        if (iframe.length) {
            iframe[0].src += "&autoplay=1";
        }
        return false;
    });


    // $(document).on('click', 'section.about .imageBlock .imgWrapper .hintWrapper .trigger', function (e) {
    //     e.preventDefault();
    //     $(e.currentTarget).parents('.hintWrapper').toggleClass('showText');
    //     return false;
    // });

    $(document).on('click', '.templateDetail .rating a', function (e) {
        e.preventDefault();
        var index = $(e.currentTarget).index();
        $(e.currentTarget).addClass('active');
        $.get($(e.currentTarget).attr('href'), function (data) {
            $('.templateDetail .rating a').remove();
            $('.templateDetail .rating').append('<span></span><span></span><span></span><span></span><span></span>');
            $('.templateDetail .rating span').eq(index).addClass('active');
        });
        return false;
    });


    $(document).on('click', '.toWishlist', function (e) {
        e.preventDefault();
        $.get($(e.currentTarget).attr('href'), function (data) {
            $('.wishlistTrigger').addClass('added');
            setTimeout(function () {
                $('.wishlistTrigger').removeClass('added');
            }, 2000);

            $(e.currentTarget).addClass('hidden');
            $(e.currentTarget).siblings('.fromWishlist').removeClass('hidden');
        });
        return false;
    });
    $(document).on('click', '.fromWishlist', function (e) {
        e.preventDefault();
        $.get($(e.currentTarget).attr('href'), function (data) {
            $(e.currentTarget).addClass('hidden');
            $(e.currentTarget).siblings('.toWishlist').removeClass('hidden');
        });
        if ($(e.currentTarget).parents('.wishlistWrapper').length) {
            $(e.currentTarget).parents('.templateItem').fadeOut();
        }
        return false;
    });

    $(document).on('click', '.fromWishlist', function (e) {
        e.preventDefault();
        $.get($(e.currentTarget).attr('href'), function (data) {
            $(e.currentTarget).addClass('hidden');
            $(e.currentTarget).siblings('.toWishlist').removeClass('hidden');
        });
        if ($(e.currentTarget).parents('.wishlistWrapper').length) {
            $(e.currentTarget).parents('.templateItem').fadeOut();
        }
        return false;
    });

    $(document).on('click', '.templatesWrapper:not(.wishlistWrapper) .categoryTitle .rotateWrapper', function (e) {
        e.preventDefault();
        $('.templatesWrapper').removeClass('showList');
        return false;
    });

    $('.templatesList').scroll(function () {
        $('.progressBar').width(($('.templatesList').scrollTop() / ($('.templatesList>.wrapper').height() + 220 - $(window).height())) * 100 + '%');
        $.cookie('lastScrollPos', $('.templatesList').scrollTop());
    });

    $('.cd-handle').hover(function () {
        if (!$('.cd-handle').hasClass('hovered')) {
            $('.cd-handle').addClass('hovered');
        }
    });

    $(document).on('submit', '.templatesStart form', function (e) {
        e.preventDefault();
        var $form = $(e.currentTarget);
        $('section.templatesList').css('opacity', 0);
        $('.mainWrapper.templatesWrapper .categoryTitle .name div').html($('.mainSelectWrapper .ui-selectmenu-text').html());
        $.ajax({
            url: $form.attr('action'),
            method: $form.attr('method'),
            data: $form.serialize()
        }).done(function (data) {
            var $data = $(data);
            var categoryName = $('.templatesStart form select option:selected').html().trim().split('(');
            categoryName = categoryName[0] + ' <span class="count">(' + categoryName[1] + '</span>';
            $('.templatesWrapper .categoryTitle .name div').html(categoryName);

            $('section.templatesList').html($data.find('section.templatesList').html());
            $('section.templatesList').css('opacity', 1);
            $('img.svg').svgConvert();
        });
        return false;
    });

    $(document).on('submit', '#cvcontent-form', function (e) {
        e.preventDefault();
        return;
        var $form = $(e.currentTarget);
        $('.cvContentList').css('opacity', 0);
        $.ajax({
            url: $form.attr('action'),
            method: $form.attr('method'),
            data: $form.serialize()
        }).done(function (data) {
            var $data = $(data);
            $('.cvContentList').html($data.find('.cvContentList').html());
            $('.cvContentList').css('opacity', 1);
            $('img.svg').svgConvert();
        });
        return false;
    });

    $(document).on('change', '.mainSelectWrapper select', function (e) {
        $(e.currentTarget).parents('form').submit();
    });


    $(document).on('click', '.mobileNav a', function (e) {
        e.preventDefault();
        var isActive = $(e.currentTarget).hasClass('active');
        $('.mobileNav a').removeClass('active');
        $('.howToEdit.show,.policy.show').removeClass('show').slideUp();
        if (!isActive) {
            $(e.currentTarget).addClass('active');
            $($(e.currentTarget).data('selector')).addClass('show').slideDown();
        }
        return false;
    });

    $(document).on('swipeleft', '.mainWrapper section.main.withDraggable .imageBlock .imgWrapper.active', function (e) {
        var prev = $(e.currentTarget).prev();
        if (!prev.length) {
            prev = $('.mainWrapper section.main.withDraggable .imageBlock .imgWrapper').last();
        }
        console.log(prev)
        prev.trigger('click');
    });

    $(document).on('swiperight', '.mainWrapper section.main.withDraggable .imageBlock .imgWrapper.active', function (e) {
        var next = $(e.currentTarget).next();
        if (!next.length) {
            next = $('.mainWrapper section.main.withDraggable .imageBlock .imgWrapper').first();
        }
        next.trigger('click');
    });

    $(document).on('click', '.bannerWrapper .closeBtn', function (e) {
        e.preventDefault;
        $('.bannerWrapper').fadeOut('slow');
        return false;
    });

    $(document).on('click', '.fileField .customBlock', function (e) {
        e.preventDefault;
        $(e.currentTarget).parents('.fileField').find('input').trigger('click');
        return false;
    });

    $(document).on('change', '.fileField input', function (e) {
        e.preventDefault;
        if (e.currentTarget.files.length) {
            $(e.currentTarget).parents('.fileField').find('span').html(e.currentTarget.files[0].name);
        }
        return false;
    });


    if (detectIE()) {
        $('.popupIE').addClass('show');
    }

    if ($('.templatesList').length && typeof scrollToLastPos != 'undefined' && scrollToLastPos && $.cookie('lastScrollPos')) {
        $('.templatesWrapper').addClass('showList');
        if ($(window).width() < 1024) {
            $(window).scrollTop(parseInt($.cookie('lastScrollPos')));

            var initPosition = $('.templatesStart .counter').offset().top + 42;
            if ($(window).scrollTop() + 60 > initPosition) {
                $('#filter-form').addClass('fixed')
            }
        } else {
            $('.templatesList.scrollPager').scrollTop(parseInt($.cookie('lastScrollPos')));
        }
    }

    if ($('.cvContentList').length) {
        var cvContentList = [];
        $('.cvContentList .cvContentItem').each(function (num, el) {
            cvContentList.push({
                name: $(el).find('.inner').text().toLowerCase(),
                key: $(el).data('key')
            });
        });
        $(document).on('keyup', '.cvContentTop .inputWrapper input', function (e) {
            var val = $(e.currentTarget).val().toLowerCase();
            var res = jQuery.grep(cvContentList, function (n, i) {
                return n.name.search(val) >= 0;
            });
            $('.cvContentList .cvContentItem').addClass('hidden');
            $(res).each(function (num, el) {
                $('.cvContentList .cvContentItem[data-key="' + el.key + '"]').removeClass('hidden');
            });
            if (!res.length) {
                $('.cvContentList .empty').removeClass('hidden');
            } else {
                $('.cvContentList .empty').addClass('hidden');
            }
        });
    }

});