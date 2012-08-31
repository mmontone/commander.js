var CommandTables = [];
var ActiveCommandTables = [];

function registerCommandTable(commandTable) {
        if(CommandTables[commandTable.name]) {
                console.log('Warning: Redifining ' + commandTable.title + ' command table');
        }
        CommandTables[commandTable.name] = commandTable;
        if(commandTable.enabled) {
                commandTable.enable();
        }                
}

function findCommandTable(name) {
        if(CommandTables[name]) {
                return CommandTables[name];
        }
        else {
                throw "Command table " + name + " is not defined";
        }
}

function CommandTable (args) {
        this.name = args.name;
        this.title = args.title;
        this.description = args.description;
        this.parents = args.parents.map(findCommandTable);
        this.commands = args.commands.map(function (command) {
                                                  return new Command(command);
                                          });
        this.enabled = args.enabled == false ? false : true;

        registerCommandTable(this);
}

CommandTable.prototype.findCommand = function (commandLineName) {
        console.log(commandLineName);
        for each(var command in this.commands) {
                console.log(command);
                if(command.commandLineName == commandLineName) {
                        return command;
                }
        }
     
        return null;
};

CommandTable.prototype.findCommandNamed = function (name) {
        console.log(name);
        for each(var command in this.commands) {
                console.log(command);
                if(command.name == name) {
                        return command;
                }
        }
     
        return null;
};

CommandTable.prototype.enable = function () {
        ActiveCommandTables[this.name] = this;

        // Register key bindings
        this.commands.forEach(function (command) {
                                      if(command.keystroke) {
                                              $(document).bind('keydown', command.keystroke, 
                                                               function(event) {
                                                                       command.execute();
                                                                       event.preventDefault();
                                                               });
                                              $("#command-line-input").bind('keydown', command.keystroke, 
                                                                            function(event) {
                                                                                    command.execute();
                                                                                    event.preventDefault();
                                                                            });
                                      }
                              });
};

CommandTable.prototype.disable = function () {
        ActiveCommandTables[this.name] = null;
};

function Command(args) {
        this.name = args.name;
        this.title = args.title;
        this.commandLineName = args.commandLineName;
        this.description = args.description;
        this.keystroke = args.keystroke;
        this.execute = args.execute;
        this.menu = args.menu;
}

function findCommandFromCommandLineName(commandLine) {
        for each(var commandTable in ActiveCommandTables) {
                var command = commandTable.findCommand(commandLine);
                if (command) {
                        return command;
                }
        }
        return null;
}

function findCommandNamed(name) {
        for each(var commandTable in ActiveCommandTables) {
                var command = commandTable.findCommandNamed(name);
                if (command) {
                        return command;
                }
        }
        return null;
}


function executeCommand(commandName) {
        var command = findCommandFromCommandLineName(commandName);
        if (command) {
                command.execute();
        }
}

function generateCommandsHelp() {
        var help = "";
        for each(var commandTable in ActiveCommandTables) {
                help += "<h1>" + commandTable.title + "</h1>";
                var commands = commandTable.commands;
                if(commands) {
                        help += "<ul>";
                        for each(var command in commands) {
                                help += "<li>" + command.commandLineName + " - " + command.description;
                                if(command.keystroke) {
                                        help += " (" + command.keystroke + ")";
                                }

                                help += "</li>";
                        }
                        help += "</ul>";
                }
        }
        return help;
}

function generateCommandsMenu() {
        var menu = "<ul id=\"commands-menu-list\">";
        for each(var commandTable in ActiveCommandTables) {
                menu += "<li><a href=\"#\">" + commandTable.title + "</a>";
                var commands = commandTable.commands;
                if(commands) {
                        menu += "<ul>";
                        for each(var command in commands) {
                                if (command.menu) {
                                        menu += "<li><a id=\"" + command.name + 
                                                "\" href=\"#\" onclick=\"javascript:findCommandNamed('" + 
                                                command.name + "').execute();\">" + command.title;
                                        if(command.keystroke) {
                                                menu += " (" + command.keystroke + ")";
                                        }
                                        menu +=  "</a></li>";
                                }
                        }
                        menu += "</ul>";
                }
                menu += "</li>";
        }
        menu += "</ul>";
        return menu;
}

// The global command table

