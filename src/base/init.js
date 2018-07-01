$(function() {

	var GLOBEL_TITLE = G_CONFIG['app_title'];

	var old_text = $('title').text().split('\n').join('').split(' ').join('');

	$('title').text(old_text + '-' + GLOBEL_TITLE);
	$('.xn-logo').find('a').eq(0).text(GLOBEL_TITLE);
	$('.xn-logo').find('a').eq(0).addClass('animated fadeIn');
	G_CONFIG.title_css && $('.xn-logo').find('a').eq(0).css(G_CONFIG['title_css']);
});