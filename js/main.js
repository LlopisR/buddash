// INIT ITEMS
// init if first run
if(!localStorage.getItem('active-items')){
	localStorage.setItem('active-items','');
	localStorage.setItem('max-id','0');
	localStorage.setItem('amount-daily','0');
	localStorage.setItem('amount-weekly','0');
	localStorage.setItem('amount-monthly','0');
	localStorage.setItem('amount-tools','0');
}
// get active items + max id
var activeItems = localStorage.getItem('active-items');
var maxId = parseInt(localStorage.getItem('max-id'));


var activeItemsArray = activeItems.split(',');

var collection = Array();
var arrayLength = activeItemsArray.length;

// create collection
for(var i = 0; i < arrayLength; i++){
	collection.push(JSON.parse(localStorage.getItem(activeItemsArray[i])));
}

// ITEMS LAYOUT
function itemsLayout(){
	// sort items correctly (can't serialize)
	$('#daily-list').sortItems();
	$('#weekly-list').sortItems();
	$('#monthly-list').sortItems();
	$('#tools-list').sortItems();
    // d&d sortable
    $('.sites-list').sortable({
    	connectWith: '.sites-list',
    	items: ':not(.add-button)'
    }).bind('sortupdate', function(e, ui) {
	    /* update items when one is moved*/
	    
	    /* si on drag&drop dans la même liste */
	    var ddListStart = ui.startparent.attr('id').split('-');
	    var ddListEnd = ui.endparent.attr('id').split('-');
	    var ddName = ui.item.attr('data-name');

	    if(ui.startparent.attr('id')==ui.endparent.attr('id')){

		    for(i=0;i<collection.length;i++){
		    	if(collection[i].list==ddListStart[0]){
		    		var ddPos = $('li[data-name='+collection[i].name+']').index();
		    		// change attribute
		    		$('li[data-name='+collection[i].name+']').attr('data-sort',ddPos);

		    		// change json object + localStorage
		    		collection[i].position = ddPos;
		    		var dataToStore = JSON.stringify(collection[i]);
					localStorage.setItem(collection[i].id, dataToStore);
		    	}
			}
		}
		else{
	    /* si on drag&drop dans une autre liste */
	    	for(i=0;i<collection.length;i++){
		    	if(collection[i].list==ddListStart[0] || collection[i].list==ddListEnd[0]){
		    		var ddPos = $('li[data-name='+collection[i].name+']').index();
		    		// change attribute
		    		$('li[data-name='+collection[i].name+']').attr('data-sort',ddPos);

		    		// change position json objects + localStorage
		    		collection[i].position = ddPos;
		    		var dataToStore = JSON.stringify(collection[i]);
					localStorage.setItem(collection[i].id, dataToStore);

					// si c'est l'item qu'on a bougé il faut modifier sa list
					if(collection[i].name==ddName){
						collection[i].list = ddListEnd[0];
						var dataToStore = JSON.stringify(collection[i]);
						localStorage.setItem(collection[i].id, dataToStore);
					}
		    	}
			}
			/* increment/decrement list amount */
			var oldStartCount = parseInt(localStorage.getItem('amount-'+ddListStart[0]));
			localStorage.setItem('amount-'+ddListStart[0], oldStartCount+1);
			var oldEndCount = parseInt(localStorage.getItem('amount-'+ddListEnd[0]));
			localStorage.setItem('amount-'+ddListEnd[0], oldEndCount+1);
		}
	});
}

// SORT ITEMS
jQuery.fn.sortItems = function sortItems() {
    $("> li", this[0]).sort(dec_sort).appendTo(this[0]);
    function dec_sort(a, b){ return ($(b).data("sort")) < ($(a).data("sort")) ? 1 : -1; }
}

// FORMAT DATE
function parseDate(str) {
    var mdy = str.split('-')
    return new Date(mdy[0], mdy[1]-1, mdy[2]);
}

// DIFF BETWEEN 2 DAYS
function daydiff(first, second) {
    return (second-first)/(1000*60*60*24);
}

// GET TODAY AS A STRING
function todayString(){
	var today = new Date()
	var jday = today.getDate();
	var mday = today.getMonth()+1;
	var yday = today.getFullYear();
	today = yday+'-'+mday+'-'+jday;	
	return today;
}

// IS LINK VISITED
function isVisited(list,visited){
	var today = todayString();
	var diff = daydiff(parseDate(visited), parseDate(today));

	if(diff>=1 && list=='daily'){ return false;}
	else if(diff>=7 && list=='weekly'){ return false;}
	else if(diff>=30 && list=='monthly'){ return false;}
	else if(list=='tools'){ return false;}
	else{ return true;}
}

