/*=====================
phil@affinio.com
@phil_renaud
March 2016
=====================*/


/*=======================================================
ESTABLISH OUR GLOBAL VARIABLES
=======================================================*/

// Working data from STATSCAN, CANSIM table: 026-0018
// Residential property values, by province, territory and census metropolitan area (CMA)
// Default table must be modified to get proper format for this analysis,
// Add/remove data -> Deselect provinces, select all CAMs (except for Ottawa-Gatineau
// url: http://www5.statcan.gc.ca/cansim/a03?lang=eng&pattern=026-0018&p2=31

var housingPrices = [{"id":"2005","stats":[{"name":"atlanticCanada","value":40318},{"name":"quebec","value":302895},{"name":"ontario","value":841185},{"name":"praries","value":228571},{"name":"bc","value":359209}]},{"id":"2006","stats":[{"name":"atlanticCanada","value":43422},{"name":"quebec","value":329536},{"name":"ontario","value":905676},{"name":"praries","value":302029},{"name":"bc","value":443405}]},{"id":"2007","stats":[{"name":"atlanticCanada","value":47941},{"name":"quebec","value":358160},{"name":"ontario","value":991118},{"name":"praries","value":425449},{"name":"bc","value":501512}]},{"id":"2008","stats":[{"name":"atlanticCanada","value":53921},{"name":"quebec","value":392858},{"name":"ontario","value":1032649},{"name":"praries","value":437268},{"name":"bc","value":510187}]},{"id":"2009","stats":[{"name":"atlanticCanada","value":59169},{"name":"quebec","value":416567},{"name":"ontario","value":1083576},{"name":"praries","value":406330},{"name":"bc","value":513857}]},{"id":"2010","stats":[{"name":"atlanticCanada","value":64978},{"name":"quebec","value":456750},{"name":"ontario","value":1169132},{"name":"praries","value":447139},{"name":"bc","value":570576}]},{"id":"2011","stats":[{"name":"atlanticCanada","value":70194},{"name":"quebec","value":493263},{"name":"ontario","value":1272567},{"name":"praries","value":455817},{"name":"bc","value":625951}]},{"id":"2012","stats":[{"name":"atlanticCanada","value":74290},{"name":"quebec","value":527530},{"name":"ontario","value":1378004},{"name":"praries","value":484348},{"name":"bc","value":639315}]}]

// Set ourArray to the data you'd like to use for this experiment, and title your chart to match
var ourArray = housingPrices;
$('h4.bar-chart-title').text('Housing Prices, 2005 - 2012');










/*=======================================================
INITIALIZATION
=======================================================*/

// jQuery has a $(document).ready() function that fires when your page is ready to go.
// let's use it to kick things off.
$(document).ready(function(){
  universalController();
}); //document.ready


// Think of universalController() as our Table of Contents
function universalController(){

  console.log('Universal Controller - ready to run your functions!');

////// STEP 1: Draw a bar for each year of our data.
    initializeBars(ourArray);

////// STEP 2: Allow for user interaction with our visualization
    initializeControls();

////// STEP 3: Advanced interaction through a click and hold interface
     handleTouch();

}; //universalController










/*=======================================================
STEP 1: STATIC BAR GRAPH
=======================================================*/

function initializeBars(comparable) {
// We create a new element using jQuery. We can style it in CSS using the .bar-chart class.
  $('.sandbox').append('<div class="bar-chart"></div>');

// We reduce our comparable to yearly totals
  yearTotals = _.map(comparable, function(obj,iter){
    var valueArray = _.pluck(obj.stats, "value");
    return _.reduce(valueArray, function(memo,num) { return memo + num });
  }); //_.map

// For each of this yearly totals, create a bar in our new bar chart.
  $.each(yearTotals, function(key,value){
    $('.bar-chart').append('<div class="bar" data-index="'+comparable[key].id+'" data-value="'+value+'"><span><em>' + comparable[key].id + ':</em> <strong>' + commafy(value) + '</strong></span></div>');
  }); //each yearTotals

//////// Step 1A: Make the length of each bar relative to its $ spent
    relativeBarWidths();

//////// Step 1B: Drop another level of metrics in: a breakdown of the yearly spend
    createLegend(comparable);
    applyCategories(comparable);

//////// Step 1C: Make the width of each category proportional to 
    setCategoryWidths();
    setCategoryRatios(comparable);

}; //initializeBars




/*=======================================================
STEP 1A: RELATIVE BAR WIDTHS
=======================================================*/

// Each bar should have its width proportional to the relative max
function relativeBarWidths(){
  var max = _.max(yearTotals);
  $('.bar').each(function(){
    $(this).css({'width': $(this).attr('data-value') / max * 100 + "%"})
  }); //each bar
}; //relativeBarWidths




