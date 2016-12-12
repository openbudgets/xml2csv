/**
 * Created by wk on 5/30/16.
 */
var fs = require("fs");
var traverse = require('traverse');
var parser = require('xml2json');
var formidable = require("formidable");
var sync = require('synchronize');
var libxmljs = require("libxmljs");

function start(response) {
    console.log("Request handler 'start' was called.");
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<label>This is the first page</label><br/>'+
        '<label>For upload xml</label><br/>'+
        '<label>After upload , click upload</label><br/>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" name="upload" multiple="multiple">'+
        '<input type="submit" value="for test xml input" />'+
        '</form>'+
        '<br/>'+
        '<hr>'+
        '<script type="text/javascript">'+
        'if (window.File && window.FileReader && window.FileList && window.Blob) {'+
        '/*alert(\'support\')*/'+
        '} else {'+
        'alert(\'The File APIs are not fully supported in this browser.\');'+
        '}</script>'+
        '<form action="/xmlload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" id="files" name="files[]" multiple="multiple" hidden>'+
        '<output id="list"></output>'+
        '<script>'+
        'function handleFileSelect(evt) {'+
        '       var files = evt.target.files; '+
        '       console.log(files);'+
        '       var output = [];'+
        '       for (var i = 0, f; f = files[i]; i++) {'+
        '           output.push(\'<li><strong>\', escape(f.name), \'</strong> (\', f.type || \'n/a\', \') - \','+
        '               f.size, \' bytes, last modified: \','+
        '               f.lastModifiedDate.toLocaleDateString(), \'</li>\');'+
        '       }'+
        '       console.log(output);'+
        '       document.getElementById(\'list\').innerHTML = \'<ul>\' + output.join(\'\') + \'</ul>\';'+
        '   }'+
        ''+
        '   document.getElementById(\'files\').addEventListener(\'change\', handleFileSelect, false);'+
        '</script>'+
        '<input type="submit" value="for test link jump" />'+
        '</form>'+
        '</body>'+
        '</html>';
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
    console.log("Request handler 'upload' was called.");
    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files) {
        console.log("parsing done");
        fs.renameSync(files.upload.path, "/tmp/test.xml");
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("received data:<br/>");
        response.write("<a href='/showxml2json'>show xml2json</a>");
        response.write("<br/>");
        response.end();
    });
}
function xmlload(response, request) {
    var xml = "<foo>bar</foo>";

    var json = parser.toJson(xml); //returns a string containing the JSON structure by default

    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files) {
        console.log("parsing done");
        fs.renameSync(files.upload.path, "/tmp/test.xml");
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("received data:<br/>");
        response.write(json);
        response.end();
    });
}
function readFiles(dirname, onFileContent, onError){
    fs.readdir(dirname,function(err,filenames) {
        if(err){
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname+filename,'utf-8', function(err, content){
                if(err){
                    onError(err);
                    return;
                }
                onFileContent(filename,content);
            });
        });
    });
}

function show(response) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.xml", "binary", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            var json = parser.toJson(file); //returns a string containing the JSON structure by default
            var leaves = traverse(json).reduce(function (acc, x) {
                if (this.isLeaf) acc.push(x);
                return acc;
            }, []);
            response.write(json);
            response.end();
        }
    });
}

function showxml2json(response,request,postData) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.xml", "binary", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            console.log("trasform from xml to JSON: start");
            var json = parser.toJson(file); //returns a string containing the JSON structure by default
            console.log("trasform from xml to JSON: end");
            //console.log(json);
            var leaves = traverse(json).reduce(function (acc, x) {
                if (this.isLeaf) acc.push(x);
                return acc;
            }, []);
            var treatJS = treatJson(json);

            var splithtml = json.split(/{/);
            var replace1 = json.replace(/{/g,"<td nowrap>");
            var replace2 = replace1.replace(/}/g,"</td>");
            //var replace2 = replace1.replace(/,/g,",<br/>");
            //var splithtml = json.split(/\".*\"{1}/g);
            var res = '';
            for (var i = 0; i < splithtml.length ; i ++){
                if(splithtml[i].indexOf("}")>0){
                    var temp ="<br/>node:{"+splithtml[i].replace("}","");
                    var temp2 = temp.substring(5);
                    var temp3 = temp2.split(",");
                    res+=(temp+"<br/>");
                    for (var j = 0; j < temp3.length ; j ++){
                        //res+=("<br/>    preoperties:"+temp3[j]);
                    }
                }
            }
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("received data:<br/>");
            var func =
                '<script type="text/javascript">'+
                'function showButton(id){' +
                '   if(document.getElementById(id).style.display=="block"){' +
                '       document.getElementById(id).style.display="none"' +
                '   } else {' +
                '       document.getElementById(id).style.display="block";' +
                '   }'+
                '}'+
                '</script>';

            response.write(func);
            for (var i = 0 ; i<treatJS.length; i ++){
                response.write("<input type = 'button' onclick='showButton(\"toc"+i+"\")' value = data"+i+">");
                response.write("<div id=\"toc"+i+"\" hidden>");
                response.write("<table style=\"width:100%\">");
                for (var j = 0; j < treatJS[i].length; j++){
                    //response.write(treatJS[i][j].datablock+"<br/>");
                    //console.log("treatJS["+i+"]["+j+"]"+treatJS[i][j].datablock);
                    //var htmlLine = JSONtoCSV(treatJS[i][j]);
                    var htmlLine = JSONtoHTML(treatJS[i][j]);
                    response.write(htmlLine);
                }
                response.write("</table>");
                response.write("</div>");
                response.write("<br/>");
            }
            //response.write("<img src='/show' />");
            //response.write("<lable>test</lable>")
            response.end();
        }
    });

}

function showtraverse(response) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.xml", "binary", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            var json = parser.toJson(file); //returns a string containing the JSON structure by default
            //console.log(json);
            var leaves = traverse(json).reduce(function (acc, x) {
                if (this.isLeaf) acc.push(x);
                return acc;
            }, []);
            //console.dir(leaves);
//console.log(typeof (leaves));
            var res = JSON.stringify(leaves);
            response.write(json);
            response.end();
        }
    });
}

function addAllColumnHeaders(myList, selector){
    var columnSet = [];
    var headerTr$ = $('<tr/>');
    for (var i = 0 ; i < myList.length ; i++) {
        var rowHash = myList[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1){
                columnSet.push(key);
                headerTr$.append($('<th/>').html(key));
            }
        }
    }
    $(selector).append(headerTr$);
    return columnSet;
}

function checkIsLeaf(aTree){

    var isLeaf = false;

    if(typeof (aTree)=="string"){
        console.log("input is a string");
    }else{

        if(aTree.child(0)!=null){
            //console.log("aTree.child(0) is not null");
            if(aTree.child(0).toString().substring(0,1)!="<"){
                isLeaf= true;
            }
        }
    }

    if(aTree.child(0)!=null){
        //console.log("aTree.child(0).name() is "+aTree.child(0).name());
        if(aTree.child(0).name()=="text"){
            isLeaf= true;
        }
    }

    //console.log("test result " + isLeaf);
    return isLeaf;
}

function checkIsDescription(aTree){

    console.log(aTree);
    var res = true;

    if(aTree.childNodes()!=undefined){
        var length = aTree.childNodes().length;
        if(length > 1){
            return false;
        }else {
            return checkIsDescription(aTree.child(0));
        }

    }


    return res;
}


