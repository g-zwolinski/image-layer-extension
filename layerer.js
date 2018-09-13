function click(e) {
  chrome.tabs.executeScript(null,
      {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
  window.close();
}

document.addEventListener('DOMContentLoaded', function () {
	function changeBg(event){
		updateStyle(event.target.dataset.id, 'backgroundImage', 'url(\''+event.target.value+'\')');
	}
	function changeBgSize(event){
		var size = event.target.checked ? 'cover' : 'auto';
		updateStyle(event.target.dataset.id, 'backgroundSize', size);
	}
	function changeStyle(event){
		updateStyle(event.target.dataset.id, event.target.name, event.target.value);
	}

	function updateStyle(id, prop, value){
		chrome.tabs.executeScript({ code: 'document.getElementById("'+id+'").style.'+prop+'="'+value+'";' });
	}

	function remove(event){
		removeCotnrols(false, 'c-'+event.target.dataset.id);
		chrome.tabs.executeScript({ code: 
			'var element = document.getElementById("'+event.target.dataset.id+'");'+
		    'element.parentNode.removeChild(element);'
		});
	}

	function save(){
		inputs = document.getElementsByTagName('input');
		var amount = 0;
		var inputsArr = [];
		var tmpObject = {};
		for(var i = 0; i < inputs.length;i++){
			if(0 == i%7 && i > 0){
				inputsArr.push(tmpObject);
				tmpObject = {};
				amount++;
			}
			tmpObject[inputs[i].name] = inputs[i].value;
			if(inputs[i].name == 'backgroundSize') tmpObject[inputs[i].name] = inputs[i].checked;
		}
		inputsArr.push(tmpObject);
		document.cookie = "inputsArr="+JSON.stringify(inputsArr);
	}
	var id = 0;
	function addLayer(props){
		if(props == undefined) return;
		var isCheckedBgSize = props['backgroundSize'] == 'true' || props['backgroundSize'] == true ? 'checked' : '';
		var overlay = $('<div id="layerer-'+id+'" class="overlay">');
		var code = [
		    'var d = document.createElement("div");',
		    'd.setAttribute("style", "'
		    + 'transition: all 0.3s;'
		    + 'background: url('+props['background']+');'
		    + 'background-size: '+ (isCheckedBgSize ? 'cover' : 'auto') +';'
		    + 'background-repeat: no-repeat;'
	  		+ 'opacity: '+props['opacity']+';'
	  		+ 'width: '+props['width']+';'
	  		+ 'height: '+props['height']+';'
	  		+ 'position: fixed;'
	  		+ 'top: '+props['top']+';'
	  		+ 'left: '+props['left']+';'
	  		+ 'z-index: 16777271;'
	  		+ 'pointer-events: none;'
	  		+ 'user-select: none");',
	  		'd.id = "layerer-'+id+'";',
	  		'd.className += "layerer";',
		    'document.body.appendChild(d);'
		].join("\n");
		chrome.tabs.executeScript({ code: code });
		var inputs = $(''+
		  '<div class="controls" id="c-layerer-'+id+'" data-id="'+id+'">'+
		    '<input class="input-bg-layerer-'+id+'" type="text" value="'+props['background']+'" name="background" data-id="layerer-'+id+'" placeholder="background"/>'+
		    '<input class="input-layerer-'+id+'" type="number" step="0.05" value ="'+props['opacity']+'" name="opacity" data-id="layerer-'+id+'" placeholder="opacity"/>'+
		    '<input class="input-layerer-'+id+'" type="text" value="'+props['left']+'" name="left" data-id="layerer-'+id+'" placeholder="left"/>'+
		    '<input class="input-layerer-'+id+'" type="text" value="'+props['top']+'" name="top" data-id="layerer-'+id+'" placeholder="top"/>'+
		    '<input class="input-layerer-'+id+'" type="text" value="'+props['width']+'" name="width" data-id="layerer-'+id+'" placeholder="width"/>'+
		    '<input class="input-layerer-'+id+'" type="text" value="'+props['height']+'" name="height" data-id="layerer-'+id+'" placeholder="height"/>'+
		    '<input class="input-bg-size-layerer-'+id+'" type="checkbox" value="'+props['backgroundSize']+'" name="backgroundSize" data-id="layerer-'+id+'" '+isCheckedBgSize+'/>'+
		    '<button id="rm-layerer-'+id+'" .onclick="remove(event)" data-id="layerer-'+id+'">-'+
		    '</button>'+
		  '</div>'
		  );
	  	$('#controls-contener').append(inputs);
		$('.input-layerer-'+id).bind("change", changeStyle);
		$('.input-bg-layerer-'+id).bind("change", changeBg);
		$('.input-bg-size-layerer-'+id).bind("click", changeBgSize);
		$('#rm-layerer-'+id).bind("click", remove);
		id++;
	}

	function clear(){
		chrome.tabs.executeScript({ code: 
			'var elements = document.getElementsByClassName("layerer");'+
		    'while(elements.length > 0){'+
		        'elements[0].parentNode.removeChild(elements[0]);'+
		    '}' 
		});
		removeCotnrols(true);
	}

	function removeCotnrols(all, controlsId){

		if(all){
			var elements = document.getElementsByClassName("controls");
		    while(elements.length > 0){
		        elements[0].parentNode.removeChild(elements[0]);
		    } 
		}else if(controlsId != undefined){
			var element = document.getElementById(controlsId);
			element.parentNode.removeChild(element);
		}
	}

	function load(){
		clear();
		if(document.cookie.match(new RegExp('inputsArr=([^;]+)'))!= null){
	        var inputsArr = JSON.parse(document.cookie.match(new RegExp('inputsArr=([^;]+)'))[1]);
	        for(var i = 0; i < inputsArr.length;i++){
	        	addLayer(inputsArr[i]);
	        }
	    }
	}
	$("#save").click(save);
	$("#load").click(load);
	$('#clear').click(clear);
	$("#add").click(function() {
		addLayer({
			background: "http://i.imgur.com/LzLo5ms.png",
			backgroundSize: "true",
			height: "100%",
			left: "0",
			opacity: "0.5",
			top: "0",
			width: "100%",
		});
	});
	load();
});