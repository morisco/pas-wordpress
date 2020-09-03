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