function addChild(aTree, res, parent, options, addNode, log){
    if(log==true) {
        console.log("in addChild")
        console.log("    "+"aTree.tostring : " + aTree.toString());
    }

    if(aTree.name()=="text"){
        if(log==true) {
            console.log("    "+"only text , last layer");
            console.log("    "+"directly return ");
        }

        return res;
    }

    //xml
    var xml = libxmljs.parseXmlString(aTree,{ noblanks: true });

    //root
    var contactElement = xml.root();

    //root name
    var rootName=contactElement.name();

    var children = aTree.childNodes();

    if(addNode==true){

        var ele = {}
        ele["Tree"] = aTree;
        ele["Root"] = contactElement;
        ele["RootName"] = rootName;
        ele["Attribute"] = contactElement.attrs();
        ele["Text"] = contactElement.name();
        ele["Path"] = contactElement.path();
        ele["Chilrden"] = contactElement.childNodes();
        ele["ChilrdenNumber"] = contactElement.childNodes().length;
        ele["Chilrden[0]"] = contactElement.childNodes()[0];
        ele["isLeaf"] = checkIsLeaf(aTree);
        ele["output"] = false;

        //add this node to parent(include itself)
        parent.push(ele);
    }

    if(aTree.child(0)!=null){
        if(log==true) {
            console.log("    "+"child is not empty");
        }


        if(aTree.child(0).toString().substring(0,1)!="<" ){
            //res.push();
            if(log==true) {
                console.log("        "+"but will stop here ,output layer");
                console.log("        "+"aTree.text() : " + aTree.text());
                console.log("        "+"aTree.name : " + aTree.name());
            }

            //add leaf node
            var ele = {}
            ele["Tree"] = aTree;
            ele["Root"] = "";
            ele["RootName"] = aTree.name();
            ele["Attribute"] = aTree.attrs();
            ele["Text"] = aTree.text();
            ele["Path"] = aTree.path();
            ele["Chilrden"] = aTree.childNodes();
            ele["ChilrdenNumber"] = aTree.childNodes().length;
            ele["Chilrden[0]"] = aTree.childNodes()[0];
            ele["isLeaf"] = checkIsLeaf(aTree);
            ele["output"] = true;

            if(log==true) {
                console.log("res length is "+res.length);
            }

            res.push(ele);
            return res;
        } else {

            if(log==true){
                console.log("this child should not be the last lyer "+aTree.child(0).toString());
                if(res=="") {
                    console.log("res is empty");
                }

                console.log("children.length is "+children.length);
            }

            if(children.length != 1){
                return res;
            }else{
                var result = addChild(aTree.child(0),parent, res, true, options, log);
                return result;
            }
        }
    }else{
        //add a node with empty value
        if(log==true) {
            console.log("    "+"child is empty");
            console.log("    "+"aTree.text() : " + aTree.text());
            console.log("    "+"aTree.name() : " + aTree.name());
        }

        var ele = {}
        ele["Tree"] = aTree;
        ele["Root"] = "";
        ele["RootName"] = aTree.name();
        ele["Attribute"] = aTree.attrs();
        ele["Text"] = aTree.name();
        ele["Path"] = aTree.path();
        ele["Chilrden"] = aTree.childNodes();
        ele["ChilrdenNumber"] = aTree.childNodes().length;
        ele["Chilrden[0]"] = aTree.childNodes()[0];
        ele["isLeaf"] = checkIsLeaf(aTree);
        ele["output"] = true;

        res.push(ele);
        return res;

    }

    if(log==true){
        console.log("test res return "+res);
        if(res=="") {
            console.log("res is empty");
        }else {
            console.log("res length return is "+res.length);
        }
    }



    return res;
}


//put in a tree.
//give out an array.
function recFunc(aTree, parentArr, result, child ,checkedMark, matchMark, options,rgEx, log ){

    if(log ==true) {
        console.log("--------------------------")
    }
    //parent
    var parent = [];
    parent=parentArr.slice(0);

    //global result
    var res = result;

    //xml
    var xml = libxmljs.parseXmlString(aTree,{ noblanks: true });

    //go deep mark, if not a leaf, go deep
    var isLeaf = checkIsLeaf(xml);
    if(log ==true) {
        console.log("is a leaf? " + isLeaf);
    }


    //root
    var contactElement = xml.root();

    //root name
    var rootName=contactElement.name();

    //var ele = current
    var ele = {}
    ele["Tree"] = aTree;
    ele["Root"] = contactElement;
    ele["RootName"] = rootName;
    ele["Attribute"] = contactElement.attrs();
    ele["Text"] = contactElement.name();

    //path = parent path + path
    if(parentArr.length!=0){
        ele["Path"] = parentArr[parentArr.length-1]["Path"]+contactElement.path();
    }else{
        ele["Path"] = contactElement.path();
    }


    ele["Chilrden"] = contactElement.childNodes();
    ele["ChilrdenNumber"] = contactElement.childNodes().length;
    ele["Chilrden[0]"] = contactElement.childNodes()[0];
    ele["isLeaf"] = checkIsLeaf(aTree);
    ele["output"] = false;


    //add this node to parent(include itself)
    if(rgEx!=""){

        var regEx= ""+rgEx+""
        if(regEx.substring(0,1)!="^"){
            regEx="^"+regEx;
        }

        if(regEx.substring(regEx.length-1,regEx.length)!="$"){
            regEx=regEx+"$";
        }

        var test = ele["Root"].toString();
        //test = "<amount catpol=\"5.2.17\" year=\"n\"><figure>p.m.</figure></amount>"
        if(log == true){
            console.log(regEx);
        }

        if(test.match(regEx)!=null){
            matchMark = true;

        }else {
            //console.log(test);
        }

    }


    if(matchMark == true){
        ele["isLeaf"] = "isMatch";
    }
    parent.push(ele);

    //isolate the attribute, make them as a node
    //OPTION 1
    if(options==undefined){
        //console.log("empty options");
        options='0';
    }
    if(options.indexOf("1")>=0){
        if(ele["Attribute"].length>0){

            var attrList = ele["Attribute"];

            for(idx in ele["Attribute"]){
                var attr = {}
                attr["Tree"] = "";
                attr["Root"] = "";
                attr["RootName"] = ele["RootName"] + " " + attrList[idx].name();
                attr["Attribute"] = "";
                attr["Text"] = attrList[idx].value();
                attr["Path"] = ele["Path"];
                attr["Children"] = "";
                attr["ChildrenNumber"] = "";
                attr["Children[0]"] = "";
                attr["isLeaf"] = "";
                attr["output"] = true;
                parent.push(attr);
            }
        }
    }



    //this part is to handle every children of input,
    //check if they should be isolate and put into a node
    //and mark the ones already checked not to be check again
    //ignore the ones with an already check mark
    var children = contactElement.childNodes();
    var childrenNext = [];
    var tempMark = false;
    if(checkedMark == false){
        //will never come to this if
        if(children==undefined || (children == "")){
            if(log ==true) {
                console.log("ele[\"Children\"]==undefined");
            }
        }else{
            if(log ==true) {
                console.log("how many children " + children.length);
            }

            for(var i = 0; i < children.length; i ++){
                if(log ==true) {
                    console.log("put child " + (i + 1) + " to addChild()");
                }
                var childrenA = addChild(children[i],[],[],options,false, log);
                //  childrenNext = test-childrenA


                //if addChild return something ,that means this branch is a dead end
                //add this node to parent as a description.
                if(childrenA.length == 0 || childrenA == ""){
                    //this child should be have further check
                    childrenNext.push(children[i]);
                }else{
                    if(log ==true) {
                        console.log("some return from addChild()" + childrenA[0]["RootName"]+" : "+childrenA[0]["Text"]);
                    }
                    //if this node has some attribute, will also return
                    for(var j = 0; j < childrenA.length ; j ++){
                        //console.log(childrenA[j]);
                        //OPTION 3
                        if(options==undefined){
                            //console.log("empty options");
                            options='0';
                        }
                        //if(options == "3" || options =="13" || options =="35" || options =="135"){
                        if(options.indexOf("3")>=0){
                            parent.push(childrenA[j]);
                        }

                    }

                }
                //var childEles = addChild(test[idx],[]);
            }

            //this block has same structure, they are all data,
            if(childrenNext.length == 0 & children.length > 1){
                var parentLength = parent.length;
                //remove all the child from parent
                parent=parent.slice(0,parentLength-children.length);
                //set childrenNext to all the children
                childrenNext = children;
                tempMark = true;
            }
        }
    }else{
        childrenNext = children;
    }

    //if the data has similar structure and need to make then in one row
    var endRowMark = false;

    //each child(childrenNext) call recFunc again
    //I forgot how this part works now
    //add comment later
    if(isLeaf==false){

        for(var i = childrenNext.length-1 ; i>-1 ; i--){

            if(childrenNext[i].toString().substring(childrenNext[i].toString().length-2,childrenNext[i].toString().length)=="/>"){
                var ele = {}
                ele["Tree"] = "";
                ele["Root"] = "";
                ele["RootName"] = childrenNext[i].toString().substring(1,childrenNext[i].toString().length-2);
                ele["Attribute"] = "";
                ele["Text"] = "";
                ele["Path"] = "";
                ele["Chilrden"] = "";
                ele["ChilrdenNumber"] = "";
                ele["Chilrden[0]"] = "";
                ele["isLeaf"] = "";
                ele["output"] = false;

                //add this node to parent(include itself)
                parent.push(ele);

                continue;
            }

            if(checkedMark==true){
                if(log ==true) {
                    console.log("path 1 " + matchMark);
                }
                recFunc(childrenNext[i],parent,res,child, checkedMark, matchMark, options,rgEx, log);
            }else if(tempMark==true){
                if(log ==true) {
                    console.log("path 2 " + matchMark);
                }

                recFunc(childrenNext[i],parent,res,child, tempMark, matchMark, options,rgEx, log);

            }else {
                //this should be the most common choice
                if(log ==true) {
                    console.log("path 3 " + matchMark);
                }
                recFunc(childrenNext[i],parent,res,child,tempMark, matchMark, options,rgEx, log);
            }


            if(i==0){
                //last element
                endRowMark = true;

            }
        }

        //this tempNode , tell the row is a node
        //node row should be in the final result
        //node row should not be output
        //exist only for assemble others
        var tempNode = {}
        tempNode["Tree"] = "";
        tempNode["Root"] = "";

        tempNode["Attribute"] = "";
        tempNode["Text"] = "isNode";
        tempNode["Path"] = "";
        tempNode["Chilrden"] = "";
        tempNode["ChilrdenNumber"] = ""
        tempNode["Chilrden[0]"] = "";
        if(matchMark==true){
            tempNode["RootName"] = "isNode";
            tempNode["isLeaf"] = "isMatch";
        }else{
            tempNode["RootName"] = "isNode";
            tempNode["isLeaf"] = "isNode";
        }
        tempNode["output"] = false;
        parent.unshift(tempNode);


        res.unshift(parent);

    }else {


        ele["Text"]=contactElement.text();
        ele["output"] = true;
        child.unshift(ele);

        //this tempNode tells the row is a leaf row
        //leaf row must be in both final result and output
        //leaf row is the element for next step to combine
        //leaf row will be combined if every RootName is same
        var tempNode = {}
        tempNode["Tree"] = "";
        tempNode["Root"] = "";

        tempNode["Attribute"] = "";
        tempNode["Text"] = "isLeaf";
        tempNode["Path"] = "";
        tempNode["Chilrden"] = "";
        tempNode["ChilrdenNumber"] = ""
        tempNode["Chilrden[0]"] = "";
        if(matchMark==true){
            tempNode["RootName"] = "isMatch";
            tempNode["isLeaf"] = "isMatch";
        }else{
            tempNode["RootName"] = "isLeaf";
            tempNode["isLeaf"] = "isLeaf";
        }

        tempNode["output"] = false;
        parent.unshift(tempNode);

        res.unshift(parent);
    }


    //combine rows
    if(endRowMark == true){

        for(var i = 0; i < child.length ; i ++){
            //parent.push(child[i]);
        }

        child.length = 0;
    }


    //if find an leaf , return this root- node -leaf back
    if(isLeaf==true || endRowMark == true){
        return res;
    }
}

