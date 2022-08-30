
window.onload = function () {
	
	var textbox = document.querySelector('.contents');
    var box = document.querySelector('#textbox');
    box.innerHTML='HRM';
    
	
	
   tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo", onsuccessPermission, onErrorPermission);
    tizen.ppm.requestPermission("http://tizen.org/privilege/system", onsuccessPermission, onErrorPermission);
    tizen.ppm.requestPermission("http://tizen.org/privilege/power", onsuccessPermission, onErrorPermission);
    
    let duid="";
    

    String.prototype.hashCode = function() {
      var hash = 0, i, chr;
      if (this.length === 0) return hash;
      for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    };
    
   // function onsuccessPermissionSystem(){
  //  	duid = tizen.systeminfo.getCapabilities().duid;
 //   };
    function onErrorPermission(){
        console.log('No permission to access health info');
    };

    function onsuccessPermission(){
        console.log('HRM permission succeeded');

        // add eventListener for hardware key tizenhwkey
      //  document.addEventListener('tizenhwkey', function(e) {
      //      if(e.keyName === "back") {
      //          tizen.application.getCurrentApplication().exit();
      //      }
      //  });
        
        duid =  Math.abs(tizen.systeminfo.getCapabilities().duid.hashCode());
     
        box.innerHTML =duid;
        //console.log('text box selected');
        
        function onsuccessPEDOMETER(pedometerInfo)
        {
        	//box.innerHTML = pedometerInfo.stepStatus;
        	let timestamp = + new Date();	
        
          let pedometer = {stepStatus:pedometerInfo.stepStatus, cumulativeTotalStepCount: pedometerInfo.cumulativeTotalStepCount};
      		
          socket.send(JSON.stringify({duid, pedometer, timestamp}));
        }
        
        function onsuccessHRM(hrmInfo) {
        	
        	
        	
            //box.innerHTML = 'HR: ' + hrmInfo.heartRate;
        
        	let timestamp = + new Date();
        	let heart = {rate:hrmInfo.heartRate, interval: hrmInfo.rRInterval};
        	
            socket.send(JSON.stringify({duid, heart, timestamp}));
            // holding 15 seconds as HRM sensor needs some time 
        }

        function onerrorHRM(error) {
        	 console.log('Error occurred: ' + error.message);
            tizen.humanactivitymonitor.stop('HRM');
           
        }

        function onerrorPEDOMETER(error) {
        	 console.log('Error occurred: ' + error.message);
            tizen.humanactivitymonitor.stop('PEDOMETER');
           
        }

        function onchangedCB(hrmInfo) {
            tizen.humanactivitymonitor.getHumanActivityData('HRM', onsuccessHRM, onerrorHRM);
            tizen.humanactivitymonitor.getHumanActivityData("PEDOMETER", onsuccessPEDOMETER, onerrorPEDOMETER);
        }
        
     
        
      
        const socket = new ReconnectingWebSocket('wss://hrm-widget.herokuapp.com');
      
        
        socket.addEventListener('open', function (event) {

        	socket.send(JSON.stringify({name:"watch", duid}));
            

          });
       
        tizen.humanactivitymonitor.start("PEDOMETER", onchangedCB);
        tizen.humanactivitymonitor.start('HRM', onchangedCB);
            
        tizen.power.request("CPU", "CPU_AWAKE");
    	tizen.power.request("SCREEN", "SCREEN_DIM");
       setInterval(() =>  tizen.power.turnScreenOn(), 2000);
    }
};

