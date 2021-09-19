const path = require("path");
var request = require('request');
var fs = require('fs');

class ObjectStorageClient {
    constructor(config) {
        this.api_key = config.API_KEY;
        this.url = config.URL;
        this.test_filename = new RegExp('^[A-Za-z0-9]+[A-Za-z0-9.-]+[A-Za-z0-9]+$');
    }

    async get(file_name, download_path) {
        const r = request.get(this.url + "/" + file_name);

        if (!this.test_filename.test(file_name)) {
            return "Error: bad file name";
        }

        // verify response code
        r.on('response', (response) => {
            if (response.statusCode !== 200) {
                console.log("Error: get file");
                return;
            }
            var file = fs.createWriteStream(path.join(download_path, file_name));

            // close() is async, call cb after close completes
            file.on('finish', function(err, res ,body){
                file.close();
            });
            r.pipe(file);
        });
    }

    put(file_name, file_path) {
        if (!this.test_filename.test(file_name)) {
            return "Error: bad file name";
        }

        const stream = fs.createReadStream(file_path);
        const options = {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            formData : {
                "file" : stream
            }
        };

        return new Promise(function (resolve, reject) {
            var r = request.put(this.url + "/" + file_name, options, function(err, res, body){
                resolve(body);
            });
        }.bind(this));
    }

    async delete(file_name) {
        if (!this.test_filename.test(file_name)) {
            return "Error: bad file name";
        }
        
        const response = await request.delete(this.url + "/" + file_name);
        return response;
    }
}

module.exports = ObjectStorageClient;