function checkExist(inputLeaf, outputStack){

    //this part will get out every piece of outputStack
    //make this piece into title
    //compare this title with inputLeaf
    //until some piece matched
    //or nothing matched, return -1
    var res = -1;
    for(var i = 0; i < outputStack.length; i ++){

        var table = outputStack[i].title;

        var title = [];

        for(idx in table){
            title.push(table[idx].RootName);

        }

        if(title.length != inputLeaf.length){
            continue;
        }

        var sameMark = false;
        for(var j = 0; j < title.length; j ++){

            if(title.indexOf(inputLeaf[j].RootName)<0){
                break;

            }

            if(title[j]!=inputLeaf[j].RootName){
                //break;
            }

            //let's see what this for
            //uhn, I forgot it
            //maybe it is useless now
            if(j == title.length-1 && title[j]==inputLeaf[j].RootName){
                //sameMark=true;
            }

            //at the last element , set sameMark to TRUE
            if(j == title.length-1 && title.indexOf(inputLeaf[j].RootName)>0){
                sameMark=true;
            }
        }

        //this mark means
        //they have same length
        //they have every element indexed in the compare object( the piece of outputStack)
        if(sameMark==true){

            return i;
        }

    }

    return -1;
}

function sequenceAdjust(candidate, target){

    if(candidate.length != target.length){
        console.log("length different " + candidate.length +" : "+ target.length)
    }
    var res=[];
    var length = target.length;
    var title = [];

    for(idx in candidate){
        title.push(candidate[idx].RootName);
    }

    for(var i = 0; i < length ; i ++) {
        console.log("title.indexOf(target[i].RootName) "+title.indexOf(target[i].RootName) + target[i].RootName + " : " + target[i].Text);
        var index = title.indexOf(target[i].RootName);
        res.push(candidate[index]);
    }

    return res;
}

function combineBranch(treeStructure, options,rgEx, log){
    if(log == true){
        console.log("options "+options);
        console.log("log "+log);
    }

    var res = [];
    var shouldCombine = false;
    var sameMark = false;
    //to hold the leaf with same parent
    var temp = [];

    //loop every row,combine same ones
    for(var i = 0; i < treeStructure.length; i++){

        var aData = treeStructure[i];

        for (idx in treeStructure[i]){
            //console.log("aData" + treeStructure[i][idx].Text);
        }


        //OPTION 5
        if(options==undefined){
            options='0';
        }

        if(options.indexOf("5")>=0){
            var tempData = aData.slice(0,aData.length-1);
            var firstEle;

            if(i==treeStructure.length-1){
                //last element
                if(rgEx!=""){
                    if(treeStructure[i-1][0].RootName=="isMatch" && treeStructure[i][0].RootName=="isMatch"){
                        sameMark = false;
                    }else{
                        sameMark = false;
                    }
                }else{
                    if(treeStructure[i-1][0].RootName=="isLeaf" && treeStructure[i][0].RootName=="isLeaf"){
                        sameMark = false;
                    }else{
                        sameMark = false;
                    }
                }


            }else{
                //all element except last one
                if(rgEx!=""){
                    if((treeStructure[i][0].RootName=="isNode"|| treeStructure[i+1][0].RootName=="isLeaf") && treeStructure[i+1][0].RootName=="isMatch"){
                        sameMark = true;
                        firstEle = treeStructure[i][aData.length-1];
                    }
                    if(treeStructure[i][0].RootName=="isMatch" && (treeStructure[i+1][0].RootName=="isNode"|| treeStructure[i+1][0].RootName=="isLeaf")){
                        sameMark = false;
                    }

                }else{
                    if(treeStructure[i][0].RootName=="isNode" && treeStructure[i+1][0].RootName=="isLeaf"){
                        sameMark = true;
                        firstEle = treeStructure[i][aData.length-1];
                    }
                    if(treeStructure[i][0].RootName=="isLeaf" && treeStructure[i+1][0].RootName=="isNode"){
                        sameMark = false;
                    }
                }
            }

            var differentMark = false;

            if( sameMark == true){
                var pathLength = treeStructure[i-1].length;

                var current = treeStructure[i][aData.length-1];

                if(current.RootName != firstEle.RootName){
                    differentMark=true;
                }
                temp.push(treeStructure[i][aData.length-1]);
                continue;
            }



            if(differentMark==false){
                //temp.length=0;
            }
            if(sameMark == false && temp.length >0){
                temp.push(treeStructure[i][aData.length-1]);

                for(var j = 1 ; j < temp.length; j++){
                    tempData.push(temp[j]);
                }
                if(log == true) {

                    for (var x = 0; x < tempData.length; x++) {
                        console.log("tempDataX" + tempData[x].RootName + " : " + tempData[x].Text);
                    }
                }
                //clear temp
                temp.length = 0;
            }

        } else {
            var tempData = aData.slice(0,aData.length);
        }

        var extractMark=""

        if(rgEx!=""){
            extractMark = "isMatch";
        }else{
            extractMark = "isLeaf";
        }

        if(treeStructure[i][0].RootName==extractMark){

            var index = checkExist(tempData,res);

            //index == -1 means it is a brand new title type
            if(index==-1){
                var ele = {};
                ele["title"]=tempData;
                ele["count"]=1;
                ele["values"]=[];
                ele["values"].push(tempData);

                res.push(ele);
            }else{
                //means it already exist , just add it
                //adjust sequence before added
                //OPTION 6 candidate
                //var seqData = sequenceAdjust(tempData,res[index].title);

                res[index].values.push(tempData);

                res[index].count+=1;
            }
        }
    }

    //console.log(res);


    return res;
}

function treatXMLFile(xmlInput,options,rgEx,log){
    if(log == true){
        console.log("options "+options);
        console.log("log "+log);
    }

    var treeStructure = [];

    //parse string file into XML object
    var xml = libxmljs.parseXmlString(xmlInput,{ noblanks: true });

    //grab function
    treeStructure=recFunc(xml,[],[],[],false,false, options,rgEx, log);

    for(idx in treeStructure){
        var count = 0;
        var str = [];
        var str2 = "";
        for (idx2 in treeStructure[idx]){

            if (str.length == 0 ){
                var ele = {};
                ele["title"] =treeStructure[idx][idx2].RootName;
                ele["count"]=1;
                str.push(ele);
            }else{
                var foundMark = false;
                for ( var i = 0 ; i < str.length ; i ++){
                    if(treeStructure[idx][idx2].RootName == str[i].title){
                        str[i].count +=1;
                        treeStructure[idx][idx2].RootName = (treeStructure[idx][idx2].RootName+ (str[i].count).toString());
                        foundMark = true;
                        break;
                    }
                }

                if(foundMark==false){
                    var ele = {};
                    ele["title"] =treeStructure[idx][idx2].RootName;
                    ele["count"]=1;
                    str.push(ele);
                }
            }
        }
    }

    if(log==true){

        console.log("################start of treeStructure################")
        for(idx in treeStructure){

            var count = 0;
            var str = "";
            var str2 = "";
            for (idx2 in treeStructure[idx]){
                if(1==1){
                    str+=treeStructure[idx][idx2].RootName;
                    str+=",";
                    str2+=treeStructure[idx][idx2].Text;
                    str2+=",";
                }
            }
            if(str!=""){
                console.log(str+" ;with value: "+str2);
            }
        }
        console.log("################end of treeStructure################")
    }

    //classfiy function
    var tables = combineBranch(treeStructure,options,rgEx, log);

    if(log==true){

        console.log("################start of combineBranch################")
        if(log == true) {
            for(var x = 0; x <tables.length; x++){
                for (var i = 0; i < tables[x].values.length; i++) {
                    console.log("this is title " + tables[x].values[i].length);

                    for (var j = 0; j < tables[x].values[i].length; j++) {
                        console.log("..")
                        console.log("this is values | tables[x].values.length    " + (i+1)+ " of " + tables[x].values.length)
                        console.log("this is values | tables[x].values[i].length " + (j+1) + " of " + tables[x].values[i].length)
                        console.log("this is values | " + tables[x].values[i][j].RootName+" : "+tables[x].values[i][j].Text);

                    }
                }
            }
        }
        console.log("################end of combineBranch################")
    }

    return tables;
}


