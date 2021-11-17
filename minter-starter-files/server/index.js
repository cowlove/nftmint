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


let goxx = async (cost, boost, id) => {
  execSync('/tmp/o.sh');
  let pinataImage = await pinFileToIPFS("/tmp/o.jpg");
  

  //make metadata
  const metadata = new Object();
  metadata.name = "Jim NFT " + parseInt(id);
  metadata.image = pinataImage.pinataUrl;
  metadata.description = "Description of art item Jim NFT " + parseInt(id);
  metadata.attributes = [ 
                          {"trait_type" : "Mint Cost", "value": "" + Math.round(cost)}, 
                          {"trait_type" : "Serial Number", "value": "" + parseInt(id)}, 
                          {"trait_type" : "Rarity Boost", "value": "" + parseInt(boost)}, 
                          {"value" : "Ocean Angry Snake"}, 
                          {"value" : "Predawn Scratch" }]
  
  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  return { token: pinataResponse.pinataUrl, image: pinataImage.pinataUrl};
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);

app.get('/api/greeting', (req, res) => {
  const cost = req.query.cost || "0.1";
  const boost = req.query.boost || "0.0";
  const id = req.query.number  || "1";

  goxx(cost, boost, id).then( (m) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "token" : m.token, "image": m.image  }));
  });
});
app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
