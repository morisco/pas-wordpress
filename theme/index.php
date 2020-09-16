<?php
/**
 * The main template file
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists
 *
 * Methods for TimberHelper can be found in the /lib sub-directory
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */

$context          = Timber::context();
date_default_timezone_set('America/New_York');
if(isset($_GET['today'])){
  $date = $_GET['today'];
} else {
  $date = date('Ymd');
}

if(isset($_GET['time'])){
  $time = $_GET['time'];
} else {
  
  $time = intval(date('His'));
}

if(isset($_GET['share'])){
  $share_value = $_GET['share'];
  $share_post = new Timber\Post($share_value);
  if($share_post->title){
    $context['shared_post'] = $share_post;
  }
}



$options = get_fields('options');
$evergreen_content = $options['evergreen_cards'];
foreach($evergreen_content as $cardobj){
  if($cardobj && $cardobj['card']){
    $card = array('card'=> new Timber\Post($cardobj['card']->ID)); 
    $cards[] = $card;
  }
};
$evergreen_content = $cards;
$context['faqs'] = $options['faqs'];
$context['signup_data'] = $options['signup_panel'];
$context['header_links'] = $options['header_links']; 
$context['help_heading'] = $options['help_heading'];

$month = intval(substr($date, 4, 2));
$day = intval(substr($date,6,2));
$today_data = array(
  'holiday_day' => false
);
if($month === 8){
  if($day > 21){
    $today_data['current_holiday'] = 'Elul';
    $today_data['today_hebrew'] = 'אלול';
  }
} else if ($month === 9){
  if($day < 18){
    $today_data['current_holiday'] = 'Elul';
    $today_data['today_hebrew'] = 'אלול';
  } else if($day >= 19 && $day <= 20){
    $today_data['current_holiday'] = 'Rosh<br/>Hashana';
    $today_data['today_hebrew'] = 'ראש השנה';
    $today_data['holiday_day'] = ($day - 1) + 1;
  } else if($day === 18){
    $today_data['current_holiday'] = 'Erev<br/>Rosh<br/>Hashana';
    $today_data['today_hebrew'] = 'ראש השנה';
    $today_data['holiday_day'] = false;
  } else if($day === 27 || $day === 28){
    $today_data['current_holiday'] = 'Yom Kippur';
    $today_data['today_hebrew'] = 'יום כיפור';
  }
}

if($month === 8){
  $today_data['today_string'] = 'August ' . strval($day);
} else if($month === 9){
  $today_data['today_string'] = 'September ' . strval($day);
}

$context['today_data'] = $today_data;
$args = array(
  'numberposts' => 1,
  // 'post_status'     =>  'publish',
  'post_type' => 'daily',
  'meta_key' => 'day',
  'meta_value' => $date
);
$posts = Timber::get_posts($args);
$evergreen = false;
if(count($posts)){
  foreach($posts as $post){
    $context['todays_cards'] = $post->meta('daily_cards');
    $extend_evergreen = $post->meta('extend_evergreen');
    $context['welcome_data'] = $post->meta('welcome_card'); 
  }
} else {
  $evergreen = true;
  $context['todays_cards'] = $evergreen_content;
  $cards = array();
 
  $context['todays_cards'] = $cards;
  $context['welcome_data'] = $options['welcome_card'];
}

$upcoming_cards = array();
$past_cards = array();
$non_timestamped = array();

if($context['todays_cards'] && !$evergreen) { 
  foreach($context['todays_cards'] as $card_obj){
    $card = $card_obj['card'];
    if($card->post_type === 'class'){
      $noramlizedEnd = $card->end_time ? intval(str_replace(':', '', $card->end_time)) : false;
      if($noramlizedEnd && $noramlizedEnd < $time){
        $card->past = true;
        $past_cards[] = $card_obj;
      } else {
        $card->upcoming = true;
        $upcoming_cards[] = $card_obj;
      }
    } else if($card->post_type === 'service'){
      $noramlizedEnd = intval(str_replace(':', '', $card->end_time));
      if($noramlizedEnd < $time){
        $card->past = true;
        $past_cards[] = $card_obj;
      } else {
        $card->upcoming = true;
        $upcoming_cards[] = $card_obj;
      }
    } else {
      $non_timestamped[] = $card_obj;
    }
  }
}


$context['calendar'] = array(
  'elul' => array('0821', '0822','0823','0824','0825','0826','0827','0828','0829','0830','0831', '0901', '0902', '0903', '0904', '0905', '0906', '0907','0908', '0909', '0910', '0911', '0912', '0913', '0914', '0915','0916','0917'),
  'rosh' => array('0918', '0919', '0920'),
  'yomkippur' => array('0927', '0928')
);

$context['upcoming_calendar'] = array(
  'elul' => array(),
  'rosh' => array(),
  'yomkippur' => array()
);
$context['past_calendar'] = array(
  'elul' => array(),
  'rosh' => array(),
  'yomkippur' => array()
);

$args = array(
  'numberposts' => -1,
  'post_type' => 'daily',
  'meta_key'			=> 'day',
  'orderby'			=> 'meta_value',
  'order' => 'ASC',
  'post_status'     => 'publish',
);
$days = Timber::get_posts($args);

function cmp($a, $b) {
  $aTime = intval($a['start_time']);
  $bTime = intval($b['start_time']);
  if($aTime === $bTime){
    return 0;
  } else {
    return ($aTime < $bTime) ? -1 : 1;
  }
}