function treatJson( json ){

    var patten = "$t";
    var str = json.replace("$t","description")

    var indices = [];
    for(var i=0; i<str.length;i++) {
        if (str[i] === "{") indices.push([i,"{"]);
        if (str[i] === "}") indices.push([i,"}"]);
        if (str[i] === "[") indices.push([i,"["]);
        if (str[i] === "]") indices.push([i,"]"]);
    }

    //},"
    //:{    -> : {<br/>
    var temp1 = json.replace(/:{/g,": {<br/>");
    //","    -> ",<br/>"
    var temp2 = temp1.replace(/\",\"/g,"\",<br/>\"");
    //},"  -> "<br/>},<br/>"
    var temp3 = temp2.replace(/},\"/g,"},<br/>\"");
    //"}    -> "<br/>}
    var temp4 = temp3.replace(/\"}/g,"\"<br/>}");
    //":[{" -> ":[<br/>{<br/>"
    var temp5 = temp4.replace(/\:\[{/g,":[<br/>{<br/>");
    //]     -> "]<br/>
    var temp6 = temp5.replace(/]/g,"]<br/>");
    //}}     -> "}<br/>}
    var temp7 = temp6.replace(/}\}/g,"}<br/>}");
    //},{    -> },<br/>{<br/>
    var temp8 = temp7.replace(/},{/g,"},<br/>{<br/>");
    //}]     -> }<br/>]
    var temp9 = temp8.replace(/}]/g,"}<br/>]");
    //}}     -> "}<br/>}
    var temp10 = temp9.replace(/}\}/g,"}<br/>}");
    var temp11 = temp10.split("<br/>");
    var temp12;
    var temp13=[];
    var indentation = 0;

    var prefix=[];
    var data=[];
    var line=[];
    for(var i=0; i<temp11.length;i++) {
        if(temp11[i].indexOf("{")>-1){
            temp12+=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            ele={};
            ele["indentation"] = buildIndentation(indentation)+indentation;
            ele["line"] = temp11[i];
            temp13.push(ele);
            //temp13[i]=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            indentation++;
        }else if(temp11[i].indexOf("}")>-1){
            temp12+=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            ele={};
            ele["indentation"] = buildIndentation(indentation)+indentation;
            ele["line"] = temp11[i];
            temp13.push(ele);
            //temp13[i]=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            indentation--;
        }else if(temp11[i].indexOf("[")>-1){
            temp12+=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            ele={};
            ele["indentation"] = buildIndentation(indentation)+indentation;
            ele["line"] = temp11[i];
            temp13.push(ele);
            //temp13[i]=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            indentation++;
        }else if(temp11[i].indexOf("]")>-1){
            temp12+=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            ele={};
            ele["indentation"] = buildIndentation(indentation)+indentation;
            ele["line"] = temp11[i];
            temp13.push(ele);
            //temp13[i]=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            indentation--;
        }else{
            temp12+=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
            ele={};
            ele["indentation"] = buildIndentation(indentation)+indentation;
            ele["line"] = temp11[i];
            temp13.push(ele);
            //temp13[i]=buildIndentation(indentation)+indentation+temp11[i]+"<br/>";
        }
    }

    var datas = [];
    var dataflag = false;
    for(var i=0; i<temp13.length;i++) {
        if(temp13[i].line.indexOf("[")>-1){
            if(dataflag == false){
                data.push(temp13[i]);
            } else{
                for (var idx in data){
                    prefix.push(data[idx]);

                }
                data.length = 0;
                data.push(temp13[i]);

            }
            dataflag = true;
        } else if ((temp13[i].line.indexOf("]")>-1) && (dataflag == true)){
            data.push(temp13[i]);
            dataflag = false;
            //remove duplicate
            var cleanedPrefix = cleanPrefix(prefix);
            //if this prefix is already exist ,return index
            //var index = checkPrefix(datas, cleanedPrefix);

            var index = -1;
            var simpledataFlag = false;
            if(checkSimpleData(data)){
                simpledataFlag=true;

            }
            index = findSameTitle(datas, cleanedPrefix, data, simpledataFlag);
            //prefix is same ,
            if(index>=0){
                //check data title , return data title length
                //var dataLength = checkData(datas[index],cleanedPrefix, data);
                //prefix exist, and data title is same , add to exist
                //console.log("add data to index "+index)
                var dataBlock = addDataToExist(cleanedPrefix, datas[index], data, simpledataFlag);
                var ele = {};
                ele["prefix"] =dataBlock[0];
                ele["datablock"]=dataBlock;
                if(simpledataFlag==true){
                    ele["simple"]=true;
                }

                datas[index] = ele;
            }
            //prefix is different
            else {
                //prefix is not exist, make new block
                var dataBlock = treatData(cleanedPrefix, data, simpledataFlag);
                var ele = {};
                ele["prefix"] =dataBlock[0];
                ele["datablock"]=dataBlock;
                if(simpledataFlag==true){
                    ele["simple"]=true;
                }else{
                    ele["simple"]=false;
                }

                datas.push(ele);
            }
            data.length = 0;
        } else if ( dataflag == true ){

            data.push(temp13[i]);
        } else if (dataflag == false){

            prefix.push(temp13[i]);
        }
    }
    var res = [];
    for(var i = 0; i< datas.length ; i++){
        res.push(datas[i].datablock);

    }

    var result = cleanResult(res);
    var mergedResult = mergeFinal(result);
    return mergedResult;
}

function reduceColumn(column, outputColumnNumber){
    var res = [];
    for (var i = 0; i < outputColumnNumber.length; i++){
        res.push(column[outputColumnNumber[i]]);
    }

    return res;
}


function checkTitle(title1, title2){

    var mark = false;

    if(title1.length==title2.length){

        for(index in title1){
            if( title1[index].att==title2[index].att){
                mark=true;
                continue;

            }else{
                mark=false;
                break;
            }
        }
    }
    return mark;
}

function mergeFinal(tables){

    if(tables.length == 1){
        return tables;
    }

    var res = [];
    var mergedTable=[];
    var mergeToTable=[];

    //step 1
    //delete useless column(output==false)
    for (var i = 0; i < tables.length; i++){
        var outputColumnNumber=[];
        var outputColumns=[];
        var title = tables[i][0];

        if(title.length == 0){
            continue;
        }

        //get out useful column , put into outputColumnNumber array
        for(var index=0; index < title.length; index++){
            if(title[index].output){
                outputColumnNumber.push(index);
            }
        }
        for(index in tables[i]){

            outputColumns.push(reduceColumn(tables[i][index],outputColumnNumber));
        }

        res.push(outputColumns);
    }


    //step2
    //merge same title tables
    for (var i = 0; i < res.length; i++){
        if(mergedTable.length>0 && mergedTable.indexOf(i)>-1){
            //console.log("merged before");
            continue;
        }
        var title = res[i][0];

        if(title.length == 0){
            continue;
        }

        for (var j = i+1; j < res.length; j++){
            //this table merged by privious
            if(mergedTable.length>0 && mergedTable.indexOf(j)>-1){
                //console.log("merged before");
                continue;
            }

            //merge
            var anotherTitle = res[j][0];

            if(anotherTitle.length == 0){
                continue;
            }

            var mergeMark=checkTitle(title,anotherTitle);

            //check title, if same, set merge mark = true
            if(mergeMark==false){
                continue;
            }else{
                //j is merged
                mergedTable.push(j);
                //j to i
                mergeToTable.push([j,i])
            }

            //if merge mark = true, then merge
            if(mergeMark==true){
                for (var index = 1 ; index < res[j].length; index++ ){
                    //build row
                    var tempRow = res[i].slice(0);
                    tempRow.push(res[j][index]);
                    res[i]=tempRow;
                }

            }else{
                continue;
            }
        }
    }

    //get out non-empty tables
    var result=[];

    for(var i = 0; i < res.length; i ++){
        if(mergedTable.indexOf(i)==-1){
            result.push(res[i]);
        }
    }

    return result;
}


