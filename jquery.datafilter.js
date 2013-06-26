/**
	*	jQuery Data Filter Plugin
	*	written by Jonathan Stegall <jonathan.stegall@emory.edu>
	*	default usage:
	*	<script>
		$(function(){
			if ($('#main-content .az-list li').length > 1) {
				// pass the list to sort
				$('.az-list').dataFilter();
			}
		});
		</script>
	* example with settings for table, numbers as filter, starting with numbers selected, and also hiding the "All" link:
		$('.az-list').dataFilter({
			'criteria': 'family-name',
			'elementType': 'table',
			'elementChild': 'tbody tr',
			'startsWith': 'all',
			'showNumbers': true,
			'showAll': false
		});
	*/
(function ($) {
	"use strict";
	var methods = {
		init : function ( options ) {
			var settings = {
				'criteria': 'none',
				'elementType': 'ul',
				'elementChild': 'li',
				'startsWith': 'all',
				'showNumbers': false,
				'showAll': true,
				'showSearch': false,
				'searchPlacement': 'after',
				'searchPlaceholder': 'Search list',
				'formClass': '',
				'noResults': '<div class="no-results hidden clearfix"><h3>No results</h3><p>There are no results for your current search.</p></div>'
			};
			if (options) {
				$.extend( true, settings, options );
			}
			return this.each(function() {
				var thelist = $(this);
				_generateLetterLinks(thelist);
				_prepareLetterLinks(thelist, settings);
				_searchList(thelist, settings);
				_showClickedLetterItems(thelist, settings);
			});
						
			function _generateLetterLinks(listToSort) {
				// generate an ordered list with an <li> and <a> for each letter
				var showall = '';
				var shownumbers = '';
				if (settings.showAll === true) {
					showall = '<li id="letter_all"><a href="#">all</a></li>';
				}
				if (settings.showNumbers === true) {
					shownumbers = '<li id="letter_numeric"><a href="#">#</a></li>';
				}
				$(listToSort).before('<ol id="letter-filter" class="clearfix">'+showall+shownumbers+'<li id="letter_a"><a href="#">A</a></li><li id="letter_b"><a href="#">B</a></li><li id="letter_c"><a href="#">C</a></li><li id="letter_d"><a href="#">D</a></li><li id="letter_e"><a href="#">E</a></li><li id="letter_f"><a href="#">F</a></li><li id="letter_g"><a href="#">G</a></li><li id="letter_h"><a href="#">H</a></li><li id="letter_i"><a href="#">I</a></li><li id="letter_j"><a href="#">J</a></li><li id="letter_k"><a href="#">K</a></li><li id="letter_l"><a href="#">L</a></li><li id="letter_m"><a href="#">M</a></li><li id="letter_n"><a href="#">N</a></li><li id="letter_o"><a href="#">O</a></li><li id="letter_p"><a href="#">P</a></li><li id="letter_q"><a href="#">Q</a></li><li id="letter_r"><a href="#">R</a></li><li id="letter_s"><a href="#">S</a></li><li id="letter_t"><a href="#">T</a></li><li id="letter_u"><a href="#">U</a></li><li id="letter_v"><a href="#">V</a></li><li id="letter_w"><a href="#">W</a></li><li id="letter_x"><a href="#">X</a></li><li id="letter_y"><a href="#">Y</a></li><li id="letter_z"><a href="#">Z</a></li></ol>');
			}
			
			function _prepareLetterLinks(thelist, settings) {
				$(thelist).find(settings.elementChild).each(function() {
					var sortfield = '';
					if (settings.criteria === 'none') {
						sortfield = $(this).text().replace(/\s+/g, '').replace(/\(/g, '').replace(/\)/g, '');
					} else {
						sortfield = $(this).find('.'+settings.criteria).text().replace(/\s+/g, '').replace(/\(/g, '').replace(/\)/g, '');
					}
					var sortchar = encodeURI(sortfield.charAt(0).toLowerCase());
					
					if(/^\d+$/.test(sortchar)) {
						$('#letter_numeric').addClass('enabled');
						$(this).addClass('startswith_numeric');
					} else {
						$(this).addClass('startswith_'+sortchar);
					}
					$('#letter_'+sortchar).addClass('enabled');
					// enable the letter we're starting with
					$('#letter_'+settings.startsWith).addClass('enabled');
					if (!$('#letter_all').hasClass('enabled')) {
						$('#letter_all').addClass('enabled');
					}
				});
			}

			function _searchList(thelist, settings) {
				var form, placeholder, formClass, noResults, lis, len, oldDisplay, callback, searchWait, searchWaitInterval, item, filter, numShown, li;
				if (settings.showSearch !== true) {
					return false;
				}
				formClass = settings.formClass;
				placeholder = settings.searchPlaceholder;
				noResults = settings.noResults;

				form = '<div class="filter"><form action="" name="page-search" method="post"><div class="input"><label><input autocomplete="off" class="'+formClass+'" id="filter-on-page" name="filter-on-page" placeholder="'+placeholder+'" value="" type="search"/></label></div></form></div>';

				if (settings.searchPlacement === 'before') {
					$('#letter-filter').before(form);
				} else {
					$('#letter-filter').after(form);
				}

				$(thelist).after(noResults);
				$('.no-results').addClass('hidden');

				lis = thelist.children();
				len = lis.length;
				oldDisplay = len > 0 ? lis[0].style.display : "block";
				callback = settings.callback || function() {};
				callback(len); // do a one-time callback on initialization to make sure everything's in sync

				searchWait = 0;
				$('#filter-on-page').unbind('keypress keyup').bind('keypress keyup', function() {
					$('#letter-filter li a').removeClass('selected'); // remove the selected class
					item = $(this);
					searchWait = 0;
					if (!searchWaitInterval) {
						searchWaitInterval = setInterval(function() {
							if (searchWait >= 3) {
								clearInterval(searchWaitInterval);
								searchWaitInterval = '';
								filter = item.val().toLowerCase();
								if (filter === '') {
									$('#letter-filter li#letter_all a').addClass('selected');
								}
								//var startTime = new Date().getTime();
								numShown = 0;
								for (var i = 0; i < len; i++) {
									li = lis[i];
									if ((li.textContent || li.innerText || "").toLowerCase().indexOf(filter) >= 0) {
										if (li.style.display === "none") {
											li.style.display = oldDisplay;
										}
										numShown++;
									} else {
										if (li.style.display !== "none") {
											li.style.display = "none";
										}
									}
								}
								if (numShown === 0) {
									$('.no-results').removeClass('hidden');
								} else {
									$('.no-results').addClass('hidden');
								}
								callback(numShown);
								//var endTime = new Date().getTime();
								//console.log('Search for ' + filter + ' took: ' + (endTime - startTime) + ' (' + numShown + ' results)');
								//return false;
								searchWait = 0;
							}
							searchWait++;
						}, 200);
					}
				});
				if (typeof placeholderFallback === 'function') {
					placeholderFallback();
				}
				// need to run this again since it is a new form
			}
			
			function _showClickedLetterItems(thelist, settings) {
				var thisid, idfirstchar;
				// if we are showing all items, don't hide anything. otherwise, hide everything
				if (settings.startsWith !== 'all') {
					$(thelist).find(settings.elementChild).hide(); // hide the nonclicked items
					$('#letter-filter li a').removeClass('selected'); // remove the selected class
					// show whatever we start with
					$('#letter-filter li#letter_'+settings.startsWith+' a').addClass('selected');
					thisid = $('#letter-filter li#letter_'+settings.startsWith+' a').parent().attr('id');
				} else {
					$('#letter-filter li#letter_all a').addClass('selected');
					thisid = 'letter_all';
				}	
				idfirstchar = thisid.charAt(7);
				if (thisid === 'letter_numeric') {
					idfirstchar = 'numeric';
				}
				$(thelist).find(settings.elementChild+'.startswith_'+idfirstchar).show(); // show the right letter items
				$('#letter-filter li a').click(function() {
					return false; // don't do anything if an inactive one is clicked
				});
				$('#letter-filter li.enabled a').click(function() {
					$(thelist).find(settings.elementChild).hide(); // hide the nonclicked items
					$('#letter-filter li a').removeClass('selected'); // remove the selected class
					thisid = $(this).parent().attr('id');
					$(this).addClass('selected'); // add correct selected class
					idfirstchar = thisid.charAt(7);
					if (thisid === 'letter_numeric') {
						idfirstchar = 'numeric';
					}
					$(thelist).find(settings.elementChild+'.startswith_'+idfirstchar).show(); // show the right letter items
					return false;
				});
				$('#letter-filter li#letter_all a').click(function() { // show all the items
					$(thelist).find(settings.elementChild+':not(.ln-no-match)').show();
					$('#letter-filter li a').removeClass('selected');
					$('#letter-filter li#letter_all a').addClass('selected');
					return false;
				});
			}
		}    
	};
	
	$.fn.dataFilter = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.dataFilter' );
		}
	};
	
})(jQuery);