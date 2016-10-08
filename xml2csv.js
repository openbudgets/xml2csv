#!/usr/bin/env node
var program = require('commander');
var request = require('request');
var chalk = require('chalk');
var requestHandlers = require("./requestHandlers");

program
    .version('0.0.1')
    .usage('[options] <keywords>')
    .option('-a, --add', 'should be 1,3,5,7')
	.option('-l, --log', 'output log')
    .parse(process.argv);

if(!program.args.length) {
    program.help();
} else {
	var keywords = program.args;
	//var url = 'https://api.github.com/search/repositories?sort=stars&order=desc&q='+keywords;
	//var url = 'https://raw.githubusercontent.com/wk0206/testPorject2/master/TestData/book.xml';
	var test = keywords;
	var url = program.args[0];


	if(program.add) {
		var additionOption = program.args[1];
	}

	if(program.log) {
		var withLog  = program.log;
	}



	if(url.toString().substring(0,4) == "http"){
		request({
			method: 'GET',
			headers: {
				'User-Agent': ''
			},
			url: url
		}, function(error, response, body) {

			if (!error && response.statusCode == 200) {

				//console.log("body " + body);
				//var body = JSON.parse(body);
				if(withLog==true) {
					console.log("online " + url.toString());
				}
				if(program.full) {
					//console.log(body);
				} else {
					//console.log("withLog"+withLog);
					//1 = attribute
					//3 = single brother
					//5 = combine similar
					//7 = omit same value
					var treatXML  = requestHandlers.treatXMLFile(body,additionOption,withLog);

					var temp = requestHandlers.outputXML(treatXML,url,additionOption,withLog);


					//for(var i = 0; i < body.items.length; i++) {
					//console.log(chalk.cyan.bold('Name: ' + body.items[i].name));
					//console.log(chalk.magenta.bold('Owner: ' + body.items[i].owner.login));
					//console.log(chalk.grey('Desc: ' + body.items[i].description + '\n'));
					//console.log(chalk.grey('Clone url: ' + body.items[i].clone_url + '\n'));

					//}

					process.exit(0);
					return temp;
				}
				process.exit(0);
			} else if (error) {
				//console.log(chalk.red('Error: ' + error));
				console.log('Error: ');
				process.exit(1);
			}
		});
	}else{
		console.log("local "+ url.toString());

		fs = require('fs')

		fs.stat(url.toString(),function (error){
			if(!error){
				if(withLog==true){
					console.log("file exist");
				}


				fs.readFile(url, 'utf8', function (error,body) {
					if (!error ) {

						//console.log("body " + body);
						//var body = JSON.parse(body);
						if(program.full) {
							//console.log(body);
						} else {
							//console.log("withLog"+withLog);
							//1 = attribute
							//3 = single brother
							//5 = combine similar
							//7 = omit same value
							var treatXML  = requestHandlers.treatXMLFile(body,additionOption,withLog);

							var temp = requestHandlers.outputXML(treatXML,url,additionOption,withLog);

							process.exit(0);
							return temp;
						}
						process.exit(0);
					} else if (error) {
						//console.log(chalk.red('Error: ' + error));
						console.log('Error: '+error.toString());
						process.exit(1);
					}
					//console.log(data);
				});

			}else {
				console.log("file do not exist");
				process.exit(1);
			}
		})


	}

    //console.log('Keywords: ' + program.args);
	//console.log("test" +　test);





}