function cleanResult(res){
    var resCopy = res.slice(0);
    var uselessArray = [];
    uselessArray.push(": {");
    uselessArray.push(":[");
    uselessArray.push("-");
    uselessArray.push(" ");
    uselessArray.push("");
    uselessArray.push("{");
    uselessArray.push(" {");
    uselessArray.push("[");
    uselessArray.push(" [");
    for(var idx=0; idx<res.length; idx++){
        //console.log("happend at "+ idx);
        var data = res[idx];
        var titleLine = data[0].slice(0);
        var associativeArray = {};
        for (var i = 0; i < titleLine.length; i++){

            if(Object.keys(associativeArray).indexOf(titleLine[i].att)>-1)　{
                associativeArray[titleLine[i].att]++;
            }else {
                associativeArray[titleLine[i].att]=1;
            }

            if(Object.keys(associativeArray).indexOf(titleLine[i].att)>-1)　{
                if(associativeArray[titleLine[i].att]>1){
                    titleLine[i].val = titleLine[i].att +　associativeArray[titleLine[i].att];
                }

            }
        }

        for(var i = 0; i < data.length ; i++){
            //console.log("data["+i+"].length" + data[i].length);
        }

        //i is column
        for(var i = 0; i < data[0].length ; i++){
            //j is row
            for(var j = 1; j < data.length ; j++){

                if((uselessArray.indexOf(data[j][i]))!=undefined){
                    if(uselessArray.indexOf(data[j][i].val)!=undefined){
                        if(uselessArray.indexOf(data[j][i].val)==-1){
                            titleLine[i]["output"]=true;
                            break;
                        }else {
                            titleLine[i]["output"]=false;
                        }
                    }
                }


            }

        }
        resCopy[idx][0]=titleLine;
    }
    return resCopy;
}
function buildIndentation(index){
    //var strindent = '----';
    var strindent = '';
    var temp = index;
    var res="";
    while(temp >0){
        res+=strindent;
        temp--;
    }

    return res;
}

function addNewPage(response,request, postdata){
    response.write(postdata);
    response.end;
}


//this function is mainly work on the data(detect by other function)
//if the datas are regular (same format or same construction)
//if the data is single (without a brother leaf)
//if the data is irregular(different from each other)
function treatData(prefix,data ,simpledataFlag){
    var title = []
    var rows = [];
    var rowPrefix = prefix.slice(0);
    var dataStack = [];


    //copy prefix
    for(idx in prefix){
        var ele = {};
        ele={};
        ele["indentation"] = prefix[idx].indentation;
        ele["att"]= cleanValue(prefix[idx].att);
        ele["val"]= cleanValue(prefix[idx].att);
        title.push(ele);
    }

    var count = 0;
    var pieceOfDataFlag = 0;
    var rowItemCount = 0;
    var inRowFlag = false;
    var tempTitle = [];

    //data is not a simple data
    if(simpledataFlag==false){

        //this loop determains title
        for(var i = 0 ; i < data.length; i++) {

            //for some data has attribute
            var splitPoint = data[i].line.indexOf(":");

            //detect a start
            if (data[i].line.indexOf("{") > -1) {
                if (pieceOfDataFlag == 0) {

                    dataStack.length = 0;
                    count++;
                }
                pieceOfDataFlag++;
                inRowFlag = true;
            }

            //detect an end
            if (data[i].line.indexOf("}") > -1) {
                pieceOfDataFlag--;
                inRowFlag = false;
            }

            //split attribute
            if (splitPoint > -1) {
                var att = data[i].line.substring(0, splitPoint);
                var val = data[i].line.substring(splitPoint + 1);
                if (count == 1) {
                    ele = {};
                    ele["indentation"] = "";
                    ele["att"] = cleanValue(att);
                    ele["val"] = cleanValue(att);

                    title.push(ele);
                    tempTitle.push(ele);
                }
                else if(count>1){
                    break;
                }
            }
        }

        pieceOfDataFlag=0;

        //this loop determains data
        for(var i = 0 ; i < data.length; i++){

            //for some data has attribute
            var splitPoint = data[i].line.indexOf(":");

            //detect a start
            if(data[i].line.indexOf("{")>-1){
                if(pieceOfDataFlag==0){

                    dataStack.length = 0;
                    count++;
                }
                pieceOfDataFlag++;
                inRowFlag=true;
            }

            //detect an end
            if(data[i].line.indexOf("}")>-1){
                pieceOfDataFlag--;
                inRowFlag=false;
            }
            //split attribute
            if (splitPoint > -1) {
                var att = data[i].line.substring(0, splitPoint);
                var val = data[i].line.substring(splitPoint + 1);

                var temp = val;
                //delete useless comma
                if(temp.substring(val.length-1)==","){
                    temp = temp.substring(0,val.length-1);
                }
                //mark useless column
                if(temp.substring(val.length-1)=="{"){
                    temp = "-";
                }

                //not first row
                if(rows.length >1){

                    ele={};
                    ele["indentation"] = data[i].indentation;
                    ele["att"]=cleanValue(att);
                    ele["val"]=cleanValue(temp);
                    dataStack.push(ele);

                }

                //very first row, always same as title
                else{
                    ele={};
                    ele["indentation"] = data[i].indentation;
                    ele["att"]=cleanValue(att);
                    ele["val"]=cleanValue(temp);
                    dataStack.push(ele);
                }
                rowItemCount++;

                //the new build row, has length smaller than the last row in [rows]-[prefix]
                if(rows.length>1 && rowItemCount<=(rows[rows.length-1].length-prefix.length)){
                    //the last row in [rows],the element of index of [new build last] not equal to new build row's last
                    if(rows[rows.length-1][prefix.length+rowItemCount-1].att!=att){
                        //console.log("not same");
                        //console.log(rows[rows.length-1][prefix.length+rowItemCount-1]);
                        //console.log(att);
                    }else{
                        //console.log("same");
                        //console.log(rows[rows.length-1][prefix.length+rowItemCount-1]);
                        //console.log(att);
                    }
                }else{
                    //rowItemCount--;
                }
            }

            //piece of data finish, attach to rows
            //console.log("pieceOfDataFlag = "+pieceOfDataFlag);
            if(data[i].line.indexOf("}")>-1 && (pieceOfDataFlag==0)){

                var temp = [];
                //copy prefix
                for(idx in prefix){
                    var ele = {};
                    ele={};
                    ele["indentation"] = prefix[idx].indentation;
                    ele["att"]= cleanValue(prefix[idx].att);
                    ele["val"]= cleanValue(prefix[idx].val);
                    temp.push(ele);
                }
                var tempData = adaptDataToTitle(tempTitle,dataStack);

                for (idx in tempData){
                    temp.push(tempData[idx]);
                }
                var row = temp;
                rowItemCount=0;

                rows.push(row);
            }
        }

        //attach title to the first row

        rows.unshift(title);
    }
    //this is for simple/single data
    else{
        for(var i = 0 ; i < data.length; i++){
            var splitPoint = data[i].line.indexOf(":");
            if(splitPoint>-1){
                var att = data[i].line.substring(0,splitPoint);
                var val = data[i].line.substring(splitPoint);
            }
            else{
                var att = data[i].line;
                var val = data[i].line;
            }
            ele={};
            ele["indentation"] ="";

            ele["att"]=cleanValue(att);
            ele["val"]=cleanValue(val);
            title.push(ele);
        }
        rows.push(title);
    }
    return rows;
}


function adaptDataToTitle(title, data){
    var res=[];
    var sameMark=true;

    if(title.length==data.length){
        for(var i = 0; i < title.length; i++){
            if(title[i].att!=data[i].att){
                sameMark=false;
            }
        }
    }else{
        sameMark=false;
    }

    //same structure, change nothing, return directly
    if(sameMark==true){
        return data;
    }

    //title is fix,
    //data shorter?
    //data longer?
    //data different?
    var index = [];
//console.log("--------------")
    if(sameMark==false){
        var tempTitle = title.slice(0);

        for(var i = 0; i <tempTitle.length; i++){

            var temp = tempTitle.slice(i,i+1);
            //var ele = temp[0];

            var att = temp[0].att;
            var val = temp[0].val;

            var changed=false;
            var ele = {};
            //search att in data, replace val in ele
            for (var j = 0; j < data.length ; j ++){
                //grab same attribute , this attribute must not used before.
                 if(data[j].att == att && index.indexOf(j)==-1){

                    var ele = {};
                    ele["att"] = att;
                    ele["val"] = data[j].val;
                    index.push(j);
                    changed = true;
                    break;
                }else{
                    change = false;
                }
            }

            if(changed==false){
                var ele = {};
                ele["att"] = att;
                ele["val"] = "-";
            }
            res.push(ele);
        }
    }

    return res;
}

