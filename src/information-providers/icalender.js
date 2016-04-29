// Dominic Steinhauser
import {ObjectID} from 'mongodb';
import {createComponent} from './../core/component';
import {Information} from './../core/information';
var request = require("request");

//regular Expressions for "Begin:Vevent", "Location:", "Summary", "DtStart:" and "DTEnde:"
var beginV = /begin:vevent$/gmi;
var regLoc =/location:(.*)\n/i;
var regDesc = /summary:(.*)\n/i;
var regStartTime = /dtstart:([0-9]{4})([0-9]{2})([0-9]{2}).([0-9]{2})([0-9]{2})/i;
var regEndTime = /dtend:([0-9]{4})([0-9]{2})([0-9]{2}).([0-9]{2})([0-9]{2})/i;

//set the options to get a response
var options = {
	uri: "http://vorlesungsplan.dhbw-mannheim.de/ical.php?uid=6349001",
  	method: "GET",
  	timeout: 10000,

}

function getAllEntries(infoManager){
	return new Promise((accept, reject) => {
		
		request(options, function(err, response, body) {
  		if(err){
  			return console.log(err);
			reject(err);
  		}
		
			let entries = getIcalEntry(body);
			infoManager.remove({}).then(()=>{
					return infoManager.insert(entries);
			
			}).then(() => {accept();
			});
			
			
  		});
		
	});
	
	
	
}

function getIcalEntry(value){
	// sepearte all entries by "Begin:Vevent"
	var ical = value.split(beginV);
	
	var result = [];
	
	//start ical at ical[1] to skip the definiton part of the ical; get all infortion to on entry without defitions at the beginning of each line
	for (var i = 1; i< ical.length; i++){
		var comp = createComponent('components-description');
		var notification = null;
		var info = new Information;
		
		var description = getDescription(ical[i]);
		if(description != null){
			info.title = description[1];
		}
		
		
		var location = getRoom(ical[i]);
		if(location != null){
			comp.text += 'Ort: '+location[1]+'\n';
		}
		
		var start = getStart(ical[i]);
		if(start != null){
			var year = start[1];
			var month = start[2];
			var day = start[3];
			var hours = start[4];
			var min = start[5];
			comp.text += 'Beginn: '+day+'.'+month+'.'+year+' '+hours+':'+min+'Uhr\n';
			
			//Get a Timestamp to sort the entries by date
			var notification = createComponent('components-notification');
			var date = new Date(year, month, day, hours, min);
			var timestamp = date.getTime();
			notification.date = timestamp;
		}
		
		
		
		
		var end = getEnd(ical[i]);
		if( end != null){
		var year = end[1];
		var month = end[2];
		var day = end[3];
		var hours = end[4];
		var min = end[5];
		comp.text += 'Ende: '+day+'.'+month+'.'+year+' '+hours+':'+min+'Uhr\n';
		}
		
		if(notification == null){
			info.components = [comp];
		}
		else{
			info.components = [comp,notification];
			
		}
		result = result.concat([info]);
		
	}
	
	return result;
}


function getRoom(eintrag){
	var room = regLoc.exec(eintrag);
	return room;
}

function getDescription(entry){
	var desc = regDesc.exec(entry);
	return desc;
}

function getStart(entry){
	var startTime = regStartTime.exec(entry);
	return startTime;
}

function getEnd(entry){
	var endTime = regEndTime.exec(entry);
	return endTime;
}






var sync = function(infoManager){

    return getAllEntries(infoManager);
	
}

module.exports = {
	"pluginName": "info-provider-ical",
    "pluginObject": {
        "sync": sync
    }
};


