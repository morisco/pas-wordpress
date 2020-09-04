<?php
/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */

/**
 * If you are installing Timber as a Composer dependency in your theme, you'll need this block
 * to load your dependencies and initialize Timber. If you are using Timber via the WordPress.org
 * plug-in, you can safely delete this block.
 */
$composer_autoload = dirname( __DIR__ ) . '/vendor/autoload.php';
if ( file_exists( $composer_autoload ) ) {
	require_once $composer_autoload;
	$timber = new Timber\Timber();
}

/**
 * This ensures that Timber is loaded and available as a PHP class.
 * If not, it gives an error message to help direct developers on where to activate
 */
if ( ! class_exists( 'Timber' ) ) {

	add_action(
		'admin_notices',
		function() {
			echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
		}
	);

	add_filter(
		'template_include',
		function( $template ) {
			return dirname( get_stylesheet_directory() ) . '/static/no-timber.html';
		}
	);
	return;
}


if( function_exists('acf_add_options_page') ) {
	
	acf_add_options_page(array(
		'page_title' 	=> 'General Settings',
		'menu_title'	=> 'General Settings',
		'menu_slug' 	=> 'general-settings',
		'capability'	=> 'edit_posts',
		'redirect'		=> false
	));
		
	acf_add_options_page(array(
		'page_title' 	=> 'Evergreen Content',
		'menu_title'	=> 'Evergreen',
		'menu_slug' 	=> 'evergreen-content',
		'capability'	=> 'edit_posts',
		'redirect'		=> false
	));
}

/**
 * Sets the directories (inside your theme) to find .twig files
 */
Timber::$dirname = array( '../views' );

/**
 * By default, Timber does NOT autoescape values. Want to enable Twig's autoescape?
 * No prob! Just set this value to true
 */
Timber::$autoescape = false;



/**
 * We're going to configure our theme inside of a subclass of Timber\Site
 * You can move this to its own file and include here via php's include("MySite.php")
 */
class StarterSite extends Timber\Site {
	/** Add timber support. */
	public function __construct() {
		add_action( 'after_setup_theme', array( $this, 'theme_supports' ) );
		add_filter( 'timber/context', array( $this, 'add_to_context' ) );
		add_filter( 'timber/twig', array( $this, 'add_to_twig' ) );
		add_action( 'init', array( $this, 'register_post_types' ) );
    add_action( 'init', array( $this, 'register_taxonomies' ) );
   
   
   add_action( 'admin_menu', array($this,'remove_menu_items'), 999 );
   add_action('wp_dashboard_setup', array($this,'remove_dashboard_widgets') );
   remove_action( 'welcome_panel', 'wp_welcome_panel' );
		parent::__construct();
  }

