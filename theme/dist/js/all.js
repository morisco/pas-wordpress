$(document).ready(function() {
  window.main = new PAS();
  window.today = new Today();
window.schedule = new Schedule();
})
function PAS() {
  var pas = this;
  pas.$signupModal = $('#signup-modal');
  pas.$signupForm = $('#signup-modal .signup-form');
  pas.$schedule = $('#schedule');
  pas.$showSchedule = $('#show-schedule');
  pas.$helpModal = $('#help-modal');
  pas.$vimeoModal = $('#vimeo-modal');
  pas.$mobileNav = $('.mobile-nav');
  pas.$mobileNavClose = $('.mobile-nav__close');
  pas.$mobileNavAccordionTrigger = $('#help-trigger');
  pas.$mobileNavAccordionContent = $('#help-content');
  pas.$mobileNavAccordionScheduleTrigger = $('#schedule-trigger');
  pas.$mobileNavAccordionScheduleContent = $('#schedule-content');
  pas.$mobileNavTrigger = $('.header__mobile-trigger');
  pas.watchDisable = false;

  pas.prevScroll = 0;

  
  pas.init = () => {
    pas.initEvents();
    if(Cookies.get('PAS_2020_SIGNUP_CLOSED_TWICE') !== 'true' && Cookies.get('PAS_2020_SIGNUP_SUCCESS') !== 'true'){
      pas.openSignup();
    }
    if($("#share-modal").length){
      pas.$shareModal = $("#share-modal");
      pas.openShareModal();
    }
    if(location.hash === '#watch'){
      pas.showWatch();
    }
    setTimeout(function() {
      $('.today').addClass('today--show')
    }, 500);
    $(window).on('hashchange', function() {
      console.log(location.hash);
      if(location.hash === '#watch'){
        pas.showWatch();
        pas.closeMobileNav();
        $('body,html').scrollTop(0);
      } else {
        pas.showWatch(true);
      }
    })
  }

  pas.initEvents = () => {
    $('#show-help').on('click', pas.openHelpModal);
    $('#footer-show-help').on('click', pas.openHelpModal);
    $('footer').on('click', '#footer-menu-help', (e) => {
      e.preventDefault();
      pas.openHelpModal();
    });
    $('.service-vimeo-play').on('click', pas.openVimeo);
    pas.$showSchedule.on('click', pas.showSchedule);
    pas.$signupForm.on('submit', pas.handleSignup);
    pas.$mobileNavTrigger.on('click', pas.openMobileNav);
  }

  pas.openVimeo = (e) => {
    e.preventDefault();
    var $link = $(e.currentTarget);
    var vimeoURL = $link.attr('href');
    var vimeoTitle = $link.data('title');
    pas.$vimeoModal.find('h6').text(vimeoTitle);
    pas.$vimeoModal.addClass('modal--display');
    pas.$vimeoModal.on('click', '.modal__backdrop, .modal__close', pas.closeVimeo);
    setTimeout(() => {
      var vimeoSettings = {
        url: vimeoURL,
        width: $('.modal--vimeo__content').width(),
        autoplay:true
      };
      console.log(vimeoURL);
      $('#vimeo-player').append('<iframe src="' + vimeoURL + '" scrolling="no" width="' + $('#vimeo-player').width() +'" height="' + $('#vimeo-player').outerHeight() +'"></iframe>')
  
      pas.vimeoInstance = new Vimeo.Player('vimeo-player', vimeoSettings);
    }, 10);
    
  }

  pas.closeVimeo = () => {
    pas.$vimeoModal.removeClass('modal--display');
    setTimeout(function() {
      $('#vimeo-player').empty();
      // pas.vimeoInstance.destroy()
      // pas.$vimeoModal.off('click', '.modal__backdrop, .modal__close');
    }, 500);

  }

  pas.showWatch = (hideIt) => {
    if(pas.watchDisable){
      return; 
    }
    pas.watchDisable = true;
    if(!pas.showingWatch && !hideIt){
      $('.header__watch').addClass('active')
      pas.showingWatch = true;
      $('.today__day__inner, .today_today').fadeOut(() => {
        $('.today__day__watch, .today__watch').fadeIn(() => {
          pas.watchDisable = false;
        });
      });
    } else {
      $('.header__watch').removeClass('active')
      pas.showingWatch = false;
      $('.today__day__watch, .today__watch').fadeOut(() => {
        $('.today__day__inner, .today_today').fadeIn(() => {
          pas.watchDisable = false;
        });
      });
    }
  }

  pas.showSchedule = (e) => {
    e.preventDefault();
    pas.$showSchedule.addClass('active');
    pas.prevScroll = $(window).scrollTop();
    $('html,body').addClass('no-scroll');
    pas.$schedule.addClass('schedule--display');
    pas.$schedule.find('.schedule__header__close').on('click', pas.hideSchedule);
    pas.$schedule.find('.schedule__backdrop').on('click', pas.hideSchedule);
  }

  pas.hideSchedule = () => {
    $('html,body').removeClass('no-scroll');
    $('html,body').scrollTop(pas.prevScroll);
    pas.prevScroll = 0;
    pas.$showSchedule.removeClass('active');
    pas.$schedule.removeClass('schedule--display');
    pas.$schedule.find('.schedule__header__close').off('click', pas.hideSchedule);
    pas.$schedule.find('.schedule__backdrop').off('click', pas.hideSchedule);
  }

  pas.openSignup = () => {
    pas.$signupModal.find('form').removeAttr('novalidate');
    pas.$signupModal.addClass('modal--display');
    pas.$signupModal.find('.modal__backdrop').on('click', pas.closeSignup);
    pas.$signupModal.find('.modal__close').on('click', pas.closeSignup);
  }
  
  pas.closeSignup = () => {
    pas.$signupModal.removeClass('modal--display');
    pas.$signupModal.find('.modal__backdrop').off('click', pas.closeSignup);
    pas.$signupModal.find('.modal__close').off('click', pas.closeSignup);
    if(Cookies.get('PAS_2020_SIGNUP_CLOSED') === 'true'){
      Cookies.set('PAS_2020_SIGNUP_CLOSED_TWICE', 'true', { expires: 14 });  
    }
  
    Cookies.set('PAS_2020_SIGNUP_CLOSED', 'true', { expires: 14 });
  }

  pas.handleSignup = (e) => {
    e.preventDefault();

    
    var $firstName = $("#signup-firstname");
    var $lastName = $("#signup-lastname");
    var $email = $("#signup-email");
    var invalid = false;

    if($firstName.val() === ''){
      $firstName.addClass('invalid');
      invalid = true;
    } 
    if($lastName.val() === ''){
      $lastName.addClass('invalid');
      invalid = true;
    }

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($email.val())){
    } else {
      $email.addClass('invalid');
      invalid = true;
    }
    $.ajax({
      type: "POST",
      url: './wp-json/icontact/v1/add_subscriber',
      data: {
        first_name:$firstName.val(),
        last_name:$lastName.val(),
        email:$email.val(),
      },
      dataType: 'json', 
      success: function(response) {
        console.log(response);
      }
    });
    Cookies.set('PAS_2020_SIGNUP_SUCCESS', 'true');
    pas.closeSignup();
  }

  pas.openShareModal = () => {
    pas.$shareModal.find('.modal__backdrop').on('click', pas.closeShare);
    pas.$shareModal.find('.modal__close').on('click', pas.closeShare);
  }

  pas.closeShare = () => {
    pas.$shareModal.removeClass('modal--display');
    pas.$shareModal.find('.modal__backdrop').off('click', pas.closeShare);
    pas.$shareModal.find('.modal__close').off('click', pas.closeShare);
  }



  pas.openMobileNav = () => {
    clearTimeout(pas.navCloseTimeout);
    pas.$mobileNav.removeClass('mobile-nav--help-only');
    pas.$mobileNavClose.on('click', pas.closeMobileNav);
    pas.$mobileNavAccordionTrigger.on('click', pas.toggleMobileNavHelp);
    pas.$mobileNavAccordionScheduleTrigger.on('click', pas.toggleMobileNavSchedule);
    pas.$mobileNav.addClass('mobile-nav--open');
    pas.prevScroll = $(window).scrollTop();
    $('html,body').addClass('no-scroll');
  }

  pas.openModalQuesitonExpanded = (e) => {
    const $question = $(e.currentTarget).parent();
    const $expanded = $question.find('.modal__content__question__expanded');
    const $except = $question.find('.excerpt');
    $question.addClass('modal__content__question--expanded');
    const height = $except.height();
  
    // $question.find('.modal__content__question__expanded').css('max-height',height);
    // $expanded.animate({'max-height': $expanded[0].scrollHeight, 'opacity': 1});
    // $except.animate({'max-height': 0});
    $question.find('.modal__content__question__close').on('click', pas.closeModalQuestionExpanded);
    $('.mobile-nav').css('overflow','hidden');
    // setTimeout(() => {
      // $('.mobile-nav').animate({scrollTop: $('.mobile-nav').scrollTop() + $question.offset().top});
    // }, 500);
  }

  pas.closeModalQuestionExpanded = (e) => {
    const $question = $(e.currentTarget).parent().parent();
    const $expanded = $question.find('.modal__content__question__expanded');
    const $except = $question.find('.excerpt');
    $('.mobile-nav').css('overflow-y','scroll');

    $question.removeClass('modal__content__question--expanded');
    $question.find('.modal__content__question__close').off('click');

  }

  pas.toggleMobileNavHelp = (e, forceClose) => {
    clearTimeout(pas.helpTimeout);
    clearTimeout(pas.navCloseTimeout);
    if(!forceClose && !pas.$mobileNavAccordionContent.hasClass('mobile-nav__accordion-content--open')){
      if(pas.$mobileNavAccordionScheduleContent.hasClass('mobile-nav__accordion-content--open')) {
        // setTimeout(() => {
          pas.toggleMobileNavSchedule(false,true);
        // }, 500);
      }
      pas.$mobileNavAccordionTrigger.addClass('mobile-nav__accordion-trigger--open');
      pas.$mobileNav.animate({scrollTop: pas.$mobileNavAccordionTrigger.position().top})
      pas.$mobileNavAccordionContent.addClass('mobile-nav__accordion-content--open');
      if(pas.$mobileNavAccordionContent[0].scrollHeight > 0){
        pas.$mobileNavAccordionContent.animate({'max-height': pas.$mobileNavAccordionContent[0].scrollHeight}, 0);
      }
      pas.$mobileNavAccordionContent.find('.question-learn-more').on('click', pas.openModalQuesitonExpanded)
      pas.$mobileNav.on('scroll.help', function() {
        if(pas.$mobileNavAccordionTrigger.position().top < 0  ){
          pas.$mobileNavAccordionTrigger.find('.mobile-nav__accordion-mover').addClass('mobile-nav__accordion-mover--fixed');
        } else {
          pas.$mobileNavAccordionTrigger.find('.mobile-nav__accordion-mover').removeClass('mobile-nav__accordion-mover--fixed');
        }
      })
    } else {
      pas.$mobileNavAccordionTrigger.off('click', pas.toggleMobileNavSchedule);
      pas.$mobileNavAccordionTrigger.removeClass('mobile-nav__accordion-trigger--open');
      if(!forceClose){
        pas.$mobileNav.animate({scrollTop: pas.$mobileNav.scrollTop() + pas.$mobileNavAccordionTrigger.position().top - $(window).height()/2});
      }
      pas.helpTimeout = setTimeout(() => {
        pas.$mobileNavAccordionContent.find('.question-learn-more').off('click', pas.openModalQuesitonExpanded)
        pas.$mobileNav.removeClass('mobile-nav--help-only');
        pas.$mobileNav.off('scroll.help');
        pas.$mobileNavAccordionTrigger.find('.mobile-nav__accordion-mover').removeClass('mobile-nav__accordion-mover--fixed');
        pas.$mobileNavAccordionContent.removeClass('mobile-nav__accordion-content--open');
        pas.$mobileNavAccordionContent.animate({'max-height': 0}, 250);

      }, 500);
    }
  }

  pas.toggleMobileNavSchedule = (e, forceClose) => {
    clearTimeout(pas.scheduleTimeout);
    clearTimeout(pas.navCloseTimeout);
    if(!forceClose && !pas.$mobileNavAccordionScheduleContent.hasClass('mobile-nav__accordion-content--open')){
      if(pas.$mobileNavAccordionContent.hasClass('mobile-nav__accordion-content--open')){
        // setTimeout(() => {
          pas.toggleMobileNavHelp(false, true);
        // },500);
      }
      pas.$mobileNavAccordionScheduleTrigger.addClass('mobile-nav__accordion-trigger--open');
      pas.$mobileNav.animate({scrollTop: pas.$mobileNavAccordionScheduleTrigger.position().top})
      pas.$mobileNavAccordionScheduleContent.addClass('mobile-nav__accordion-content--open');
      pas.$mobileNavAccordionScheduleContent.animate({'max-height': pas.$mobileNavAccordionScheduleContent[0].scrollHeight}, 0);
      pas.$mobileNav.on('scroll.schedule', function() {
        if(
          pas.$mobileNavAccordionScheduleTrigger.position().top < 0
        ){
          pas.$mobileNavAccordionScheduleTrigger.find('.mobile-nav__accordion-mover').addClass('mobile-nav__accordion-mover--fixed');
          if(((pas.$mobileNavAccordionScheduleContent.height() * -1 > pas.$mobileNavAccordionScheduleContent.position().top - pas.$mobileNavAccordionScheduleTrigger.height() ))){
            pas.$mobileNavAccordionScheduleTrigger.find('.mobile-nav__accordion-mover').addClass('mobile-nav__accordion-mover--below');
          } else {
            pas.$mobileNavAccordionScheduleTrigger.find('.mobile-nav__accordion-mover').removeClass('mobile-nav__accordion-mover--below');
          }
        } else {
          pas.$mobileNavAccordionScheduleTrigger.find('.mobile-nav__accordion-mover').removeClass('mobile-nav__accordion-mover--fixed mobile-nav__accordion-mover--below');
        }
      })
    } else {
      pas.$mobileNavAccordionScheduleTrigger.removeClass('mobile-nav__accordion-trigger--open');
      if(!forceClose){
        pas.$mobileNav.animate({scrollTop: pas.$mobileNav.scrollTop() + pas.$mobileNavAccordionScheduleTrigger.position().top - $(window).height()/2});
      }
      pas.scheduleTimeout = setTimeout(() => {
        pas.$mobileNav.removeClass('mobile-nav--help-only');
        pas.$mobileNav.off('scroll.schedule');
        pas.$mobileNavAccordionScheduleTrigger.find('.mobile-nav__accordion-mover').removeClass('mobile-nav__accordion-mover--fixed');
        pas.$mobileNavAccordionScheduleContent.removeClass('mobile-nav__accordion-content--open');
        pas.$mobileNavAccordionScheduleContent.animate({'max-height': 0});
      }, 500);
    }
  }

  pas.closeMobileNav = () => {
    pas.$mobileNav.removeClass('mobile-nav--open');
    pas.$mobileNavClose.off('click', pas.closeMobileNav);
    pas.$mobileNavAccordionTrigger.off('click', pas.toggleMobileNavHelp);
    pas.$mobileNavAccordionScheduleTrigger.off('click', pas.toggleMobileNavSchedule);
    $('html,body').removeClass('no-scroll');
    $(window).scrollTop(pas.prevScroll);
    pas.navCloseTimeout = setTimeout(() => {
      pas.$mobileNav.scrollTop(0);
      pas.$mobileNav.removeClass('mobile-nav--help-only');
      pas.toggleMobileNavHelp(false, true);
      pas.toggleMobileNavSchedule(false, true);
    }, 500);
  }

  pas.openHelpModal = () => {
    if($(window).width() < 1024){
      pas.openMobileNav();
      pas.toggleMobileNavHelp();
      pas.$mobileNav.addClass('mobile-nav--help-only');
      return;
    }
    pas.$helpModal.addClass('modal--display');
    pas.$helpModal.find('.modal__backdrop').on('click', pas.closeModal);
    pas.$helpModal.find('.modal__close').on('click', pas.closeModal);
    pas.$helpModal.find('.question-learn-more').on('click', pas.expandQuestion);
  }

  pas.expandQuestion = (e) => {
    const $expanded = $('.modal--help .modal__content__overlay');
    const $parent = $(e.currentTarget).parent();
    const title = $parent.find('h5').text();
    const content = $parent.find('.modal__content__question__expanded').html();
    $expanded.css({'top': $expanded.parent().scrollTop(), 'height': $expanded.parent().parent().height() });

    $('.modal__close-expanded').addClass('modal__close-expanded--display')
    $('.modal--help .modal__content__questions').addClass('no-scroll');
    $expanded.append('<div class="modal__content__expanded__content" style="opacity:0">' + content + '</div>');
    $expanded.addClass('modal__content__overlay--expanded');
    $('.modal__close-expanded').on('click', pas.collapseQuestion);
    $('#help-modal .modal__close').addClass('modal__close--hidden');
    setTimeout(() => {
      $expanded.find('h5, .modal__content__expanded__content').css('opacity', 1);
    }, 500);
  }

  pas.collapseQuestion = (e) => {
    const $expanded = $('.modal__content__overlay');
    $expanded.find('h5, .modal__content__expanded__content').css('opacity', 0);
    $('.modal--help .modal__content__questions').removeClass('no-scroll');
    $('.modal__close-expanded').removeClass('modal__close-expanded--display');
    $('.modal__close-expanded').off('click');
    $('#help-modal .modal__close').removeClass('modal__close--hidden');

    $expanded.removeClass('modal__content__overlay--expanded');

    setTimeout(() => {
      $expanded.empty();
    }, 1500);
  }

  pas.closeModal = () => {
    pas.$helpModal.removeClass('modal--display');
    if(pas.$mobileNavAccordionScheduleTrigger.hasClass('mobile-nav__accordion-mover--fixed')){
      pas.toggleMobileNavSchedule();
    } 
    pas.$helpModal.find('.modal__close').off('click', pas.closeModal);
    pas.$helpModal.find('.modal__backdrop').off('click', pas.closeModal);
  }

  pas.init();

  return pas;

}
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
function Today() {
  var t = this;
  t.$calendarDivs = $('.atc__data');

  t.init = function() {
    t.initEvents();
    t.initCalendars();
  }

  t.initCalendars = function() {
    t.$calendarDivs.each(function(index, calendar) {
      t.initCalendar(calendar);
    });
  }

  t.initCalendar = function(calendar) {
    const $calendar = $(calendar);
    if(!$calendar.data('start-time')){
      return
    }
    var startTime = $calendar.data('start-time');
    var endTime = $calendar.data('end-time');
    var serviceDate = $calendar.data('date');
    var eventTitle = $calendar.data('title');
    var eventDescription = $calendar.data('description');
    var start = moment(serviceDate + ' ' + startTime, 'YYYYMMDD HH:mm:ss', true);
    var end = moment(serviceDate + ' ' + endTime, 'YYYYMMDD HH:mm:ss', true);
    var myCalendar = createCalendar({
      options: {
        class: 'my-class',
        
        // You can pass an ID. If you don't, one will be generated for you
        id: eventTitle.replace(/\s/g, '').toLowerCase(),
      },
      data: {
        // Event title
        title: eventTitle,
    
        // Event start date
        start: new Date(start.format()),

        // You can also choose to set an end time
        // If an end time is set, this will take precedence over duration
        end: new Date(end.format()),     
    
        // Event Address
        address: 'https://zoom.us/u/agPek1YRB',
    
        // Event Description
        description: eventDescription
      }
    });
    $calendar.append(myCalendar)
  }

  t.initEvents = function() {
    
  }

  t.init();
  return t;
}