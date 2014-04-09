// variables
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var timeTemplate = "<span class=\"digit\">{0}</span> days <span class=\"digit\">{1}</span> hours <span class=\"digit\">{2}</span> minutes <span class=\"digit\">{3}</span> seconds";
var dateTemplate = "<span class=\"digit\">{0}</span> years <span class=\"digit\">{1}</span> months <span class=\"digit\">{2}</span> days";
var dateMode = false;

$(function () {
    // setup garden
    $loveHeart = $("#loveHeart");
    var offsetX = $loveHeart.width() / 2;
    var offsetY = $loveHeart.height() / 2 - 55;
    $garden = $("#garden");
    gardenCanvas = $garden[0];
    gardenCanvas.width = $("#loveHeart").width();
    gardenCanvas.height = $("#loveHeart").height()
    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);

    var content = $("#content");
    content.css("width", $loveHeart.width() + $("#code").width());
    content.css("height", Math.max($loveHeart.height(), $("#code").height()));
    content.css("top", Math.max(($window.height() - $("#content").height()) / 2, 10));
    content.css("left", Math.max(($window.width() - $("#content").width()) / 2, 10));
    $("#links").css("top", content.height() + content.position().top - $("#links").height() - 20);
    var contentRightX = content.width() + content.position().left;
    if ($(document).width() - contentRightX > $("#links").width() + 20) {
        $("#links").css("left", contentRightX + 20);
    } else {
        $("#links").css("left", contentRightX - $("#links").width() - 20);
    }
    $("#create_link").click(function(){
        window.open('/create');
    });
    $("#top_pages").click(function(){
        window.open('/top');
    });
    $("#loveHeart").click(function(){
        modeChange();
    });
    // renderLoop
    setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
});

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) {
        return args[n];
    });
};

function getHeartPoint(angle) {
    var t = angle / Math.PI;
    var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
    var y = - 20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return new Array(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
    var angle = 10;
    var heart = new Array();
    var animationTimer = setInterval(function () {
        var bloom = getHeartPoint(angle);
        var draw = true;
        for (var i = 0; i < heart.length; i++) {
            var p = heart[i];
            var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
            if (distance < Garden.options.bloomRadius.max * 1.3) {
                draw = false;
                break;
            }
        }
        if (draw) {
            heart.push(bloom);
            garden.createRandomBloom(bloom[0], bloom[1]);
        }
        if (angle >= 30) {
            clearInterval(animationTimer);
            showMessages();
        } else {
            angle += 0.2;
        }
    }, heartAnimationSpeed);
}

(function($) {
    $.fn.typewriter = function() {
        this.each(function() {
            var $ele = $(this), str = $ele.html(), progress = 0;
            $ele.html('');
            var timer = setInterval(function() {
                var current = str.substr(progress, 1);
                if (current == '<') {
                    progress = str.indexOf('>', progress) + 1;
                } else if (current == "&") {
                    var escape = str.substr(progress, 4);
                    if (escape == "&lt;" || escape == "&gt;") {
                        progress += 4;
                    }
                } else {
                    progress++;
                }
                $ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
                if (progress >= str.length) {
                    clearInterval(timer);
                }
            }, typewriterSpeed);
        });
        return this;
    };
})(jQuery);

function modeChange() {
    dateMode = !dateMode;
}

function timeElapse(date){
    var current = new Date();
    var startAt = new Date();
    startAt.setTime(Date.parse(date));
    var years = 0;
    var month = 0;
    if (dateMode) {
        years = Math.floor(((current.getFullYear() - startAt.getFullYear()) * 12 + current.getMonth() - startAt.getMonth()) / 12);
        startAt.setFullYear(date.getFullYear() + years);
        months = ((current.getFullYear() - startAt.getFullYear()) * 12 + current.getMonth() - startAt.getMonth()) % 12;
        if (current.getDate() < startAt.getDate()) {
            months--;
        }
        startAt.setMonth(startAt.getMonth() + months);
        if (months < 10) {
            months = "0" + months;
        }
    }
    var seconds = (Date.parse(current) - Date.parse(startAt)) / 1000;
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);
    if (hours < 10) {
        hours = "0" + hours;
    }
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    seconds = seconds % 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var innerHtml = timeTemplate.format(days, hours, minutes, seconds);
    if (dateMode) {
        if (days < 10) {
            days = "0" + days;
        }
        innerHtml = dateTemplate.format(years, months, days);
    }
    $("#elapseClock").html(innerHtml);
}

function showMessages() {
    //adjustWordsPosition();
    $('#messages').fadeIn(wordsInterval, function() {
        showLoveU();
    });
}

function adjustWordsPosition() {
    $('#words').css("position", "absolute");
    $('#words').css("top", $("#garden").position().top + 195);
    $('#words').css("left", $("#garden").position().left + 70);
}

function adjustCodePosition() {
    $('#code').css("margin-top", ($("#garden").height() - $("#code").height()) / 2);
}

function showLoveU() {
    $('#loveu').fadeIn(signatureInterval);
}

function parseTime(str) {
    var date = new Date();
    var match = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(str);
    date.setFullYear(match[1], match[2] - 1, match[3]);
    date.setHours(match[4]);
    date.setMinutes(match[5]);
    date.setSeconds(match[6]);
    date.setMilliseconds(0);
    return date;
}