  public function remove_dashboard_widgets() {
    global $wp_meta_boxes;
    remove_action( 'admin_notices', 'update_nag', 3 );

    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_site_health']);

    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_activity']);

    unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_incoming_links']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_plugins']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_drafts']);
    unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_comments']);
    unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_primary']);
    unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_secondary']);
 
}
 

  
  public  function remove_menu_items(){
    remove_menu_page( 'themes.php' );
    remove_menu_page( 'upload.php' );
    remove_menu_page( 'edit.php' );
    remove_menu_page( 'options-general.php' );

    remove_action( 'admin_notices', 'update_nag', 3 );

    remove_menu_page( 'edit-comments.php' );
    remove_menu_page( 'plugins.php' );

    remove_menu_page( 'edit.php?post_type=page');
    remove_menu_page( 'tools.php');
  
  }
	/** This is where you can register custom post types. */
	public function register_post_types() {

	}
	/** This is where you can register custom taxonomies. */
	public function register_taxonomies() {

	}

	/** This is where you add some context
	 *
	 * @param string $context context['this'] Being the Twig's {{ this }}.
	 */
	public function add_to_context( $context ) {
		$context['foo']   = 'bar';
		$context['stuff'] = 'I am a value set in your functions.php file';
		$context['notes'] = 'These values are available everytime you call Timber::context();';
		$context['menu']  = new Timber\Menu();
		$context['site']  = $this;
		return $context;
  }


  


	public function theme_supports() {
		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );

		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
		add_theme_support( 'title-tag' );

		/*
		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		 */
		add_theme_support( 'post-thumbnails' );

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support(
			'html5',
			array(
				'comment-form',
				'comment-list',
				'gallery',
				'caption',
			)
		);

		/*
		 * Enable support for Post Formats.
		 *
		 * See: https://codex.wordpress.org/Post_Formats
		 */
		add_theme_support(
			'post-formats',
			array(
				'aside',
				'image',
				'video',
				'quote',
				'link',
				'gallery',
				'audio',
			)
		);

		add_theme_support( 'menus' );
	}

	/** This Would return 'foo bar!'.
	 *
	 * @param string $text being 'foo', then returned 'foo bar!'.
	 */
	public function myfoo( $text ) {
		$text .= ' bar!';
		return $text;
	}


  public function get_formatted_date($date){
    $formattedDate =  date("l, F j", strtotime($date));
    return $formattedDate;
  }

  public function get_card_time($start_time, $end_time, $date) {
    $date_time_eastern = new DateTime($start_time, new DateTimeZone('America/New_York'));

    $normalizedStart = intval(str_replace(':', '', $start_time));
    $normalizedEnd = intval(str_replace(':', '', $end_time));
    $start_ampm = $normalizedStart >= 120000 ? 'pm': 'am';
    $normalizedStart = $normalizedStart >= 130000 ? $normalizedStart - 120000 : $normalizedStart;
    $end_ampm = $normalizedEnd ? $normalizedEnd >= 120000 ? 'pm': 'am' : false;
    $normalizedEnd = $normalizedEnd >= 130000 ? $normalizedEnd - 120000 : $normalizedEnd;
    $time_string = $normalizedStart >= 100000 ? 
      substr($normalizedStart, 0, 2) . ':' . substr($normalizedStart, 2, 2) 
      : substr($normalizedStart, 0, 1) . ':' . substr($normalizedStart, 1, 2);

    if($start_ampm !== $end_ampm){
      $time_string .= $start_ampm;
    }
    if($end_time){
      $time_string .= '-';
      $time_string .= $normalizedEnd >= 100000 ? 
        substr($normalizedEnd, 0, 2) . ':' . substr($normalizedEnd, 2, 2) 
        : substr($normalizedEnd, 0, 1) . ':' . substr($normalizedEnd, 1, 2);
      $time_string .= $end_ampm;
    } else {
      // $time_string .= $start_ampm;
    }

    if($date){
      $formattedDate =  date("l, F j", strtotime($date));
      return $formattedDate . ' | '. $time_string;
    } else {
      return $time_string;
    }
  }

  public function get_is_now($start_time, $end_time, $service_date) {
    $isNow = false;

    $start_date = date('His', strtotime($start_time));
    $end_date = date('His', strtotime($end_time));

    if(isset($_GET['today'])){
      $now_today = $_GET['today'];
    } else {
      $now_today = date('Ymd');
    }

    if(isset($_GET['time'])){
      $time = $_GET['time'];
      $now_date = date('His', strtotime($time));
    } else {
      $now_date = date('His');
    }
    if($now_today === $service_date && $now_date > $start_date && $now_date < $end_date){
      $isNow = true;
    }
    return $isNow;
  }
  
  public function get_is_past($end_time, $service_date) {
    $isPast = false;
    if(isset($_GET['today'])){
      $now_today = $_GET['today'];
    } else {
      $now_today = date('Ymd');
    }


    $end_date = date('His', strtotime($end_time));
    if(isset($_GET['time'])){
      $time = $_GET['time'];
      $now_date = date('His', strtotime($time));
    } else {
      $now_date = date('His');
    }

    if($now_date > $end_date && $now_today === $service_date){
      $isPast = true;
    } else if($now_today > $service_date){
      $isPast = true;
    }
    return $isPast;


  }




  public function get_date($date) {
    $dashDate = '2020-' . substr($date, 0, 2) . '-' . substr($date, 2, 2);
    $newDate = date("l, F j", strtotime($dashDate));  
    return $newDate;
  }
  
  public function get_share_link($card) {
    if($card->post_type === 'service'){
      return get_site_url() . '?share=' . $card->ID;
    } else if($card->post_type === 'video'){
      return $card->get_field('vimeo_link')['url'];
    } else {
      return $card->article_link['url'];
    }
  }

  public function get_share_title($card) {
    if($card->post_type === 'service' || $card->post_type === 'class'){
      return $card->service_title;
    } else {
      return $card->post_title;
    }
  }

  public function get_holiday_details($card) {
    $details = array(
      'holiday'=> '',
      'day' => false
    );
    $now_today = $card->service_date;
    switch($now_today){
      case '20200918':
        $details['holiday'] = 'Erev Rosh Hoshanah';
      break;
      case '20200919':
        $details['holiday'] = 'Rosh Hoshanah';
        $details['day'] = 'Day 1';
      break;
      case '20200920':
        $details['holiday'] = 'Rosh Hoshanah';
        $details['day'] = 'Day 2';
      break;
      case '20200927':
        $details['holiday'] = 'Kol Nidrei';
      break;
      case '20200928':
        $details['holiday'] = 'Yom Kippur';
      break;
    }

    return $details;
  }
  
  

  public function is_vimeo($link) {
    return strpos($link, 'vimeo');
  }

	/** This is where you can add your own functions to twig.
	 *
	 * @param string $twig get extension.
	 */
	public function add_to_twig( $twig ) {
    
		$twig->addExtension( new Twig\Extension\StringLoaderExtension() );
    $twig->addFilter( new Twig\TwigFilter( 'myfoo', array( $this, 'myfoo' ) ) );
    $twig->addFunction( new Timber\Twig_Function( 'getCardTime', array($this, 'get_card_time') ) );
    $twig->addFunction( new Timber\Twig_Function( 'getHolidayDetails', array($this, 'get_holiday_details') ) );

    $twig->addFunction( new Timber\Twig_Function( 'getDate', array($this, 'get_date') ) );
    $twig->addFunction( new Timber\Twig_Function( 'getIsNow', array($this, 'get_is_now') ) );
    $twig->addFunction( new Timber\Twig_Function( 'getIsPast', array($this, 'get_is_past') ) );
    $twig->addFunction( new Timber\Twig_Function( 'getShareLink', array($this, 'get_share_link') ) );
    $twig->addFunction( new Timber\Twig_Function( 'isVimeo', array($this, 'is_vimeo') ) );
    $twig->addFunction( new Timber\Twig_Function( 'getShareTitle', array($this, 'get_share_title') ) );
    $twig->addFunction( new Timber\Twig_Function( 'getFormattedDate', array($this, 'get_formatted_date') ) );
		return $twig;
  }
  

}

new StarterSite();