/*=======================================================
STEP 1B: SPEND-BY-CATEGORY LEVEL OF DATA
=======================================================*/

function createLegend(comparable) {
  var colorRange = d3.scale.category10().domain(d3.range(11).reverse());
  $('.bar-chart').after('<div class="legend"></div>');
  var categories = _.pluck(comparable[0].stats, 'name');
  $.each(categories, function(key,value){
    var span = $('<span>'+value+'</span>');
    span.css({'border-color': d3.rgb(colorRange(key)).brighter(1)});
    span.css({'background-color': d3.rgb(colorRange(key)).darker(1)});
    $('.legend').append(span);
  })
}; //createLegend

function applyCategories(comparable) {
  var colorRange = d3.scale.category10().domain(d3.range(11).reverse());
  $('.bar').each(function(){
    var bar = $(this);
    bar.append('<div class="statsblock"></div>');
    var index = bar.attr('data-index');
    var relevantStats = _.findWhere(comparable, {'id':index})['stats'];
    $.each(relevantStats, function(key,value) {
      var stat = $('<span class="stat" data-index="'+value['name']+'" data-value="'+value['value']+'"></span>');
      stat.css({'background-color': colorRange(key)});
      bar.children('.statsblock').append(stat);
    }); //each relevantStats
  }); //each bar
}; //applyCategories




/*=======================================================
STEP 1C: CATEGORY LEVEL WIDTHS AS PROPORATION OF SPEND
=======================================================*/

function setCategoryWidths(){
  $('.bar').each(function(){
    var bar = $(this);
    var index = bar.attr('data-index');
    var relevantStats = _.findWhere(ourArray, {'id':index})['stats'];
    var barTotal = _.reduce(_.pluck(relevantStats, 'value'), function(memo,num){ return memo + num });
    $.each($(this).find('.stat'), function(stat_id,stat){
      $(stat).css({'width': $(stat).attr('data-value') / barTotal * 100 + "%"});
    })
  })  
}

// ratios of each spending category, will be used later to normalize by category spending
function setCategoryRatios(comparable) {
  var categoryTotals = _.map(comparable[0]['stats'], function(obj,iter){
    return _.reduce(_.map(comparable, function(obj2,iter2){
      return _.find(obj2.stats, function(obj3,iter3){
        return obj3.name == obj.name;
      }).value;
    }), function(memo,num){
      return memo+num
    }); //reduce
  }); //categoryTotals
  var average = _.reduce(categoryTotals, function(memo, num){ return memo + num; }, 0) / categoryTotals.length;

// Setting categoryRatios as a global variable that we can access later
  categoryRatios = [];
  $.each(categoryTotals, function(i){
    categoryRatios[i] = 1/(categoryTotals[i] / average);
  })
  // REM: Found bug here, we were doing pluck on exportsToCanada instead of ourArray
  // This caused unexpected behavior for data that is not export related...
  categoryRatios = _.object(_.pluck(ourArray[0]['stats'], 'name'), categoryRatios);

// storing the categoryRatios on the comparable object and ourArray
  comparable = _.map(comparable, function(obj,iter){
    var stats = _.map(obj.stats, function(obj2,iter2){
      obj2.normalizedValue = categoryRatios[obj2.name] * obj2.value;
      return obj2;
    }); //innermap
    obj.stats = stats;
    return obj;
  }); //map
  ourArray = comparable;
}; //setCategoryRatios



















/*=======================================================
STEP 2: User Interface Controls
=======================================================*/

