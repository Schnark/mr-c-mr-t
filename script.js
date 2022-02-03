(function () {
"use strict";

var rAF = window.requestAnimationFrame || window.mozRequestAnimationFrame,
	cAF = window.cancelAnimationFrame || window.mozCancelAnimationFrame,
	currentAnimation, currentAnimationElement,
	buttonContinue, buttonRepeat, buttonEnd, ignoreHashchange;

function hide (el) {
	el.style.visibility = 'hidden';
}

function show (el) {
	el.style.visibility = 'visible';
}

function draw (el, v, callback) {
	var l = el.getTotalLength(), start;
	function getDash (p) {
		return (p >= 0 ? [l * p, l] : [0, l * (1 + p), l]).join(',');
	}

	function step (t) {
		var p;
		if (!start) {
			start = t;
			el.style.strokeDasharray = getDash(0);
			show(el);
		} else {
			p = v * (t - start) / l;
			if (Math.abs(p) >= 1) {
				el.style.strokeDasharray = '';
				callback();
				currentAnimation = false;
				return;
			}
			el.style.strokeDasharray = getDash(p);
		}
		currentAnimation = rAF(step);
	}
	currentAnimationElement = el;
	currentAnimation = rAF(step);
}

function cancelDraw () {
	if (currentAnimation) {
		cAF(currentAnimation);
		currentAnimation = false;
		currentAnimationElement.style.strokeDasharray = '';
	}
}

function hideAll (parent) {
	var i;
	for (i = 0; i < parent.children.length; i++) {
		hide(parent.children[i]);
	}
}

function hideElements (ids) {
	var i;
	for (i = 0; i < ids.length; i++) {
		hide(document.getElementById(ids[i]));
	}
}

function showElements (ids) {
	var i;
	for (i = 0; i < ids.length; i++) {
		show(document.getElementById(ids[i]));
	}
}

function drawElements (ids, v, callback) {
	var i = 0;
	function next () {
		if (i === ids.length) {
			callback();
		} else {
			draw(document.getElementById(ids[i++]), v, next);
		}
	}
	next();
}

function hideAllExcept (els, id) {
	var i;
	for (i = 0; i < els.length; i++) {
		els[i].style.display = els[i].id === id ? '' : 'none';
	}
}

function tellInit (id) {
	var els, i;

	if (!id || id.slice(0, 5) !== 'story' || !document.getElementById(id)) {
		document.getElementById('intro').style.display = '';
		document.getElementById('stories').style.display = 'none';
		return;
	}

	hideAll(document.getElementById('drawing'));
	hideAllExcept(document.querySelectorAll('#stories p'), id);
	document.getElementById('intro').style.display = 'none';
	document.getElementById('stories').style.display = 'block';

	els = document.getElementById(id).parentNode.children;
	for (i = 0; i < els.length; i++) {
		if (els[i].id === id) {
			break;
		} else if (els[i].id) {
			showElements(els[i].dataset.draw.split(' '));
		}
	}
	tell(id);
}

function tellContinue (id) {
	var el = document.getElementById(id);
	if (el.previousElementSibling) {
		el.previousElementSibling.style.display = 'none';
	}
	el.style.display = '';
	tell(id);
}

function tellRepeat (id) {
	hideElements(document.getElementById(id).dataset.draw.split(' '));
	tell(id);
}

function tell (id) {
	var el = document.getElementById(id);
	if (location.hash !== '#' + id) {
		ignoreHashchange = true;
		location.hash = '#' + id;
	}
	buttonContinue.style.display = 'none';
	buttonRepeat.style.display = 'none';
	buttonEnd.style.display = 'none';
	drawElements(el.dataset.draw.split(' '), Number(el.dataset.v || '1') * 0.1, function () {
		if (el.nextElementSibling) {
			buttonContinue.dataset.id = el.nextElementSibling.id;
			buttonContinue.style.display = '';
		} else {
			buttonEnd.style.display = '';
		}
		buttonRepeat.dataset.id = id;
		buttonRepeat.style.display = '';
	});
}

function init () {
	buttonContinue = document.getElementById('button-continue');
	buttonRepeat = document.getElementById('button-repeat');
	buttonEnd = document.getElementById('button-end');
	buttonContinue.addEventListener('click', function () {
		tellContinue(buttonContinue.dataset.id);
	});
	buttonRepeat.addEventListener('click', function () {
		tellRepeat(buttonRepeat.dataset.id);
	});
	buttonEnd.addEventListener('click', function () {
		location.hash = '';
		document.getElementById('intro').style.display = '';
		document.getElementById('stories').style.display = 'none';
	});
	window.addEventListener('hashchange', function () {
		if (ignoreHashchange) {
			ignoreHashchange = false;
		} else {
			cancelDraw();
			tellInit(location.hash.slice(1));
		}
	});
	tellInit(location.hash.slice(1));
}

init();

})();