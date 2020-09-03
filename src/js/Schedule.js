function Schedule() {
  var s = this;

  s.active = 'main';
  s.switcherButtons = $('.schedule__header__switcher__button');
  s.$mainSchedule = $(window).width() < 1024 ? $('.mobile-nav .schedule__version--main') : $('#schedule .schedule__version--main');
  s.$familySchedule =$(window).width() < 1024 ? $('.mobile-nav .schedule__version--family') : $('#schedule .schedule__version--family');
  s.$kidsSchedule = $(window).width() < 1024 ? $('.mobile-nav .schedule__version--kids') : $('#schedule .schedule__version--kids');
  s.$daylinks = $('.calendar__month').find('.day--elul, .day--rosh, .day--yom');

  s.init = function() {
    s.initEvents();
  }

  s.initEvents = function() {
    s.$daylinks.on('click', s.goToDay);
    s.switcherButtons.on('click', s.switchSchedule);
  }

  s.goToDay = function() {
    var day = '2020' + $(this).data('link').replace('-', '');
    s.activeDay = day;
    var item = s.$mainSchedule.find(".schedule__holiday[data-date='" + day + "']");
    var scrollTo = $('#schedule .schedule__content__details').scrollTop() + parseInt(item.offset().top,10) - $('#schedule .schedule__header').outerHeight() - 30;
    s.disableScroll = true;
    $('#schedule .schedule__content__details').animate({scrollTop: scrollTo});
  }

  s.switchSchedule = function() {
    if(s.disable) { return };
    clearTimeout(s.resetDisableTimeout);
    var $wrapper = $(this).parent().parent().find('.schedule__day__type__wrapper');
    if(!$wrapper.data('active')){
      $wrapper.data('active', 'main');
    }
    var $mainSchedule = $(this).parent().parent().find('.schedule__day__type--main');
    var $familySchedule = $(this).parent().parent().find('.schedule__day__type--family');
    var $youngSchedule = $(this).parent().parent().find('.schedule__day__type--young');
    var $currentSchedule;
    var active = $wrapper.data('active');
    switch(active){
      case 'family':
        $currentSchedule = $familySchedule;
        break;
      case 'kids':
        $currentSchedule = $youngSchedule;
        break;
      default:
        $currentSchedule = $mainSchedule;
        
        break;
    }
    $(this).parent().find('.schedule__header__switcher__button--active').removeClass('schedule__header__switcher__button--active');
    $(this).addClass('schedule__header__switcher__button--active');
    console.log($currentSchedule.outerHeight());
    $wrapper.css('height', $wrapper.outerHeight());
    if($(this).hasClass('schedule__header__switcher__button--main') && active !=='main'){
      $wrapper.data('active', 'main');
      s.disable = true;
      
      $currentSchedule.animate({'opacity': 0}, function() {
        $currentSchedule.css('max-height', 0);
        $wrapper.animate({'height': $mainSchedule[0].scrollHeight}, function() {
          $mainSchedule.css({'max-height': $mainSchedule[0].scrollHeight}).animate({'opacity': 1}, function() {
            s.disable = false;
          })  
        });  
      });
    } else if($(this).hasClass('schedule__header__switcher__button--family') && active !=='family'){
      $wrapper.data('active', 'family');
      s.disable = true;
      $currentSchedule.animate({'opacity': 0}, function() {
        $currentSchedule.css('max-height', 0);
        $wrapper.animate({'height': $familySchedule[0].scrollHeight}, function() {
          $familySchedule.css({'max-height':  $familySchedule[0].scrollHeight}).animate({opacity:1}, function() {
            s.disable = false;
          })  
        });
      });
    } else if($(this).hasClass('schedule__header__switcher__button--kids') && active !=='kids'){
      $wrapper.data('active', 'kids');
      s.disable = true;
      $currentSchedule.animate({'opacity': 0}, function() {
        $currentSchedule.css('max-height', 0);
        $wrapper.animate({'height': $youngSchedule[0].scrollHeight}, function() {
          $youngSchedule.css('max-height', $youngSchedule[0].scrollHeight).animate({opacity:1}, function() {
            s.disable = false;
          })  
        });
      });
    }
    s.resetDisableTimeout = setTimeout(function() {
      s.disable = false;
    }, 1000);
  }

  s.init();

  return s;

}