// UPDATE VISIT DATE
function updateVisitDate(elm){
	var today = todayString();
	var item = JSON.parse(localStorage.getItem(elm));
	if(item){
		item.last_visited = today;
		var dataToStore = JSON.stringify(item);
		localStorage.setItem(item.id, dataToStore);
	}
}

// DISPLAY COLLECTION
function displayCollection(){
	for(var i = 0; i < collection.length; i++){

		// generate DOM item
		if(arrayLength>0){
			if(isVisited(collection[i].list,collection[i].last_visited)){
				$('#'+collection[i].list+'-list').prepend('<li class="animated zoomIn visited" data-sort="'+collection[i].position+'" data-name="'+collection[i].name+'" data-id="'+collection[i].id+'"><a class="link" href="'+collection[i].url+'" target="_blank"><div class="edit-item" data-list="'+collection[i].list+'"></div><div class="del-item" data-list="'+collection[i].list+'"></div><div class="visited"></div><img src="'+collection[i].picture+'" alt="'+collection[i].friendly_name+'"></a>'+collection[i].friendly_name+'</li>');
			}
			else{
				$('#'+collection[i].list+'-list').prepend('<li class="animated zoomIn" data-sort="'+collection[i].position+'" data-name="'+collection[i].name+'" data-id="'+collection[i].id+'"><a class="link" href="'+collection[i].url+'" target="_blank"><div class="edit-item" data-list="'+collection[i].list+'"></div><div class="del-item" data-list="'+collection[i].list+'"></div><img src="'+collection[i].picture+'" alt="'+collection[i].friendly_name+'"></a>'+collection[i].friendly_name+'</li>');
			}
		}
	}
	// sort + drag & drop
	itemsLayout();

}

// TOGGLE ADD/EDIT MENU
function toggleMenu(bodyEl,isOpen) {

		if( isOpen ) {
			$('.menu-img').removeClass('active');
			classie.remove( bodyEl, 'show-menu' );
			// clear fields
			$('input[type=text],input[type=hidden]').val('');
			$('.pic-holder').attr('src','');
			$('input[type=submit]').val('Add to Collection');
			$('h1').html('Add a Site');
			$('.img-options').removeClass('active');
			// reset auto image
			$('.pic-holder').attr('data-auto','true');
		}
		else {
			classie.add( bodyEl, 'show-menu' );
			$('input[name=name]').focus();
		}
		return !isOpen;
	}

// WELCOME INIT
function welcomeToggle(isOpen){
	if(isOpen){
		$('#welcome-container').removeClass('animated fadeInDownBig');
		$('#welcome-container').addClass('animated fadeOutUpBig');
		setTimeout(function(){
			$('.container').removeClass('blur');
		},300);
		$('.buddash-logo').removeClass('levitate');
		$('.shadow').removeClass('active');
	}
	else{
		$('#welcome-container').addClass('animated fadeInDownBig');
		setTimeout(function(){
			$('.container').addClass('blur');
		},300);
		setTimeout(function(){
			$('.buddash-logo').addClass('levitate');
		},2000);
		setTimeout(function(){
			$('.shadow').addClass('active');
		},3000);
	}
	return !isOpen;
}


// CHANGE SLIDE WELCOME SLIDER
function changeSlide(param){
	var current = parseInt($('#welcome-container nav a.active').attr('data-slideId'));
	if(param=='+' && current<5){
		var slideId = current+1;
	}
	else if(param=='+' && current>4){
		var slideId = current;
	}
	else if(param=='-' && current>1){
		var slideId = current-1;
	}
	else if(param=='-' && current<2){
		var slideId = current;
	}
	else if(!current){
		var slideId = 1;
	}
	else{
		var slideId = param;
	}
	var offset = -420 * parseInt(slideId);
	$('#slides-container').css('transform','translateX('+offset+'px)');

	// show/hide nav
	$('#welcome-container nav').addClass('active');
	// nav active item
	$('#welcome-container .change-slide').removeClass('active');
	$('.change-slide[data-slideId='+slideId+']').addClass('active');
}

/* GET PICTURE FROM FACEBOOK SEARCH API */
function getPicture(search){
	var isAuto = $('.pic-holder').attr('data-auto');
	if(isAuto != 'false'){
		if(search){
			$.getJSON( "https://graph.facebook.com/search?q="+search+"&type=page&access_token=389462007849578|9817455b1f4793db6d1c889145bbeb7f&limit=1", function( data ) {
				pageid = data.data[0].id;
				$('.pic-holder').attr('src','http://graph.facebook.com/'+pageid+'/picture/?width=100&height=100');
			});
		}
	}
}

