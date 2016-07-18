/**
 *   Unslider by @idiot and @damirfoy
 *   Contributors:
 *   - @ShamoX
 *
 */

(function($, f) {
	var Lwslider = function() {
		//  Object clone
		var that = this;

		//  Set some options
		that.o = {
			speed: 2000,     // animation speed, false for no transition (integer or boolean)
			delay: 2000,    // delay between slides, false for no autoplay (integer or boolean)
			init: 0,        // init delay, false for no delay (integer or boolean)
			pause: !f,      // pause on hover (boolean)
			loop: !f,       // infinitely looping (boolean)
			keys: f,        // keyboard shortcuts (boolean)
			dots: f,        // display dots pagination (boolean)
			arrows: f,      // display prev/next arrows (boolean)
			prev: '&larr;', // text or html inside prev button (string)
			next: '&rarr;', // same as for prev option
            //方便响应式布局
			fluid: f,       // is it a percentage width? (boolean)
			starting: f,    // invoke before animation (function with argument)
			complete: f,    // invoke after animation (function with argument)
			items: '>ul',   // slides container selector
			item: '>li',    // slidable items selector
			easing: 'swing',// easing function to use for animation
			autoplay: true  // enable autoplay on initialisation
		};

		that.init = function(el, o) {
			//  Check whether we're passing any options in to Unslider
            //extend合并设置
			that.o = $.extend(that.o, o);

            //当前jquery对象
			that.el = el;
            //获取 所有第一级子元素中的 ul 元素。 '>ul'的含义
			that.ul = el.find(that.o.items);
			that.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			that.li = that.ul.find(that.o.item).each(function(index) {
				var me = $(this),
					width = me.outerWidth(),
					height = me.outerHeight();

				//  Set the max values
				if (width > that.max[0]) that.max[0] = width;
				if (height > that.max[1]) that.max[1] = height;
			});


			//  Cached vars
			var o = that.o,
				ul = that.ul,
				li = that.li,
				len = li.length;

			//  Current indeed
			that.i = 0;

			el.css({width: that.max[0], height: li.first().outerHeight(), overflow: 'hidden'});

			//  Set the relative widths
			ul.css({position: 'relative', left: 0, width: (len * 100) + '%'});
			if(o.fluid) {
				li.css({'float': 'left', width: (100 / len) + '%'});
			} else {
				li.css({'float': 'left', width: (that.max[0]) + 'px'});
			}

			//  Autoslide
			o.autoplay && setTimeout(function() {
				if (o.delay | 0) {
					that.play();
                    //如果有pause这个选项，鼠标移动在上面时停止切换
					if (o.pause) {
						el.on('mouseover mouseout', function(e) {
							that.stop();
                            //&&的新用法get，只有前面的成立才会执行后面的
							e.type == 'mouseout' && that.play();
						});
					};
				};
			}, o.init | 0);

			//  Keypresses
            //  快捷键功能，默认不开启
			if (o.keys) {
				$(document).keydown(function(e) {
					var key = e.which;

					if (key == 37)
						that.prev(); // Left
					else if (key == 39)
						that.next(); // Right
					else if (key == 27)
						that.stop(); // Esc
				});
			};

			//  Dot pagination
			o.dots && nav('dot');

			//  Patch for fluid-width sliders. Screw those guys.
            // 当调整浏览器窗口的大小时，发生 resize 事件。
            // resize() 方法触发 resize 事件，或规定当发生 resize 事件时运行的函数。
            //  这里最后为什么还要调用一次resize()？
			if (o.fluid) {
				$(window).resize(function() {
					that.r && clearTimeout(that.r);

					that.r = setTimeout(function() {
                        //eq() 选择器选取带有指定 index 值的元素。
                        //不同的li元素ul高自动适配
						var styl = {height: li.eq(that.i).outerHeight()},
							width = el.outerWidth();

						ul.css(styl);
						styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
						el.css(styl);
						li.css({ width: width + 'px' });
					}, 50);
				}).resize();
			};

			return that;
		};

		//  Move Unslider to a slide index
		that.to = function(index, callback) {
			if (that.t) {
				that.stop();
				that.play();
	        }
			var o = that.o,
				el = that.el,
				ul = that.ul,
				li = that.li,
				current = that.i,
				target = li.eq(index);

			$.isFunction(o.starting) && !callback && o.starting(el, li.eq(current));

			//  To slide or not to slide
			if ((!target.length || index < 0) && o.loop == f) return;

			//  Check if it's out of bounds
			if (!target.length) index = 0;
			if (index < 0) index = li.length - 1;
			target = li.eq(index);

			var speed = callback ? 5 : o.speed | 0,
				easing = o.easing,
				obj = {height: target.outerHeight()};

            //貌似fx是用来控制动画的，动画播放完后执行下面的
			if (!ul.queue('fx').length) {
			
                //改变圆点状态
				el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');

                //先是容器改变高度，然后是ul的平移
				el.animate(obj, speed, easing) && ul.animate($.extend({left: '-' + index + '00%'}, obj), speed, easing, function(data) {
					that.i = index;

					$.isFunction(o.complete) && !callback && o.complete(el, target);
				});
			};
		};

		//  Autoplay functionality
		that.play = function() {
			that.t = setInterval(function() {
				that.to(that.i + 1);
			}, that.o.delay | 0);
            return that
		};

		//  Stop autoplay
		that.stop = function() {
			that.t = clearInterval(that.t);
			return that;
		};

		//  Move to previous/next slide
		that.next = function() {
			return that.stop().to(that.i + 1);
		};

		that.prev = function() {
			return that.stop().to(that.i - 1);
		};

		//  Create dots and arrows
		function nav(name, html) {
            //貌似箭头的有bug,明天好好看一下
			if (name == 'dot') {
				html = '<ol class="dots">';
					$.each(that.li, function(index) {
						html += '<li class="' + (index == that.i ? name + ' active' : name) + '">' + ++index + '</li>';
					});
				html += '</ol>';
			}

			that.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function() {
				var me = $(this);
				me.hasClass('dot') ? that.stop().to(me.index()) : me.hasClass('prev') ? that.prev() : that.next();
			});
		};
	};

	//  Create a jQuery plugin
	$.fn.lwslider = function(o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it
            //  通过“this”来获得每个单独的元素
			var me = $(this),
				key = 'lwslider' + (len > 1 ? '-' + ++index : ''),
				instance = (new Lwslider).init(me, o);

			//  Invoke an Unslider instance
			me.data(key, instance).data('key', key);
		});
	};

	Lwslider.version = "1.0.0";
})(jQuery, false);