function initializeControls(){
// Set up a controls box that can be style with css with .controls{}
  $('#world-container').after('<div class="controls"><h5>Controls</h5></div>');
  $('.controls').append('<div><h6>Categories Full Height:</h6><a class="cat_full_height_on">On</a><a class="cat_full_height_off">Off</a></div>')
  $('.controls').append('<div><h6>Normalize by Annual Volume ("what is the % of annual price?"):</h6><a class="norm_tv_on">On</a><a class="norm_tv_off">Off</a></div>')
  $('.controls').append('<div><h6>Normalize by Category Size: ("what year made the biggest impact to a given area?")</h6><a class="norm_cs_on">On</a><a class="norm_cs_off">Off</a></div>')
  
  // REM: Add another control for sorting the list  
  $('.controls').append('<div><h6>Sort on Click by Category Size: ("smallest to largest")</h6><a class="sort_size_on">On</a><a class="sort_size_off">Off</a></div>')

// Set the initial state of our on/off switches
  $('.norm_tv_off').addClass('active');
  $('.norm_cs_off').addClass('active');
  $('.cat_full_height_off').addClass('active');
  
  // REM: Default the sort to on
  $('.sort_size_on').addClass('active');

// Category heights
  $(document).on('click', '.cat_full_height_on', function(){
    $('.statsblock').css({'height':'100%'});
    $('.cat_full_height_on').addClass('active').siblings().removeClass('active');
  })
  $(document).on('click', '.cat_full_height_off', function(){
    $('.statsblock').css({'height':'3px'});
    $('.cat_full_height_off').addClass('active').siblings().removeClass('active');
  })

// Normalized Annual Volume
  $(document).on('click', '.norm_tv_on', function(){
    $('.bar').css({'width':'100%'});
    $('.norm_tv_on').addClass('active').siblings().removeClass('active');
  })
  $(document).on('click', '.norm_tv_off', function(){
    relativeBarWidths();
    $('.norm_tv_off').addClass('active').siblings().removeClass('active');
  })

// Normalized Category Size
  $(document).on('click', '.norm_cs_on', function(){
    normalizeCategories();
    $('.norm_cs_on').addClass('active').siblings().removeClass('active');
  })
  $(document).on('click', '.norm_cs_off', function(){
    setCategoryWidths();
    $('.norm_cs_off').addClass('active').siblings().removeClass('active');
  })
  
  // REM: Sort by size or by time. No need to actually do anything
  // other than handle the button state changes. We'll look for the state
  // in the click handing logic.
  $(document).on('click', '.sort_size_on', function(){
    $('.sort_size_on').addClass('active').siblings().removeClass('active');
  })
  $(document).on('click', '.sort_size_off', function(){
    $('.sort_size_off').addClass('active').siblings().removeClass('active');
  })
}; //initializeControls


function normalizeCategories(){
  $('.bar').each(function(){
      
    var bar = $(this);
    var index = bar.attr('data-index');
    var relevantStats = _.findWhere(ourArray, {'id':index})['stats'];
    var normalizedBarTotal = _.reduce(_.pluck(relevantStats, 'normalizedValue'), function(memo,num){ return memo + num });
    $.each($(this).find('.stat'), function(stat_id,stat){
      $(stat).css({'width': $(stat).attr('data-value') * categoryRatios[$(stat).attr('data-index')] / normalizedBarTotal * 100 + "%"});
    }); //each stat (category) in the bar
  }); //each bar
}; //normalizeCategories










/*=======================================================
STEP 3: HANDLE ADVANCED INTERACTION
=======================================================*/

function handleTouch(){
// Observe the "mousedown" (click + hold) event on all of our category color-bars
  $(document).on('mousedown', '.stat', function(evt){
    var self = this;
    var globaloffset = $(this).position().left;
    $('.statsblock').each(function(){
      $(this).css({'height': '100%'});
      var blockoffset = $(this).children('[data-index="'+$(self).attr('data-index')+'"]').position().left;
      $(this).animate({'left': globaloffset-blockoffset}, 200);
      $(this).parents('.bar').children('span').children('strong').text(commafy($(this).children('[data-index="'+$(self).attr('data-index')+'"]').attr('data-value')));
    }); //each

// Fade out all bars not of the category you clicked
    $('.stat:not("[data-index='+$(self).attr('data-index')+']")').css({'opacity':0.2});
    $('.stat[data-index='+$(self).attr('data-index')+']').addClass('active');
    $('.bar').css({'background-color':'transparent'});

////// OPTIONAL: Sort bars based on order
    // REM: Only sort if the sort size control is on
    if($('.sort_size_on').is('.active'))
    {
        var barHeight = $('.bar').height() + 11;
        var sorted = _.sortBy($('.stat[data-index="'+$(self).attr('data-index')+'"]'), function(obj,iter){
          return $(obj).width();
        }); //sorted
        _.map(sorted, function(obj,iter){
          var startHeight = barHeight * (iter) - $(obj).parents('.bar').position().top + 20;
          $(obj).parents('.bar').css({'top':startHeight}).attr('which', iter);
        })
    }

// Reset the position of everything wehn you release your mouse
    $(document).on('mouseup', function(){
      $('.statsblock').animate({'left':'0px', 'height': $('.cat_full_height_on').is('.active') ? '100%' : '3px'}, 200);
      $('.stat').css({'opacity':'1'}).removeClass('active');
      $('.bar').css({'top':'0px', 'background-color': 'rgba(0,0,0,0.1)'});
      $('.bar').each(function(){
        $(this).children('span').children('strong').text(commafy($(this).attr('data-value')));
      })
      $(document).off('mouseup');
    }); //documnet on mouseup
    return false;
  }) //click

}; //handleTouch

















// Make big numbers into pretty numbers
function commafy(num) {
  if (num){
    var str = num.toString().split('.');
    if (str[0].length >= 4) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
  }
}; //commafy