function JSONtoCSV(inputCSV, title){
    var res = "";
    res+="";
    for(idx in inputCSV){
        if(title[idx].output==true){
            res+=inputCSV[idx].val;
            if(res.substring(res.length-1)==","){
            }else {
                res+=",";
            }
        }
    }
    res = res.substring(0,res.length-1);
    res+="<br/>";
    return res;
}

function cleanValue(aValue){


    var res="";
    var heading="";
    var tail="";

    if(aValue.slice(aValue.length-1)==","){
        tail = aValue.slice(0,aValue.length-1);
        res = tail;
    }else if(aValue.slice(aValue.length-1)=="]"){
        tail = aValue.slice(0,aValue.length-1);
        res = tail;
    }else{
        tail = aValue;
        res = aValue;
    }


    if(aValue.slice(0,2)==":["){
        heading = tail.slice(2,tail.length);
        res=heading;
    }else if(aValue.slice(0,2)==":{"){
        heading = tail.slice(2,tail.length);
        res=heading;
    }else if(aValue.slice(0,1)=="{"){
        heading = tail.slice(1,tail.length);
        res=heading;
    }else if(aValue.slice(0,1)=="["){
        heading = tail.slice(1,tail.length);
        res=heading;
    }else if(aValue.slice(0,1)==":"){
        heading = tail.slice(1,tail.length);
        res=heading;
    }else{
        res = tail;
    }

    return res;
}
function JSONtoConsoleCSV(inputCSV, title){
    var res = "";
    res+="";
    for(idx in inputCSV){
        if(title[idx].output==true){
            if(inputCSV[idx]==undefined){
                res+="wrong here";
            }else{
                res+=inputCSV[idx].val;
            }
            if(res.substring(res.length-1)==","){
            }else {
                res+=",";
            }
        }
    }
    res = res.substring(0,res.length-1);

    return res;
}

function JSONtoConsoleCSVALL(inputCSV, title){
    var res = "";
    res+="";
    for(idx in inputCSV){
        if(1==1){
            if(inputCSV[idx]==undefined){
                res+="wrong here";
            }else{
                res+=inputCSV[idx].val;
            }
            if(res.substring(res.length-1)==","){
            }else {
                res+=",";
            }
        }
    }
    res = res.substring(0,res.length-1);

    return res;
}


function debugValue(){

}


function treeToCSV(inputCSV, title, options){

    if(title!=undefined&&title!=[]&&title!=""){
        var res = "";
        res+="";
        for(var i = 1 ; i < title.length ; i++){
            res+=title[i].RootName;
            if(i != title.length -1){
                res+=",";
            }

        }

        return res;
    }

    var res = "";
    res+="";
    for(var i = 1 ; i < inputCSV.length ; i++){

        //OPTION 7
        if(options==undefined){
            options='0';
        }
        //if(options == "7" || options =="17" || options =="37" || options =="57" || options =="137" || options =="157" || options =="357" || options =="1357") {
        if(options.indexOf("7")>=0){

            if (inputCSV[i].output == true) {

                res += inputCSV[i].Text;
                if(i != inputCSV.length -1){
                    res+=",";
                }
            }
        }else{
            res += inputCSV[i].Text;
            if(i != inputCSV.length -1){
                res+=",";
            }
        }
    }

    return res;
}

function treeToHTML(inputCSV, title, options){

    if(title!=undefined&&title!=[]&&title!=""){
        var res = "";
        res+="<tr>";
        //for(idx in title){
        for(var i = 1 ; i < inputCSV.length ; i++){

            if(options==undefined){

                options='0';
            }
            if(options.indexOf("7")>=0){
                if (title[i].output == true) {
                    res += "<td nowrap>";
                    res += title[i].RootName;
                    res += "</td>";
                }
            }else{
                res += "<td nowrap>";
                res += title[i].RootName;
                res += "</td>";
            }
        }
        res+="</tr>";

        return res;
    }

    var res = "";
    res+="<tr>";
    //for(idx in inputCSV){
    for(var i = 1 ; i < inputCSV.length ; i++){
        //OPTION 7
        if(options==undefined){

            options='0';
        }

        if(options.indexOf("7")>=0){
            if(inputCSV[i].output==true){
                res+="<td nowrap>";
                res+=inputCSV[i].Text;
                res+="</td>";
            }
        }else{
            res+="<td nowrap>";
            res+=inputCSV[i].Text;
            res+="</td>";
        }

    }
    res+="</tr>";
    return res;
}

function JSONtoHTML(inputCSV, title){

    if(inputCSV.length!=title.length){
        //console.log("lets see input one is wrong :"+inputCSV.length);
        //console.log("lets see title one is wrong:"+title.length);
        for(indexA in inputCSV){
            //console.log("inputCSV is "+inputCSV[indexA].att);
        }
        for(indexB in title){
            //console.log("title is "+title[indexB].att);
        }
    }
    var res = "";
    res+="<tr>";
    for(idx in inputCSV){

        if(title[idx].output==true){
            res+="<td nowrap>";
            if(inputCSV[idx]==undefined){
                res+="wrong here";
            }else{
                res+=inputCSV[idx].val;
            }

            res+="</td>";
        }
    }
    res+="</tr>";
    return res;
}
function cleanPrefix(prefix){

    for(indexA in prefix){
        //console.log("before clean"+prefix[indexA].indentation+prefix[indexA].line);
    }
    var title = [];

    var startMark = 0;
    var endMark = 0;
    var startLine = 0;
    var endLine = 0;
    var startData = "";
    var part1 = [];
    var part2 = [];
    var res = [];
    //check from backward
    for(var i = prefix.length-1; i >3; i--){
        //console.log("prefix["+i+"] is "+prefix[i].indentation+prefix[i].line);
        if((prefix[i].indentation-prefix[i-1].indentation)<=-1
            && (prefix[i-1].indentation-prefix[i-2].indentation)<=-1){
            endLine = i;
            startMark = prefix[i].indentation;
            //console.log("here is a start mark with indentation =" + startMark);
            break;
        }
    }

    for(var i = endLine; i >3; i--){
        if(prefix[i].indentation==startMark){
            endMark++;
            if(endMark==2){
                startLine=i;
                break;
            }
        }
    }
    if(prefix.indexOf(prefix[startLine])>0){
        //startLine=prefix.indexOf(prefix[startLine]);
    }

    if(startLine<endLine) {
        part1 = prefix.slice(0, startLine);
        part2 = prefix.slice(endLine);
        for (idx in part2){
            part1.push(part2[idx]);
        }

        res = cleanPrefix(part1);
    }else {

        var ele={};
        for(var i = 0 ; i < prefix.length; i++){
            var splitPoint = prefix[i].line.indexOf(":");
            if (splitPoint>-1){
                var att = prefix[i].line.substring(0,splitPoint);
                var val = prefix[i].line.substring(splitPoint);

                if(val !=  ": {" && val !=":["){
                    ele={};
                    ele["indentation"] =prefix[i].indentation;
                    ele["att"]=att;
                    ele["val"]=val;
                    title.push(ele);
                }else {
                    ele={};
                    ele["indentation"] =prefix[i].indentation;
                    ele["att"]=att;
                    ele["val"]=val;
                    title.push(ele);
                }
            }
        }
        res = title;
    }

    for(indexA in res){
        //console.log("after clean"+res[indexA].indentation+res[indexA].line);
    }
    return res;
}

function checkPrefix(datas, prefix){
    //console.log("checkPrefix start");
    for(idx in datas){

        //console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        //console.log("prefix is " + prefix.length);
        for(indexA in prefix){
            //console.log(prefix[indexA].indentation+prefix[indexA].line);
        }
        //console.log("datas[idx].prefi is " + datas[idx].prefix.length);
        //console.log("----------------------------------------------------------------------------------------------------");
        for(indexB in datas[idx].prefix){
            //console.log(datas[idx].prefix[indexB].indentation+datas[idx].prefix[indexB].line);
        }
        //console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        if(datas[idx].prefix.length != prefix.length){
            //console.log("checkPrefix end: index is -1");
            return -1;
        }
        for(var i = 0 ; i < datas[idx].length; i++){
            if(datas[idx].prefix[i]!=prefix[i]){
                //console.log("checkPrefix end: index is -1");
                return -1;
            }
        }
        //console.log("checkPrefix end: index is "+ idx);
        return idx;
    }

    return -1;
}
function findSameTitle(datas, prefix, comparedData, simpledataFlag){
    //console.log("findSameTitle start");
    var title = prefix;

    //console.log("title log start");
    //console.log(title);
    //console.log("title log end");

    var res;
    //console.log("datas length " +datas.length);
    for(var i = 0; i < datas.length; i++){
        //console.log("the "+i+" of datas");
        //log for compare title console.log("it is "+ i + "th data");
        res = true;
        if(datas[i].prefix.length < title.length){
            if(datas.length == 9||datas.length == 8) {
                //console.log("datas["+i+"].prefix.length="+datas[i].prefix.length +" is smaller than current cleaned title.length = "+title.length);
            }
            res = false;
            continue;
        }else{
            for(indexA in datas[i].prefix){

                if(datas.length == 9 || datas.length == 8) {
                    //      console.log(datas[i].prefix[indexA].att);
                }
            }
            //console.log("data[i].prefix.length is "+datas[i].prefix.length);
            //console.log("-----------------")
            //console.log(title.length);
            for(indexB in title){

                if(datas.length == 9 || datas.length == 8) {

                    //console.log(title[indexB].att);
                }
            }
//            console.log("datas["+i+"].prefix.length="+datas[i].prefix.length +" is larger than current cleaned title.length = "+title.length);
        }

        for(idx in title){
            var cleanedValue = cleanValue((title[idx].att));
            if(cleanedValue != (datas[i].prefix[idx].att)){

                if(datas.length == 8||datas.length == 9) {
//console.log(title[idx].att+" and "+datas[i].prefix[idx].att + " are different");
                }
                res = false;
                break;
            }
            else{
                //console.log(title[idx].att+" and "+datas[i].prefix[idx].att + " are same");
                //console.log(res);
            }
        }
        if(res == true){
            //log for compare title console.log("findSameTitle : data "+ i +" has same title");
            resOfCheckData = checkData(datas[i],title.length, comparedData, simpledataFlag);
            //console.log(resOfCheckData);
            if(resOfCheckData>=0){
                //log for compare title console.log("findSameTitle : data "+ i +" has same data type");
                return i;
            }else if (resOfCheckData==-99){
                return -99;
            }
            //return i;
        }
    }
//console.log("findSameTitle end: Title different");
    return -1;
}