$daySchedules = array();
$familySchedules = array();
$youngSchedules = array();
function getSorted($sched, $day){
  $split_day = array(
    'morning'=> array(),
    'afternoon' => array(),
    'night' => array()
  );
  foreach($sched as $schedCards){    
    $sortedDaily = $schedCards;
    usort($sortedDaily, 'cmp');
    foreach($schedCards as $key => $schedCard){
      if(gettype($schedCard) === 'integer'){
        $schedCard = new Timber\Post($schedCard); 
      }
      if(gettype($schedCard) !== 'boolean'){
          if($schedCard->get_field('breakouts')){
            $breakouts = array();
            foreach($schedCard->get_field('breakouts') as $breakout){

              $start_time = date('H:i:s', (strtotime($breakout['breakout_start_time']) - 14400));
              $breakout['breakout_start_time'] = $start_time;
              if($breakout['breakout_end_time']){
                $end_time = date('H:i:s', (strtotime($breakout['breakout_end_time']) - 14400));
                $breakout['breakout_end_time'] = $end_time;
              } else {
                $breakout['breakout_end_time'] = 0;
              }
              $breakouts[] = $breakout;
            }
            $schedCard->breakouts =  $breakouts;
          }
        $startTime = intval($schedCard->start_time);
        if($startTime < 12){
          $split_day['morning'][] = $schedCard;
        } else if ($startTime >= 12 && $startTime < 17) {
          $split_day['afternoon'][] = $schedCard;
        } else {
          $split_day['night'][] = $schedCard;
        }
      }
    }
  }
  return $split_day;
}

foreach($days as $day){

  if($day->get_field('schedule')){
    
    $schedule = getSorted($day->get_field('schedule'), $day->day);
    $daySchedules[str_replace('/', '', $day->day)] = $schedule;
  }
  if($day->get_field('family_schedule')){
    $schedule = getSorted($day->get_field('family_schedule'), $day->day);
    $familySchedules[str_replace('/', '', $day->day)] = $schedule;
  }

  if($day->get_field('young_kids_schedule')){
    $schedule = getSorted($day->get_field('young_kids_schedule'), $day->day);
    $youngSchedules[str_replace('/', '', $day->day)] = $schedule;
  }
}
$context['day_schedules'] = $daySchedules;
$context['family_schedules'] = $familySchedules;
$context['young_schedules'] = $youngSchedules;



$watch_args = array(
  'numberposts' => -1,
  'post_type' => 'service',
  'meta_key'			=> 'service_date',
  'orderby'			=> 'meta_value',
  'order' => 'ASC',
  'post_status'     => 'publish',
);
$watchCards = Timber::get_posts($watch_args);
$context['watch_schedule'] = $watchCards;
$today = date('md', strtotime($date));

function cmptime($a, $b) {
  $aTime = strtotime($a->service_date . $a->start_time);
  $bTime = strtotime($b->service_date . $b->start_time);
  if($aTime === $bTime){
    return 0;
  } else {
    return ($aTime < $bTime) ? -1 : 1;
  }
  
}

usort($context['watch_schedule'], 'cmptime');

foreach($context['watch_schedule'] as $card){
  $intDate = intval($card->service_date);
  $intToday = intval('2020' . $today);
  $breakouts = array();
  foreach($card->get_field('breakouts') as $breakout){
    $start_time = date('H:i:s', (strtotime($breakout['breakout_start_time']) - 14400));
    $breakout['breakout_start_time'] = $start_time;
    if($breakout['breakout_end_time']){
      $end_time = date('H:i:s', (strtotime($breakout['breakout_end_time']) - 14400));
      $breakout['breakout_end_time'] = $end_time;
    } else {
      $breakout['breakout_end_time'] = 0;
    }
    $breakouts[] = $breakout;
  }
  $card->formatted_breakouts = $breakouts;
  if(!$card->end_time){

    $end_stub = explode(':', $card->start_time);
    $end_stub[0] = intval($end_stub[0])+ 2;
    $card->end_time = implode(':', $end_stub);
  }
  if($intDate < $intToday){
    $card->past = true;
    $context['past_watch'][] = $card;
  } else if($intDate === $intToday) {
    $noramlizedEnd = $card->end_time ? intval(str_replace(':', '', $card->end_time)) : false;
    if($noramlizedEnd && $noramlizedEnd < $time){
      $card->past = true;
      $context['past_watch'][] = $card;
    } else {
      $card->upcoming = true;
      $context['upcoming_watch'][] = $card;
    }
  } else {
    $card->upcoming = true;
    $context['upcoming_watch'][] = $card;
  }
}
// die();

foreach($context['calendar'] as $key => $dates){
  $holiday = $key;
  foreach($dates as $date){
    $intDate = intval($date);
    $intToday = intval($today);
    if($intDate < $intToday){
      $context['past_calendar'][$holiday][] = $date;
    } else {
      $context['upcoming_calendar'][$holiday][] = $date;
    }
  }
}

if(!$evergreen){
  $reordered_cards = array();
  $reordered_cards = array_merge($reordered_cards, $upcoming_cards);
  if($extend_evergreen && $evergreen_content){
    $reordered_cards = array_merge($reordered_cards, $evergreen_content);
  }
  $reordered_cards = array_merge($reordered_cards, $non_timestamped, $past_cards);
  $context['todays_cards'] = $reordered_cards;
} else {
  $reordered_cards = $evergreen_content;
  $context['todays_cards'] = $reordered_cards;
}

$templates        = array( 'index.twig' );
if ( is_home() ) {
	array_unshift( $templates, 'front-page.twig', 'home.twig' );
}
Timber::render( $templates, $context );
