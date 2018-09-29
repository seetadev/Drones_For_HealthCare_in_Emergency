//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
'use strict';
var mqtt = require('./mqtt-wrapper.js')();
var bebop = require('node-bebop'); 
var drone = bebop.createClient(); 
var request = require('request');
var stream = require('stream');
var MjpegConsumer = require("mjpeg-consumer");
var consumer = new MjpegConsumer();

var latestMjpeg;
class EchoStream extends stream.Writable {
   _write(chunk, enc, next) {
     latestMjpeg = chunk;
     next();
   }
};

console.log('Trying to connect to the Bebop...');
drone.connect(function() {
  console.log('Connected to the Bebop!');
	
  drone.getMjpegStream().pipe(consumer).pipe(new EchoStream());

  mqtt.connect(function(client, deviceId) {
  	client.on('connect', function() {
	  console.log('MQTT client connected to IBM IoT Cloud.');
	  drone.on('battery', function(battery) {
	  	console.log("Battery percentage: " + battery + "%");
	  	client.publish('iot-2/evt/battery/fmt/json', JSON.stringify({
          "d" : {
            "batteryPercentage" : battery
          }
        }), function () {
	        console.log("Battery percentage published.")
	    });
	  });
	  client.subscribe('iot-2/cmd/fly/fmt/json', {qos : 0}, function(err, granted) {
	    if (err) throw err;
	      console.log("subscribed");
	    });
	  });
	  client.on('error', function(err) {
	    console.error('client error ' + err);
	    process.exit(1);
	  });
	  client.on('close', function() {
	    console.log('client closed');
	    process.exit(1);
	  });

	  client.on('message', function(topic, message, packet) {
	   console.log(topic);
	   var msg = JSON.parse(message.toString());
	   if(msg.d.action === '#takeoff') {
	     console.log('take off');
		 drone.takeOff();
	   } else if(msg.d.action === '#land') {
	     console.log('land');
		 drone.land();
           } else if(msg.d.action === '#up') {
             console.log('up');
             drone.stop();
             drone.up(0.2);
             setTimeout(function() {
             drone.stop();
             }, 2000);
           } else if(msg.d.action === '#down') {
             console.log('down');
             drone.stop();
             drone.down(0.2);
             setTimeout(function() {
             drone.stop();
             }, 1000);
           } else if(msg.d.action === '#rotatec') {
             console.log('rotatec');
             drone.stop();
             drone.clockwise(0.3);
             setTimeout(function() {
             drone.stop();
             }, 1000);
           } else if(msg.d.action === '#rotatecc') {
             console.log('rotatecc');
             drone.stop();
             drone.counterClockwise(0.3);
             setTimeout(function() {
             drone.stop();
             }, 1000);
           } else if(msg.d.action === '#takeoffandland') {
             console.log('take off and land');
             var length = msg.d.length ? msg.d.length : 5000;
             //drone.disableEmergency();
             drone.takeOff();
             setTimeout(function() {
                drone.stop();
                drone.land();
              }, length);

	   //} else if(msg.d.action === '#takeoffandland') {
	     //console.log('take off and land');
	     //var length = msg.d.length ? msg.d.length : 4000;
	//	 drone.takeOff();
	  //   setTimeout(function() {
	//	   drone.land();
	  //   }, length);
	   } else if(msg.d.action === '#takepicture') {
	    if(!latestMjpeg) {
	      console.log('No images yet');
	      var options = {
	        uri: msg.d.callback,
	        method: 'POST',
	        json: {
	          "error" : "No image"
	        }
	      };
	      request(options, function (error, response, body) {});
	    } else {
	      var fs = require('fs');
	      console.log(latestMjpeg.length);
	      fs.writeFile('pic.jpeg', latestMjpeg, function(){console.log('written')});
	      var formData = {
	        my_file: {
	          value: latestMjpeg,
	          options: {
	            filename: 'picture.jpeg',
	            contentType: 'image/jpeg'
	          }
	        }
	      };
	      request.post({uri: msg.d.callback, formData: formData}, function(err, httpResponse, body) {
	        if(err) {
	          console.log("error posting picture " + err);
	        } else {
	          console.log('Picture uploaded');
	        }
	      });
	    }
	  }
    });
  });
});
