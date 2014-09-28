/*globals require, process*/

var _ = require('lodash');
var fs = require('fs');
var readline = require('readline');

var inputFolder = './input';
var outputFoler = './output';

var fileNames = [
    'resales_2014_aug_LA',
    'resales_2014_aug_Orange',
    'resales_2014_aug_Riverside',
    'resales_2014_aug_San_Bernadino'];

var sum = function (numbers) {
    return _.reduce(numbers, function (memo, num) {
        return memo + num;
    }, 0);
};

var average = function(numbers) {
    return sum(numbers) / numbers.length;
}

var fieldMethods = [sum, average, average, sum, average, average, average];

var fields = ['city', 'sfh sales', 'median price', 'price change', 'condo sales', 'condo median',
    'condo change', 'sfr median price per sft'];

function processFile(fileName) {
    var rd = readline.createInterface({
        input: fs.createReadStream(inputFolder + '/' + fileName + '.txt'),
        output: process.stdout,
        terminal: false
    });

    var stream = fs.createWriteStream(outputFoler + '/' + fileName + '.txt');

    stream.once('open', function () {
        var rawData = {};
        var fieldNames = fields.join('\t');
        stream.write(fieldNames + '\n');
        console.log(fieldNames);
        rd.on('line', function (line) {
            var input = line.replace(/[%\$,]+/gi, '').split('\t');
            var city = input.splice(0, 1);
            var zip = input.splice(0, 1);
            var numData = _.map(input, function (string) {
                return parseInt(string);
            });
            rawData[city] = rawData[city] || [];
            rawData[city].push(numData);
        });

        rd.on('close', function () {
            var cityData = {};
            _.each(_.keys(rawData), function (city) {
                var transposed = _.zip(rawData[city]);
                var fieldNum = -1;
                cityData[city] = _.map(transposed, function (fieldArray) {
                    fieldArray = _.reject(fieldArray, function (value) {
                        return isNaN(value);
                    });
                    fieldNum += 1;
                    return fieldMethods[fieldNum](fieldArray);
                });
            });

            _.each(_.keys(cityData), function (city) {
                var prettier = _.map(cityData[city], function (field) {
                    return isNaN(field) ? 'n/a' : Math.round(field);
                });
                var cityAverages = prettier.join('\t');
                var output = city + '\t' + cityAverages;
                stream.write(output + '\n');
                console.log(output);
            });
            stream.end();
        });
    });
}

_.each(fileNames, function(fileName) {
    processFile(fileName);

});

