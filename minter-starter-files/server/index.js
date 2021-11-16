const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

require('dotenv').config();
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;

//imports needed for this function
const axios = require('axios');
const { execSync } = require("child_process");


const fs = require('fs');
const FormData = require('form-data');

const pinFileToIPFS = (fname) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append('file', fs.createReadStream(fname));

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(function (response) {
          return {
            success: true,
            pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
          };
        })
        .catch(function (error) {
           console.log("ERR");
        });
};

const pinJSONToIPFS = (JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
          console.log(response);
           return {
               success: true,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
           
    });
};


let goxx = async () => {


  execSync('/home/jim/tmp/o.sh');
  

  let pinataImage = await pinFileToIPFS("/tmp/o.jpg");
  

  //make metadata
  const metadata = new Object();
  metadata.name = "name";
  metadata.image = pinataImage.pinataUrl;
  metadata.description = "desc";
  metadata.attributes = [ {"trait_type" : "eyes", "value":"wide"}, 
                          {"value" : "Ocean Angry Snake"}, 
                          {"value" : "Predawn Scratch" }]
  
  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);

  console.log("pinataReponse");
  console.log(pinataResponse);
  return pinataResponse.pinataUrl;
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';

  goxx().then( (s) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ uri: s }));
  });
});
app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);