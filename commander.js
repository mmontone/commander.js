var Commander =
    (function() {

        var CommandTables = new Map();
        var ActiveCommandTables = new Map();

        function commandCompletionList() {

        }

        function registerCommandTable(commandTable) {
            console.log('Registering command table', commandTable);
            if(CommandTables.get(commandTable.name)) {
                console.log('Warning: Redifining ' + commandTable.title + ' command table');
            }
            CommandTables.set(commandTable.name, commandTable);
            if(commandTable.enabled) {
                commandTable.enable();
            }
        }

        function findCommandTable(name) {
            if(CommandTables.has(name)) {
                return CommandTables.get(name);
            }
            else {
                throw "Command table " + name + " is not defined";
            }
        }

        function CommandTable (args) {
            this.name = args.name;
            this.shortName = args.shortName;
            this.title = args.title;
            this.description = args.description;
            this.parents = args.parents.map(findCommandTable);
            this.commands = args.commands.map(function (command) {
                return new Command(command);
            });
            // CommandTables are enabled by default
            this.enabled = args.enabled == false ? false : true;

            registerCommandTable(this);
        }

        CommandTable.prototype.addCommand = function (cmd) {
            this.commands.push(cmd);
        };

        CommandTable.prototype.clear = function () {
            this.commands = [];
        };

        CommandTable.prototype.findCommand = function (commandLineName) {
            console.log(commandLineName);
            for (var command of this.commands) {
                console.log(command);
                if(command.commandLineName == commandLineName) {
                    return command;
                }
            }

            return null;
        };

        CommandTable.prototype.findCommandNamed = function (name) {
            console.log(name);
            for (var command of this.commands) {
                console.log(command);
                if(command.name == name) {
                    return command;
                }
            }

            return null;
        };

        CommandTable.prototype.findCommandTitled = function (title) {
            for (var command of this.commands) {
                if(command.title == title) {
                    return command;
                }
            }

            return null;
        };

        CommandTable.prototype.findCommandForSpeech = function (term) {
            for (var command of this.commands) {
                if(command.name.toUpperCase() == term.toUpperCase() ||
                   command.title.toUpperCase() == term.toUpperCase() ||
                   compareTwoStrings(command.title.toUpperCase(), term.toUpperCase()) >= 0.8) {
                    return command;
                }
            }

            return null;
        };

        CommandTable.prototype.enable = function () {
            ActiveCommandTables.set(this.name, this);

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
            ActiveCommandTables.delete(this.name);
        };

        function Command(args) {
            this.name = args.name;
            this.title = args.title;
            this.category = args.category;
            this.commandLineName = args.commandLineName;
            this.description = args.description;
            this.keystroke = args.keystroke;
            this.execute = args.execute;
            this.menu = args.menu;
        }

        function findCommandFromCommandLineName(commandLine) {
            for (var commandTable of ActiveCommandTables.values()) {
                var command = commandTable.findCommand(commandLine);
                if (command) {
                    return command;
                }
            }
            return null;
        }

        function activeCommands () {
            var activeCommands = [];
            for (var commandTable of ActiveCommandTables.values()) {
                activeCommands = activeCommands.concat(commandTable.commands);
            }

            return activeCommands;                
        }

        function findCommandNamed(name) {
            for (var commandTable of ActiveCommandTables.values()) {
                var command = commandTable.findCommandNamed(name);
                if (command) {
                    return command;
                }
            }
            return null;
        }

        function findCommandTitled(title) {
            for (var commandTable of ActiveCommandTables.values()) {
                var command = commandTable.findCommandTitled(title);
                if (command) {
                    return command;
                }
            }
            return null;
        }

        function findCommandForSpeech(term) {
            for (var commandTable of ActiveCommandTables.values()) {
                var command = commandTable.findCommandForSpeech(term);
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
            for (var commandTable of ActiveCommandTables.values()) {
                help += "<h1>" + commandTable.title + "</h1>";
                var commands = commandTable.commands;
                if(commands) {
                    help += "<ul>";
                    for (var command of commands) {
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
            for (var commandTable of ActiveCommandTables.values()) {
                menu += "<li><a href=\"#\">" + commandTable.title + "</a>";
                var commands = commandTable.commands;
                if(commands) {
                    menu += "<ul>";
                    for (var command of commands) {
                        if (command.menu) {
                            menu += "<li><a id=\"" + command.name +
                                "\" href=\"#\" onclick=\"javascript:Commander.findCommandNamed('" +
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

        function generateStatus() {
            var status = "(";
            for (var commandTable of ActiveCommandTables.values()) {
                status += commandTable.shortName;
                status += ",";
            }

            status += ")";
            return status;
        }

        function commandsCompletionData() {
            var commandsCompletion = [];
            for (var commandTable of ActiveCommandTables.values()) {
                var commands = commandTable.commands;
                for (var command of commands) {
                    commandsCompletion.push({label: command.commandLineName,
                                             description: command.description,
                                             keystroke: command.keystroke,
                                             table: commandTable,
                                             category: commandTable.title});
                }
            }
            return commandsCompletion;
        }

        function extractCommandsFromCurrentPage (clearPageCommandTable=true, extractLinks=true) {

            console.log('Extracting commands from current page');
            var pageCommandTable = CommandTables.get('page-command-table');
            
            if (clearPageCommandTable) {
                pageCommandTable.clear();
            }

            $('command').each((i, el) => {
                console.log(el);
                var $el = $(el);
                var cmd = new Command({
                    name: $el.attr('name'),
                    commandLineName: $el.attr('command-line') || $el.attr('name'),
                    title: $el.attr('title'),
                    description: $el.attr('description') || $el.attr('title'),
                    menu: $el.attr('menu'),
                    keystroke: $el.attr('keystroke'),
                    execute: window[$el.attr('execute')]
                });

                console.log('Command extracted: ', cmd);

                pageCommandTable.addCommand(cmd);
            });

            if (extractLinks) {
                $('a').each((i, el) => {
                    var $el = $(el);
                    if ($el.data('command') !== undefined) {
                        var cmd = new Command({
                            name: $el.data('command'),
                            commandLineName: $el.data('command-line') || $el.data('command'),
                            title: $el.attr('title'),
                            description: $el.data('description') || $el.attr('title') || ('Navigate to ' + $el.attr('href')),
                            keystroke: $el.data('keystroke'),
                            execute: $el.attr('onclick') || function () {
                                window.location = $el.attr('href');
                            }                            
                        });

                        console.log('Command extracted: ', cmd);

                        pageCommandTable.addCommand(cmd);
                    }
                });
            }            
        }

        // The system command table

        new CommandTable({name: "system-command-table",
                          shortName: "SYS",
                          title: "System",
                          parents: [],
                          description: "The system command table",
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
                          shortName:"HLP",
                          title: "Help",
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
                          shortName: "MNU",
                          title:"Menu",
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

        new CommandTable({name: "status-command-table",
                          shortName: "ST",
                          title:"Status",
                          parents: [],
                          commands:[{name:"status-command",
                                     commandLineName: 'status',
                                     description: "Display system status",
                                     title: 'Status',
                                     menu: true,
                                     keystroke:'alt+s',
                                     execute: function () {
                                         $('#commander-status').html(generateStatus());
                                         $("#commander-status").show("slide", {direction:"up"}, 500);
                                     }},
                                    {name:"status-quit-command",
                                     commandLineName: 'status-quit',
                                     description: "Quit system status",
                                     title: 'Quit status',
                                     menu: true,
                                     execute: function () {
                                         $("#commander-status").hide("slide", {direction:"up"}, 500);
                                     }}
                                   ]});

        // Extracted commands from page are added to the page command table
        new CommandTable({name: 'page-command-table',
                          shortName: 'PG',
                          title: 'Page',
                          parents: [],
                          commands: []});

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

        return {
            CommandTable : CommandTable,
            Command : Command,
            findCommandNamed: findCommandNamed,
            findCommandTitled: findCommandTitled,
            findCommandForSpeech: findCommandForSpeech,
            executeCommand: executeCommand,
            commandsCompletionData: commandsCompletionData,
            commandTables : CommandTables,
            activeCommandTables : ActiveCommandTables,
            activeCommands : activeCommands,
            extractCommandsFromCurrentPage : extractCommandsFromCurrentPage
        };

    }());

$(function()  {
    var textBox = $('#command-line-input');
    var code =null;
    textBox.keypress(function(e)
                     {
                         code = (e.keyCode ? e.keyCode : e.which);
                         switch (code) {
                         case 13: Commander.executeCommand(textBox.val());
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

    // Command completion
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function( ul, items ) {
            var self = this,
                currentCategory = "";
            $.each( items, function( index, item ) {
                if ( item.category != currentCategory ) {
                    ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                    currentCategory = item.category;
                }
                self._renderItem( ul, item );
            });
        }
    });

    var data = Commander.commandsCompletionData();

    $( "#command-line-input" ).catcomplete({
        delay: 0,
        source: data,
        position: { my : "left bottom", at: "left top" }
    });

});
