# XML2CSV

#XML2CSV transforms XML to CSV with adjustable detail level

#INSTALL
* Download this repository 
```
git clone https://github.com/wk0206/xml2csv.git
```
* Enter the folder.
* Install xml2csv by command
```
npm install -g"
```

#USE this tool
After install the tool, it will run as a command as system commnd
```
root@Debian:/home/xml2csv# xml2csv 

  Usage: xml2csv [options] <keywords>

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -a, --argument <argument>  switch
    -r, --re <re>              regular expression
    -l, --log                  output log
```
## Argument
A sequence of number ,include 1,3,5 with different meaning.
Example XML: 
https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml


* 1 : With attribute
* 3 : Extract single branch as descrition
* 5 : Combine similar datas

##Example
Option 1
* https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml
```
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml -a 35 >/home/usr/Documents/log.txt
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml -a 135 >/home/usr/Documents/log.txt
```
Option 3
* https://raw.githubusercontent.com/wk0206/xml2csv/master/Final-budget-2014-EN/c!SEC1_E!en!0.xml
```
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/Final-budget-2014-EN/c!SEC1_E!en!0.xml -a 15 >/home/usr/Documents/log.txt
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/Final-budget-2014-EN/c!SEC1_E!en!0.xml -a 135 >/home/usr/Documents/log.txt
```
Option 5
* https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml
```
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml -a 13 >/home/usr/Documents/log.txt
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml -a 135 >/home/usr/Documents/log.txt
```

## Regular Expression
Exmaple XML:
https://raw.githubusercontent.com/wk0206/xml2csv/master/Final-budget-2014-EN/c!SEC1_E!en!0.xml

Grab specified data structure
```xml
<amount catpol="5.2.17" comp="true" year="n"><figure>p.m.</figure></amount>
<amount catpol="5.2.17" year="nm1"><figure>12 912 765</figure></amount>
<amount year="nm2"><figure>0,—</figure></amount>
```
With regular expression like below

```js
<amount *(catpol="[^\"]*")? *(comp=\"[^\"]*\")? *year="[^\"]*\"><figure>[^\"]*<\/figure><\/amount>
```
Whole command
```
xml2csv /home/xml2csv/Final-budget-2014-EN/c\!SEC1_E\!en\!0.xml -a 135  -r "<amount *(catpol=\"[^\\\"]*\")? *(comp=\"[^\\\"]*\")? *year=\"[^\\\"]*\"><figure>[^\\\"]*</figure></amount>"
```

## Debug
Use option "-l"
```
xml2csv https://raw.githubusercontent.com/wk0206/xml2csv/master/TestData/book.xml -a 13 -l
```