function addDataToExist(prefix, originalData, additionalData, simpledataFlag){
    var rowPrefix = prefix.slice(0);
    var dataStack = [];

    var rows = originalData.datablock.slice(0);

    if(simpledataFlag == false){
        for(var i = 0 ; i < additionalData.length; i++) {
            var splitPoint = additionalData[i].line.indexOf(":");
            //var row =rowPrefix.slice(0);
            if (additionalData[i].line.indexOf("{") > -1) {
                dataStack.length = 0;
            }
            if (splitPoint > -1) {
                var att = additionalData[i].line.substring(0, splitPoint);
                var val = additionalData[i].line.substring(splitPoint+1);
                var temp = val.substring(1);
                if (temp.substring(val.length - 1) == ",") {
                    temp = temp.substring(0, val.length - 1);
                }
                ele = {};
                ele["indentation"] = additionalData[i].indentation;
                ele["att"] = cleanValue(att);
                ele["val"] = cleanValue(temp);
                dataStack.push(ele);
            }
            if(additionalData[i].line.indexOf("}")>-1){
                //var temp = rowPrefix.slice(0);
                var temp = [];
                for(idx in rowPrefix){
                    var ele = {};
                    ele={};
                    ele["indentation"] = prefix[idx].indentation;
                    ele["att"]= cleanValue(prefix[idx].att);
                    ele["val"]= cleanValue(prefix[idx].val);
                    temp.push(ele);
                }

                for (idx in dataStack){
                    temp.push(dataStack[idx]);
                }
                //var res = cleanPrefix(temp);
                var row = temp;
                rows.push(row);
            }
        }
    }else {
        for(var i = 0 ; i < additionalData.length; i++){
            var splitPoint = additionalData[i].line.indexOf(":");
            //        var row =rowPrefix.slice(0);

            if(splitPoint>-1){
                var att = additionalData[i].line.substring(0,splitPoint);
                var val = additionalData[i].line.substring(splitPoint+1);
            }
            else{
                var att = additionalData[i].line;
                var val = additionalData[i].line;
            }
            ele={};
            ele["indentation"] ="";
            ele["att"] = cleanValue(att);
            ele["val"] = cleanValue(val);
            rowPrefix.push(ele);
        }
        rows.push(rowPrefix);
    }

    return rows;
}
function checkSimpleData(comparedData){
    var dataStack = [];
    var dataTitle = [];
    var count = 0;
    for(var i = 0 ; i < comparedData.length; i++) {
        if (comparedData[i].line.indexOf("{") > -1) {
            count++;
            dataStack.length = 0;
        }
        var splitPoint = comparedData[i].line.indexOf(":");
        if (splitPoint > -1) {
            if (count == 1) {
                var att = comparedData[i].line.substring(0, splitPoint);
                ele = {};
                ele["indentation"] = "";
                ele["line"] = att;
                dataTitle.push(ele);
            }
        }
    }
    //this is a single data
    if(count == 0){
        for(var i = 0 ; i < comparedData.length; i++) {
            if (comparedData[i].line.indexOf("[") > -1) {
                //console.log("this data is a single data, has no title");
                count++;
                dataStack.length = 0;
            }
            var splitPoint = comparedData[i].line.indexOf(":");
            if (splitPoint > -1) {
                if (count == 1) {
                    var att = comparedData[i].line.substring(0, splitPoint);
                    ele = {};
                    ele["indentation"] = "";
                    ele["line"] = att;
                    dataTitle.push(ele);
                }
            }else{
                if (count == 1) {
                    var att = comparedData[i].line;
                    ele = {};
                    ele["indentation"] = "";
                    ele["line"] = att;
                    dataTitle.push(ele);
                }
            }
        }
        if (count == 1) {
            //console.log("this is a simple data");
            return true;
        }
    }
    return false;
}
function checkData(originalData, prefixLength, comparedData, simpledataFlag){

    var dataStack = [];
    var dataTitle = [];
    var count = 0;
    var originalTitle = originalData.datablock[0]
    if((originalData.simple!=true) && (simpledataFlag==true)){
    //console.log("simple data can not be the same with array datas");
        return -1;
    }else if((originalData.simple==true) && (simpledataFlag==true)){
        for(var i = 0 ; i < comparedData.length; i++) {
            if (comparedData[i].line.indexOf("[") > -1) {
                //console.log("this data is a single data, has no title");
                count++;
                dataStack.length = 0;
            }
            var splitPoint = comparedData[i].line.indexOf(":");
            if (splitPoint > -1) {
                if (count == 1) {
                    var att = comparedData[i].line.substring(0, splitPoint);
                    var val = comparedData[i].line.substring(splitPoint+1);
                    ele = {};
                    ele["indentation"] = comparedData[i].indentation;
                    ele["att"] = att;
                    ele["val"] = val;
                    dataTitle.push(ele);
                }
            }else{
                if (count == 1) {
                    var att = comparedData[i].line;
                    ele = {};
                    ele["indentation"] = "";
                    ele["att"] = att;
                    ele["val"] = att;
                    dataTitle.push(ele);
                }
            }
        }
        if((prefixLength + dataTitle.length)!=originalTitle.length){
            //console.log("checkData end: title length different, return -1");
            return -1;
        }else {
            return dataTitle.length;
        }
    }

    var deepTitle = false;
    for(var i = 0 ; i < comparedData.length; i++) {
        if (comparedData[i].line.indexOf("{") > -1) {
            count++;
            dataStack.length = 0;
        }
        var splitPoint = comparedData[i].line.indexOf(":");
        //console.log("for line " +comparedData[i].line+" the split point is at "+splitPoint);
        //console.log("count is "+count);
        if (splitPoint > -1) {
            if(count == 2 && dataTitle.length==0){
                deepTitle = true;
            }
            if (count == 1 ||(count == 2 && deepTitle==true)) {
                var att = comparedData[i].line.substring(0, splitPoint);
                var val = comparedData[i].line.substring(splitPoint+1);
                ele = {};
                ele["indentation"] = comparedData[i].indentation;
                ele["att"] = att;
                ele["val"] = val;
                dataTitle.push(ele);
            }
        }
    }
    //this is a single data
    if(count == 0){
        for(var i = 0 ; i < comparedData.length; i++) {
            if (comparedData[i].line.indexOf("[") > -1) {
                //console.log("this data is a single data, has no title");
                count++;
                dataStack.length = 0;
            }
            var splitPoint = comparedData[i].line.indexOf(":");
            if (splitPoint > -1) {
                if (count == 1) {
                    var att = comparedData[i].line.substring(0, splitPoint);
                    var val = comparedData[i].line.substring(splitPoint+1);
                    ele = {};
                    ele["indentation"] = comparedData[i].indentation;
                    ele["att"] = att;
                    ele["val"] = val;
                    dataTitle.push(ele);
                }
            }else{
                if (count == 1) {
                    var att = comparedData[i].line;
                    ele = {};
                    ele["indentation"] = "";
                    ele["att"] = att;
                    ele["val"] = att;
                    dataTitle.push(ele);
                }
            }
        }
        if (count == 1) {
            //console.log("checkData end: find same title with data legth = " + dataTitle.length);
            return -99;
        }
    }

    if((prefixLength + dataTitle.length)!=originalTitle.length){
        //console.log(prefixLength +" + "+ dataTitle.length+" != "+originalTitle.length)
        //console.log("checkData end: title length different, return -1");
        return -1;
    }

    //console.log("original title is "+originalTitle);
    for (var i = 0; i < dataTitle.length ; i++){
        if(dataTitle[dataTitle.length-i-1].att!=originalTitle[originalTitle.length-i-1].att){
            //console.log("checkData end: title context different, return -1");
            return -1;
        }
    }
    //console.log("checkData end: find same title with data legth = " + dataTitle.length);
    return dataTitle.length;
}
function writeLog(msg){
    var fs = require('fs');
    var util = require('util');
    var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
    var log_stdout = process.stdout;
    console.log = function(d) { //
        log_file.write(util.format(d) + '\n');
        log_stdout.write(util.format(d) + '\n');
    };

}

