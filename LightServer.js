var express = require('express');
var app = express();
var fs = require("fs");
var execKC = require('child_process').exec;

var optionsKC = {cwd:"/home/pi/wiringPi/examples/lights",shell: "true"}

var errorMessage = {"Error":{"Message":"ID is not known"}};
var errorMessage1 = {"Error":{"Message":"status is not a true of false"}};

function lightCommand(lightStatus)
{
    var correctStatus = lightStatus == "true" || lightStatus == "false";
    if(correctStatus)
    {
        var command = "./light ";
        if(lightStatus == "true")
        {
            command = command + "on"
        }
        else if(lightStatus == "false")
        {
            command = command + "off"
        }
        console.log(command);
        execKC(command,optionsKC,function(err,stdout,stderr)
        {
            if(err)
            {
                console.log(err);
            }
        });
    }
}

app.get('/getLight/:id', function (req,res){

	var id=req.params.id;

    fs.readFile(__dirname + "/" +"lightData.json", 'utf8', function(err,data)
    {
        data = JSON.parse(data);

        var found = false;

        for(var i =0; i<data["lights"].length; i++)
        {
            if(data["lights"][i]["id"] == id)
            {
                data = data["lights"][i];
                found = true;
                break;
            }
        }

        if(!found)
        {
            data = errorMessage;
        }

        console.log(data);
        data = JSON.stringify(data);
        res.end(data);
    })
})

app.get('/updateLight/:id/:newStatus', function (req,res){
    var id = req.params.id;
    var newStatus = req.params.newStatus;

    console.log(id + " " + newStatus);

    console.log("before read file");
    fs.readFile( __dirname + "/" + "lightData.json", 'utf8', function (err, data){
        if(err)
        {
            console.log(err);
        }
        data = JSON.parse(data);

        var found = false,correctStatus;

        var index = -1;

        for(var i =0; i<data["lights"].length; i++)
        {
            if(data["lights"][i]["id"] == id)
            {
                found = true;
                index = i;
                break;
            }
        }

        correctStatus = newStatus == "true" || newStatus == "false";

        if(found && !isNaN(id) && correctStatus)
        {
            console.log("update light: "+id);
            data["lights"][index]["status"] = newStatus;
            lightCommand(newStatus);
            console.log("upated light: "+id)

            data = JSON.stringify(data);
            fs.writeFile(__dirname + "/" + "lightData.json", data, function(err){
                if(err)
                {
                    console.log(err);
                }
            });
        }
        else
        {
            if(!found)
            {
                data = errorMessage;
            }
            else if(!found)
            {
                data = errorMessage1
            }
            data = JSON.stringify(data);
        }
        console.log(data);
        res.end(data);
    });
})




var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