new CommandTable({name: "global-command-table",
                  title: "Global commands",
                  parents: [],
                  description: "The global command table",
                  commands: [{name:"doc-command",
                              commandLineName: 'doc',
                              title: 'Documentation',
                              description: "Read documentation",
                              menu: true,
                              keystroke: 'ctrl+d',
                              execute: function() {
                                      window.open("doc.html", "_blank");
                              }},
                             {name:"about-command",
                              commandLineName: 'about',
                              description: "About the system",
                              title: 'About',
                              menu: true,
                              execute: function () {
                                      alert("This is a Commander.js powered application");
                              }},
                             {name:"debug-command",
                              commandLineName: 'debug',
                              description: "Display Command.js debugging panel",
                              title: 'Debug',
                              menu: false,
                              execute: function () {
                                      $("#commander-debug").show();
                              }},
                             {name:"quit-command",
                              commandLineName: 'quit',
                              description: "Quit",
                              title: 'Quit',
                              keystroke: 'ctrl+q',
                              menu: true,
                              execute: function () {
                                      window.close();
                              }}                             
                            ]});

new CommandTable({name: "help-command-table",
                  title: "Help commands",
                  description: "Help commands",
                  parents:[],
                  commands:[{name:"help-command",
                             title: 'Help',
                             commandLineName:"help",
                             description:"Obtain help",
                             menu: true,
                             keystroke:'ctrl+h',
                             execute: function() {
                                     $('#commander-help').html(generateCommandsHelp());
                                     $("#commander-help").show("slide", {direction:"down"}, 500);
                             }},
                            {name:"help-quit-command",
                             title: 'Quit help',
                             commandLineName:"help-quit",
                             description:"Quit help",
                             menu: true,
                             execute: function() {
                                     $("#commander-help").hide("slide", {direction:"down"}, 500);
                             }},
                            {name:'apropos-command',
                             title:"Apropos command",
                             commandLineName:'apropos-command',
                             description: "Apropos command",
                             menu:true,
                             keystroke:'ctrl+a',
                             execute: function () {
                                     var term = prompt('Apropos command: ');
                                     alert('Nothing found');
                             }}]});

new CommandTable({name: "menu-command-table",
                  title:"Menu commands",
                  parents: [],
                  commands:[{name:"menu-command",
                             commandLineName: 'menu',
                             description: "Display system menu",
                             title: 'Menu',
                             menu: true,
                             keystroke:'ctrl+m',
                             execute: function () {
                                     $('#commander-menu').html(generateCommandsMenu());
                                     $("#commander-menu").show("slide", {direction:"up"}, 500);
                                     // $('#commander-menu > ul').menuBar({
                                     //                                   menuExpand:true,
                                     //                                   menuIcon: true});
                             }},
                            {name:"menu-quit-command",
                             commandLineName: 'menu-quit',
                             description: "Quit system menu",
                             title: 'Quit menu',
                             menu: true,
                             execute: function () {
                                     $("#commander-menu").hide("slide", {direction:"up"}, 500);
                             }}
                           ]});

// new CommandTable({name: "command-line-command-table",
//                   title: "Command Line commands",
//                   parents: [],
//                   description: "Command Line commands table",
//                   commands: [{name:"command-line-focus-command",
//                               title: 'Command Line focus',
//                               commandLineName:"command-line-focus",
//                               description:"Command Line focus",
//                               menu: true,
//                               keystroke:'alt+x',
//                               execute: function(e) {
//                                       $("#command-line").show("slide", { direction: "down" }, 500);
//                                       $('#command-line-input').focus();
//                                       e.preventDefault();
//                               }},
//                              {name:"command-line-cancel-command",
//                               title: 'Command Line camcel',
//                               commandLineName:"command-line-cancel",
//                               description:"Command Line cancel",
//                               menu: true,
//                               keystroke: 27,
//                               execute: function(e) {
//                                       $('#command-line-input').val('');
//                                       $("#command-line").hide("slide", { direction: "down" }, 500);
//                                       e.preventDefault();
//                               }}]});   

$(function()  {
          var textBox = $('#command-line-input');
          var code =null;
          textBox.keypress(function(e)
                           {
                                   code = (e.keyCode ? e.keyCode : e.which);
                                   switch (code) {
                                   case 13: executeCommand(textBox.val());
                                           textBox.val('');
                                           $("#command-line").hide("slide", { direction: "down" }, 500);
                                           break;
                                   }

                           });
          textBox.keyup(function(e){
                                if (e.keyCode == 27) {
                                        textBox.val(""); 
                                        $("#command-line").hide("slide", { direction: "down" }, 500);
                                } 
                        });
          textBox.bind('keydown', 'ctrl+g', function (e) {
                               $("#command-line").hide("slide", { direction: "down" }, 500);
                               e.preventDefault();
                       });
          textBox.focus(function() {
                                textBox.val('');
                        });
          $(document).bind('keydown', 'alt+x', function () {
                                   $("#command-line").show("slide", { direction: "down" }, 500);
                                   textBox.focus();
                           });

  });