function writeAuthFile(data, success, fail) {
    var fs = require('fs');
    fs.writeFile('auth.json', JSON.stringify(data), function(error) {
        if(error) {
            console.log('[write auth]: ' + err);
            if (fail)
                fail(error);
        } else {
            console.log('[write auth]: success');
            if (success)
                success();
        }
    });
}

function writeFile(path, data){

    //console.log("write File " + path);
    //console.log("data " + data);
    var mkdirp = require('mkdirp');

    console.log(mkdirp);
    mkdirp(path, function(err) {

        // path exists unless there was an error

    });

    console.log("path type "+ typeof(path));
    console.log("data type "+ typeof(data));

    fs.writeFileSync(path, data);

}

function outputXML(treatXML,postData, options, log){
    var resultArray = [] ;
    //console.log(postData);
    if(log == true){
        console.log("options "+options);
        console.log("log "+log);
    }

    //console.log(treatXML.length);
    if(log == true) {

        for (var x = 0; x < treatXML[0].values.length; x++) {
            console.log("this is title in output　" + treatXML[0].values[x]);

            for (var y = 0; y < treatXML[0].values[x].length; y++) {

                console.log("this is values　 in output　" + treatXML[0].values[x][y].RootName);
            }
        }
    }


    var req = require('request');

    //var result = "";

    var result =
        '<script type="text/javascript">'+
        'function showButton(id){' +
        '   if(document.getElementById(id).style.display=="block"){' +
        '       document.getElementById(id).style.display="none"' +
        '   } else {' +
        '       document.getElementById(id).style.display="block";' +
        '   }'+
        '}'+
        '</script>';

    var resultArrayToSingleCSV=""

    for (var i = 0 ; i<treatXML.length; i ++){
        result+=("<input type = 'button' onclick='showButton(\"toc"+i+"\")' value = data"+i+">");
        result+=("<div id=\"toc"+i+"\" hidden>");
        result+=("<table style=\"width:100%\" border=1>");

        var titles = treatXML[i]["title"];
        var title = [];
        for(idx in treatXML[i]["title"]){
            title.push(treatXML[i]["title"][idx].RootName);
        }

        var aCSV = "";
        for (var j = 0; j < treatXML[i]["values"].length; j++){

            //output title
            if(j == 0){
                var htmlLine = treeToHTML(treatXML[i]["values"][j],treatXML[i]["title"],options);
                var csvLine = treeToCSV(treatXML[i]["values"][j],treatXML[i]["title"],options);
                result+=(htmlLine);
                console.log(csvLine);
                aCSV+=csvLine;
                aCSV+='\n';
            }



            var htmlLine = treeToHTML(treatXML[i]["values"][j],"",options);
            var csvLine = treeToCSV(treatXML[i]["values"][j],"",options);
            console.log(csvLine);
            result+=(htmlLine);

            aCSV+=csvLine;
            aCSV+='\n';
        }
        resultArray.push(aCSV);
        resultArrayToSingleCSV +=aCSV;
        console.log('\n');
        result+=("</table>");
        result+=("</div>");
        result+=("<br/>");
    }

    var fs    = require('fs');
    var path  = require('path');
    var fileName = postData.substring(postData.lastIndexOf('/')+1,postData.length-4);
    var directory = "/tmp/transformTool/"+fileName;
    var mkdirp = require('mkdirp');

    //writeFile(directory,"")

    mkdirp.sync(directory);

    //additional floder
    console.log("how many files generated "+resultArray.length)
    mkdirp(directory+"/"+ resultArray.length, function(err) {

        // path exists unless there was an error

    });
    for (var i = 0; i < resultArray.length; i ++){

        fs.writeFileSync(directory+"/"+i+".csv", resultArray[i]);
    }

    //output unified csv
    fs.writeFileSync(directory+"/result"+".csv", resultArrayToSingleCSV);


    //output html
    fs.writeFileSync(directory+"/result"+".html", result);

    var date = new Date();

    return resultArray;
}

function realfunction(response,request,postData) {
    var date = new Date();
    console.log(date.toISOString()+": reading file " + postData );
    var test ;
    var treatJS =[];
    var req = require('request');
    var xml = "";
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received data:<br/>");
    var func =
        '<script type="text/javascript">'+
        'function showButton(id){' +
        '   if(document.getElementById(id).style.display=="block"){' +
        '       document.getElementById(id).style.display="none"' +
        '   } else {' +
        '       document.getElementById(id).style.display="block";' +
        '   }'+
        '}'+
        '</script>';

    response.write(func);
    //req(postData).pipe(fs.createWriteStream('/home/wk/result.html'))
    req.get(postData, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            //test = body.toString();
            //toJson = sync(toJson);
            sync(parser, 'toJson');
            var json = parser.toJson(body);


            //this is the handle the tag given by xml2json
            var str = json.replace(/\"\$t\"/g,"\"description\"");

            //console.log(str);
            //console.log("json log");
            var treatXML = treatXMLFile(body);
            treatJS = treatJson(str);

            var result = "";
            var resultArray = [] ;
            var resultArrayToSingleCSV=""


            outputXML(treatXML,postData);

            result+=func;
            for (var i = 0 ; i<treatXML.length; i ++){
                result+=("<input type = 'button' onclick='showButton(\"toc"+i+"\")' value = data"+i+">");
                result+=("<div id=\"toc"+i+"\" hidden>");
                result+=("<table style=\"width:100%\" border=1>");

                var titles = treatXML[i]["title"];
                var title = [];
                for(idx in treatXML[i]["title"]){
                    title.push(treatXML[i]["title"][idx].RootName);
                }

                var aCSV = "";
                for (var j = 0; j < treatXML[i]["values"].length; j++){
                    if(j == 0){
                        var htmlLine = treeToHTML(treatXML[i]["values"][j],treatXML[i]["title"]);
                        result+=(htmlLine);
                        aCSV+=treeToCSV(treatXML[i]["values"][j],treatXML[i]["title"]);;
                        aCSV+='\n';
                    }
                    var htmlLine = treeToHTML(treatXML[i]["values"][j]);
                    var csvLine = treeToCSV(treatXML[i]["values"][j]);
                    console.log(csvLine);
                    result+=(htmlLine);
                    aCSV+=csvLine;
                    aCSV+='\n';
                }
                resultArray.push(aCSV);
                resultArrayToSingleCSV +=aCSV;
                result+=("</table>");
                result+=("</div>");
                result+=("<br/>");
            }


            var fs    = require('fs');
            var path  = require('path');
            var fileName = postData.substring(postData.lastIndexOf('/')+1,postData.length-4);
            //console.log("123456"+fileName);
            var directory = "/tmp/transformTool/"+fileName;
            var mkdirp = require('mkdirp');
            mkdirp(directory, function(err) {

                // path exists unless there was an error

            });

            //additional floder
            mkdirp(directory+"/"+ resultArray.length, function(err) {

                // path exists unless there was an error

            });



            for (var i = 0; i < resultArray.length; i ++){
                //console.log("temp "+ resultArray.length)
                var fs = require('fs');
                fs.writeFile(directory+"/"+i+".csv", resultArray[i], function(err) {

                    if(err) {
                        return console.log(err);
                    }
                    var date = new Date();

                });
            }

            var fs = require('fs');
            fs.writeFile(directory+"/result"+".csv", resultArrayToSingleCSV, function(err) {

                if(err) {
                    return console.log(err);
                }
                var date = new Date();

            });

            var fs = require('fs');
            fs.writeFile("/tmp/result.html", result, function(err) {
                if(err) {
                    return console.log(err);
                }
                var date = new Date();
                console.log(date.toISOString()+": The file was saved!");
            });


        }
    });

    var date = new Date();
    console.log(date.toISOString()+": reading file finished");

    response.end();

    return resultArray;
    var date = new Date();
    console.log(date.toISOString()+": response.end()");


}

function logTime(FirstTime1, LastTime2){


}
exports.start = start;
exports.upload = upload;
exports.show = show;
exports.xmlload = xmlload;
exports.showtraverse = showtraverse;
exports.addNewPage = addNewPage;
exports.realfunction = realfunction;
exports.treatXMLFile =treatXMLFile;
exports.outputXML = outputXML;
exports.logTime = logTime;