/* GET MORE PICS FROM FACEBOOK */
function displayMoreImg(search){
	if(search){
		$('.menu-img div').html('');
		$.getJSON( "https://graph.facebook.com/search?q="+search+"&type=page&access_token=389462007849578|9817455b1f4793db6d1c889145bbeb7f&limit=20", function( data ) {
			length = data.data.length;
			for(i=0;i<length;i++){
				$('.menu-img div').append('<img src="http://graph.facebook.com/'+data.data[i].id+'/picture/?width=100&height=100" class="animated zoomIn">');
			}
		});
	}
}


$(function() {
	
	//=== CODROPS MENU ===//
	var bodyEl = document.body,
		content = document.querySelector( '.content-wrap' ),
		openbtn = document.getElementById( 'open-button' ),
		closebtn = document.getElementById( 'close-button' ),
		isOpen = false;
		var isOpenWelcome = false;
		var flagUrl = 0;

	$('.open-button').on('click',function(){
		isOpen = toggleMenu(bodyEl,isOpen);
	});
	$('#close-button').on('click',function(){
		isOpen = toggleMenu(bodyEl,isOpen);
	});
	$(document).keyup(function(e) {
	  if (e.keyCode == 27 && isOpen) isOpen = toggleMenu(bodyEl,isOpen); // esc to close ADD NEW
	  if (e.keyCode == 27 && isOpenWelcome) isOpenWelcome = toggleWelcome(isOpenWelcome); // esc to close WELCOME
	  if (e.keyCode == 13 && isOpenWelcome) changeSlide('+'); // Enter to next slide
	  if (e.keyCode == 39 && isOpenWelcome) changeSlide('+'); // → to next slide
	  if (e.keyCode == 37 && isOpenWelcome) changeSlide('-'); // ← to prev slide
	  if (e.keyCode == 13 && flagUrl%2!=0){ // Enter to get image from URL and close menu
	  	
	  	var newImage = $('.menu-url input').val();
		$('.pic-holder').attr('src',newImage).attr('data-auto','false');

	  	flagUrl++;
	  	$('.menu-url').removeClass('active');
	  }
	});


	//=== DISPLAY COLLECTION ===//
	displayCollection();

	//=== UPDATE VISIT DATE ==//
	$('.sites-list a').on('click',function(){
		var elm = $(this).parent().attr('data-id');
		updateVisitDate(elm);
		if(!$(this).hasClass('placeholder')){
			$(this).parent().addClass('visited');
			$(this).prepend('<div class="visited"></div>');
		}

	});

	//=== ADD NEW ===//
	// fill list hidden field
	$('.open-button').on('click',function(){
		var list = $(this).attr('data-list');
		$('input[name=list]').attr('value',list);
		
	});


	//change preview
	$('input[name=name]')
		.on('keyup',function(){
			var currentNiceName = $('input[name=name]').val();
			var currentName = currentNiceName.toLowerCase().replace(' ','');
			//$('.pic-holder').css('background-image','url(img/icons/'+currentName+'.png)');
		})
		.on('blur',function(){
			var currentNiceName = $('input[name=name]').val();
			getPicture(currentNiceName);
			$('.img-options').addClass('active');
		});


	// form submission
	$('form').on('submit',function(){
		var update = parseInt($('input[name=update]').val());

		// reset auto image
		$('.pic-holder').attr('data-auto','true');

		// get active items + max id
		var activeItems = localStorage.getItem('active-items');
		var maxId = parseInt(localStorage.getItem('max-id'));
		// get variables
		var itemNiceName 	= $('input[name=name]').val();
		var itemURL 		= $('input[name=url]').val();
		if(itemNiceName=='' || itemURL==''){
			throw new Error("Fields shouldn't be empty.");
		}
		var itemName 		= itemNiceName.toLowerCase().replace(' ','');
		
		if(!update){ // NEW
			var itemId 			= maxId+1;
			var itemList		= $('input[name=list]').val();
			var itemPicture		= $('.pic-holder').attr('src');
			var itemPosition	= parseInt(localStorage.getItem('amount-'+itemList))+1;
			// transform into json & store it
			var data = JSON.parse('{"id": "'+itemId+'","name": "'+itemName+'","friendly_name": "'+itemNiceName+'","url": "'+itemURL+'","list": "'+itemList+'","position": "'+itemPosition+'","last_visited": "2015-05-01","picture": "'+itemPicture+'"}');
			var dataToStore = JSON.stringify(data);
			localStorage.setItem(itemId, dataToStore);
			// increment flags with new id
			if(!arrayLength){
				activeItems = itemId;
			}
			else{
				activeItems = activeItems+','+itemId;
			}
			localStorage.setItem('active-items',activeItems);
			localStorage.setItem('max-id',itemId);
			localStorage.setItem('amount-'+itemList,itemPosition);
			// display new item
			$('#'+itemList+'-list').append('<li class="animated zoomIn" data-sort="'+itemPosition+'" data-name="'+itemName+'" data-id="'+itemId+'"><a class="link" href="'+itemURL+'" target="_blank"><div class="edit-item" data-list="'+itemList+'"></div><div class="del-item" data-list="'+itemList+'"></div><img src="'+itemPicture+'" alt="'+itemNiceName+'"></a>'+itemNiceName+'</li>');
		}
		else{ // UPDATE
			var itemId = update;
			var itemPicture	= $('.pic-holder').attr('src');
			var jsonItem = JSON.parse(localStorage.getItem(update));
			var data = JSON.parse('{"id": "'+update+'","name": "'+itemName+'","friendly_name": "'+itemNiceName+'","url": "'+itemURL+'","list": "'+jsonItem.list+'","position": "'+jsonItem.position+'","last_visited": "'+jsonItem.last_visited+'","picture": "'+itemPicture+'"}');
			var dataToStore = JSON.stringify(data);
			localStorage.setItem(itemId,dataToStore);
			// kill old item
			$('li[data-id='+itemId+']').remove();
			// display new item
			$('#'+jsonItem.list+'-list').append('<li class="animated zoomIn" data-sort="'+jsonItem.position+'" data-name="'+itemName+'" data-id="'+itemId+'"><a class="link" href="'+itemURL+'" target="_blank"><div class="edit-item" data-list="'+jsonItem.list+'"></div><div class="del-item" data-list="'+jsonItem.list+'"></div><img src="'+itemPicture+'" alt="'+itemNiceName+'"></a>'+itemNiceName+'</li>');
		}

		// toggle menu
		isOpen = toggleMenu(bodyEl,isOpen);

		// sort items + drag&drop
		itemsLayout();

		return false;
	});
	
	// EDIT / DELETE INIT
	var flagDel = {daily:0,weekly:0,monthly:0,tools:0};
	var flagEdit = {daily:0,weekly:0,monthly:0,tools:0};
	// delete (show icons)
	$('body').on('click','.del',function(){
		var list = $(this).attr('id').split('-');
			list = list[1];
			listElm = '#'+list+'-list';

		if(flagDel[list]%2==0){
			$(listElm+' li').addClass('blur');
			$(listElm+' li .visited').addClass('inactive');
			$(listElm+' li .del-item').addClass('active');
			$(listElm).prev('h2').find('.edit').css('visibility','hidden');
		}
		else{
			$(listElm+' li').removeClass('blur');
			$(listElm+' li .visited').removeClass('inactive');
			$(listElm+' li .del-item').removeClass('active');
			$(listElm).prev('h2').find('.edit').css('visibility','visible');
		}
		flagDel[list]++;
		$('.edit-item[data-list='+list+']').css('z-index','1000');
		$('.del-item[data-list='+list+']').css('z-index','1100');
		return false;	
	});

	// edit (show icons)

	$('body').on('click','.edit',function(){
		var list = $(this).attr('id').split('-');
			list = list[1];
			listElm = '#'+list+'-list';

		if(flagEdit[list]%2==0){
			$(listElm+' li').addClass('blur');
			$(listElm+' li .visited').addClass('inactive');
			$(listElm+' li .edit-item').addClass('active');
			$(listElm).prev('h2').find('.del').css('visibility','hidden');
		}
		else{
			$(listElm+' li').removeClass('blur');
			$(listElm+' li .visited').removeClass('inactive');
			$(listElm+' li .edit-item').removeClass('active');
			$(listElm).prev('h2').find('.del').css('visibility','visible');
		}
		flagEdit[list]++;
		$('.edit-item[data-list='+list+']').css('z-index','1100');
		$('.del-item[data-list='+list+']').css('z-index','1000');
		return false;	
	});

	// DELETE ITEM
	$('body').on('click','.del-item',function(){
		var itemId = parseInt($(this).parent().parent().attr('data-id'));
		var itemList = $(this).attr('data-list');
		$(this).parent().parent().removeClass('zoomIn').addClass('zoomOut').delay(100).animate({'width':'0','margin-right':0},100);
		setTimeout(function(){
			// remove node
			$(this).parent().parent().remove();
			// remove item from localStorage
			localStorage.removeItem(itemId);
			// remove id from active-items
			for(var i = 0; i < activeItemsArray.length; i++){
				if(activeItemsArray[i]==itemId){
					activeItemsArray.splice(i, 1);
				}
			}
			var activeItemsString = activeItemsArray.join(',');
			localStorage.setItem('active-items',activeItemsString);
			// decrement list amount
			var amount = parseInt(localStorage.getItem('amount-'+itemList))-1;
			console.log(itemList);
			localStorage.setItem('amount-'+itemList,amount);
			// decrement max-id
			if(itemId==maxId){
				localStorage.setItem('max-id',maxId-1); // bad -> rework needed
			}
		}, 200);
		return false;
	});

	// EDIT SETUP MODAL
	$('body').on('click','.edit-item',function(){
		isOpen = toggleMenu(bodyEl,isOpen);
		var itemId = $(this).parent().parent().attr('data-id');

		for(var i = 0; i < collection.length; i++){
			if(collection[i].id==itemId){
				var itemName = collection[i].name;
				var itemNiceName = collection[i].friendly_name;
				var itemURL = collection[i].url;
				var itemPicture = collection[i].picture;
			}
		}
		$('.pic-holder').attr('src',itemPicture).attr('data-auto','false');
		$('input[name=name]').val(itemNiceName);
		$('input[name=url]').val(itemURL);
		$('input[name=update]').val(itemId);
		$('input[type=submit]').val('Update');;
		$('h1').html('Update');
		$('.img-options').addClass('active');

		return false;
	});

	// INIT WELCOME (open)
	isOpenWelcome = welcomeToggle(!isOpenWelcome); /* enlever ! pour rétablir */

	// CLOSE WELCOME
	$('#welcome-container .close-button').on('click',function(){
		isOpenWelcome = welcomeToggle(isOpenWelcome);
		return false;
	});
	

	// WELCOME SLIDER
	$('.change-slide').on('click',function(){
		var slideId = $(this).attr('data-slideId');
		changeSlide(slideId);
		return false;
	});

	// BROKEN IMAGE FALLBACK
	$('.sites-list li a img').on('error',function(){
		$(this).attr('src','img/default.png');
	});

	// OPEN/CLOSE IMG MENU
	var flagImg = 0;
	$('#more-img').on('click',function(){
		if(flagImg%2==0){
			var search = $('input[name=name]').val();
			displayMoreImg(search);
			$('.menu-img').addClass('active');
			$(this).addClass('pushed');
		}
		else{
			$('.menu-img').removeClass('active');
			$(this).removeClass('pushed');
		}
		flagImg++;
		return false;
	});

	// OPEN/CLOSE URL MENU
	$('#url-img').on('click',function(){
		if(flagUrl%2==0){
			$('.menu-url').addClass('active');
			$('.menu-url input').focus();
			$(this).addClass('pushed');
		}
		else{
			$('.menu-url').removeClass('active');
			$(this).removeClass('pushed');
		}
		flagUrl++;
		return false;
	});

	// PUT SELECTED IMG IN PLACEHOLDER
	$('body').on('click','.menu-img img',function(){
		var newImage = $(this).attr('src');
		flagImg++;
		$('.menu-img').removeClass('active');
		$('.pic-holder').attr('src',newImage).attr('data-auto','false');
	});

	// BUDDASH MENU
	var budFlag = 0;
	$('aside').on('click',function(){
		if(budFlag%2==0){
			$('aside').addClass('active');
			$('#list-wrap').addClass('offset');
			$('aside .menu').removeClass('fadeOutLeft');
			$('aside .menu').addClass('active animated fadeInLeft');
		}
		else{
			$('aside').removeClass('active');
			$('#list-wrap').removeClass('offset');
			$('aside .menu').removeClass('fadeInLeft');
			$('aside .menu').addClass('fadeOutLeft');
			setTimeout(function(){
				$('aside .menu').removeClass('active');
			},500);
		}
		budFlag++;
		return false;
	});
	var settingFlag = 0;
	$('aside .menu li>a').on('click',function(){
		if(settingFlag%2==0){
			$(this).removeClass('inactive').addClass('active');
			$(this).next('.setting-detail').addClass('active');
			$('aside .menu li>a:not(.active)').addClass('inactive');
		}
		else{
			$(this).addClass('inactive').removeClass('active');
			$(this).next('.setting-detail').removeClass('active');
			$('aside .menu li>a:not(.active)').removeClass('inactive');
		}
		settingFlag++;
		return false;
	});

});