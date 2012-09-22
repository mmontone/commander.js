window.onload = function (){
                 function getScriptSync(filename) {
                         // get some kind of XMLHttpRequest
                         var xhrObj = new XMLHttpRequest();;
                         // open and send a synchronous request
                         xhrObj.open('GET', filename, false);
                         xhrObj.send('');
                         // add the returned content to a newly created script tag
                         var se = document.createElement('script');
                         se.type = "text/javascript";
                         se.text = xhrObj.responseText;
                         se.onload = function() {alert (filename  + " loaded");};
                         document.getElementsByTagName('head')[0].appendChild(se);
                 }

                 function getStyleSheet(filename) {
                         $('head').append('<link href="' + filename + '" type="text/css" rel="stylesheet" media="screen"/>');
                 }
                 
                 function setup(options) {
                         getScriptSync("jquery-ui-1.8.23.custom/js/jquery-1.8.0.min.js");

                         getStyleSheet("commander.js.css");
                         getStyleSheet("css/ui-lightness/jquery-ui-1.8.23.custom.css");
                         getStyleSheet("mainmenu.css");
                         
                         getScriptSync("jquery-ui-1.8.23.custom/js/jquery-ui-1.8.23.custom.min.js");
                         getScriptSync("jquery.hotkeys/jquery.hotkeys.js");
                         getScriptSync("commander.js");
                    
                         $('body').append('<div id="commander-menu" class="menu"></div>');
                         $('body').append('<div id="footer" class="footer"> \
                                          <div id="command-line"> \
                                          <input id="command-line-input"></input> \
                                          <input id="command-line-accept" type="button" value="Run" onclick="javascript:Commander.executeCommand($(\'#command-line-input\').val());$(\'#command-line\').hide(\'slide\', { direction: \'down\' }, 500);"></input> \
                                          <input id="command-line-cancel" type="button" value="Cancel" onclick="javascript:$(\'#command-line-input\').val(\'\');$(\'#command-line\').hide(\'slide\', { direction: \'down\' }, 500);"></input> \
                                          </div> \
                                          </div>');
                         $('body').append('<div id="commander-help" class="footer"></div>');
                         $('body').append('<div id="commander-debug" class="footer"></div>');
                         $('body').append('<div id="commander-status" class="footer"></div>');
                 }

        setup();
};