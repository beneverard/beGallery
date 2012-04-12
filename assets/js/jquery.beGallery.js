(function ($) {
	"use strict";

	$.beGallery = function(el, options) {
	 
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		
		var base = this;
		
		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;
		
		// Add a reverse reference to the DOM object
		base.$el.data("beGallery", base);
		
		base.init = function() {
		
			base.options = $.extend({}, $.beGallery.defaultOptions, options);
			
			var $element = $('figure:first-child', base.$el);
			
			if (window.location.hash) {
			
				var hash_number	= parseInt(window.location.hash.substr(-1), 10) - 1,
					hash_image	= $('.gallery figure')[hash_number],
					$element	= $(hash_image);
			
			}
			
			base.resizeImages();

			base.animateGallery($element);
			
			// bind events
			
			$('img', base.$el).on('click.beGallery', function(event) {
			
				event.preventDefault();
				
				var $parent = $(this).parent('figure');
				
				$parent.addClass('hover');
				
				base.animateGallery($parent);
				
			});
			
			$('img', base.$el).on("contextmenu.beGallery", function() {
							
				alert('No right clicking, you bastard');
				return false;
				
			});
			
			$('img', base.$el).on('dragstart.beGallery', function(event) {
				event.preventDefault();
			});
	
			function swipeStatus(event, phase, direction, distance)
			{
				var str = "Swipe Phase : " + phase + "<br/>";
				str += "Direction from inital touch: " + direction + "<br/>";
				str += "Distance from inital touch:: " + distance + "<br/>";
				
				if (distance<200)
					str +="<br/>Not yet reached threshold. <br/>Swipe will be canceled if you release at this point."
				else
					str +="<br/>Threshold reached<br/>Swipe handler will be triggered if you release at this point."
				
				if (phase=="cancel")
					str +="<br/>Handler not triggered."
				if (phase=="end")
					str +="<br/>Handler was triggered."	
				
				$("#test").html(str);
			}
			
			var original_position;

			$('img', base.$el).swipe({

				swipeStatus: function(event, phase, direction, distance) {

					var $gallery_slider = $('.gallery-slider', base.$el);

					if (phase !== 'move') {
						original_position = parseInt($gallery_slider.css('left'), 10);
						console.log(parseInt(original_position, 10));
					}

					switch (direction) {

						case 'left':
							$gallery_slider.css('left', original_position - distance);
							break;

						case 'right':
							$gallery_slider.css('left', original_position + distance);
							break;
					}

					switch (phase) {

						case 'cancel':
							// revert back to current
							break;

						case 'end':

							console.log("success!");

							if (direction === 'right') {
								console.log("right");
	 							base.animateGallery('prev');
	 						}

	 						if (direction === 'left') {

								console.log("left");
	 							base.animateGallery('next');
	 						}

							break;

					}



				},
				threshold: 200
			});

			$('body').bind('keyup.beGallery', function(event) {
				
				event.preventDefault();
												
				if (event.keyCode == 37) {
					base.animateGallery('prev');
				}
				
				if (event.keyCode == 39) {
					base.animateGallery('next');
				}
				
			});
			
			$(window).bind('resize.beGallery', function() {

				base.resizeImages();

				base.animateGallery();
			
			});
			
			$('.next, .prev', base.$el).live('click.beGallery', function(event) {
				
				event.preventDefault();
				
				var $self = $(this);
				
				if ($self.hasClass('prev')) {
					base.animateGallery('prev');
				}
				
				if ($self.hasClass('next')) {
					base.animateGallery('next');
				}
			
			});
		
		};
		
		base.resizeImages = function () {

			var $window	= $(window),
				x_scale	= $window.width() / base.options.max_width,
				y_scale	= $window.height() / base.options.max_height,
				scale	= 1;

			if (x_scale < scale) {
				scale = x_scale;
			}

			if (y_scale < scale) {
				scale = y_scale;
			}

			console.log(scale);

			if (scale !== 1) {

				$('.gallery-slider img').each(function () {

					var $self = $(this);

					$self.attr('width', parseInt($self.data('width'), 10) * scale);
					$self.attr('height', parseInt($self.data('height'), 10) * scale);

				});

			}

		};

		base.getGalleryPosition = function($element) {
		
			if ($element.length !== 1) {
				return false;
			}
			
			var position = $element.position();
			
			return Math.round((position.left - ((base.$el.width() / 2) - ($element.outerWidth() / 2))) * -1);
		
		};
		
		base.animateGallery = function ($element) {
			
			// 
			if (typeof $element === 'string') {
			
				switch ($element) {
				
					case 'prev':
					case 'previous':
					
						$element = $('figure.current', base.$el).prev('figure');
						break;
						
					case 'next':
					
						$element = $('figure.current', base.$el).next('figure');
						break;
				
				}
			
			}
			
			// if element is still undefined...
			if ($element === undefined) {
				$element = $('figure.current', base.$el);			
			}
			
			// if jQuery element doesn't exist...
			if (!$element.length) {
				return false;
			}
			
			// if jQuery element is already the one...
			if ($element.hasClass('current')) {
			// we can't discriminate here, we might be resizing?
			//	return false;
			}
			
			
			var $gallery_slider = $('.gallery-slider', base.$el);
			
			 //**********
			// ANIMATION
			
		
			
			// stop any current animations
			base.$el.clearQueue("animateGallery");
			
			$gallery_slider
				.stop()
				.find('.next, .prev')
					.stop();
			
			
			// Add the first queue item. Unlike the native animation
			// methods, manually created queue items don't start
			// executing right away - we have to manually call the
			// dequeue() method at the end.
			
			base.$el.queue("animateGallery", function (next) {
				
				$('.next, .prev', $gallery_slider).animate({opacity: '0'}, 200);
				
				next();
				
			});
			 
			// Delay the queue for a bit.
			base.$el.delay(200, "animateGallery");
			
			base.$el.queue("animateGallery", function (next) {
				
				// sort out the classes
				$('figure.current', base.$el).removeClass('current');
				$element.addClass('current');
				
				$('.next, .prev', $gallery_slider).remove();
				
				next();
				
			});
			
			// Add the next queue item.
			base.$el.queue("animateGallery", function (next) {
					
				$element.addClass('animating');
				$('.gallery-slider', base.$el).animate({left: base.getGalleryPosition($element)}, 500);
				
				next();
					
			});
			 
			// Delay the queue for a bit.
			base.$el.delay(500, "animateGallery");
			
			base.$el.queue("animateGallery", function (next) {
				
				$element.removeClass('animating hover');
				
				$element.append($('.gallery-arrows').html());
				$('.next, .prev', $gallery_slider).animate({opacity: '0.2'}, 100);
				
				next();
					
			});
			
			base.$el.delay(200, "animateGallery");
			
			base.$el.queue("animateGallery", function (next) {
				
				$('.next, .prev', base.$el).removeAttr('style');
				
				next();
					
			});
			 
			// dequeuing the animation queue will start things going
			base.$el.dequeue("animateGallery");
			
		};
		
		// Run initializer
		base.init();
		
	 };
	 
	$.beGallery.defaultOptions = {
		max_width: 1000,
		max_height: 700 	
	};
	 
	$.fn.beGallery = function (options) {
	 
		return this.each(function () {
			(new $.beGallery(this, options));
		});
	
	};
	 
})(jQuery);