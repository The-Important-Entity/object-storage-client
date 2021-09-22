const path = require("path");
var request = require('request');
var fs = require('fs');
var json = require("json");

class ObjectStorageClient {
    constructor(config) {
        this.api_key = config.API_KEY;
        this.url = config.URL;
        this.test_filename = new RegExp('^[A-Za-z0-9]+[A-Za-z0-9.-]+[A-Za-z0-9]+$');
        this.test_url = new RegExp('^(http|https):\/\/[0-0a-z.]*(:[0-9]*){0,1}$');
        if (!this.test_url.test(this.url)){
            throw("Error: bad url format. " + this.url);
        }
    }

    async getNamespaceFiles(namespace) {
        const headers = {
            "authorization": this.api_key
        };
        const options = {
            "url": this.url + "/" + namespace,
            "headers": headers
        }
        return new Promise(function (resolve, reject) {
            try {
                request.get(options, function(err, res, body){
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (res.statusCode == 200){
                        resolve(JSON.parse(body));
                    }
                    else {
                        resolve(body);
                    }
                });
            }
            catch {

            }
        }.bind(this));
    }

    async putNamespace(namespace) {
        const headers = {
            "authorization": this.api_key
        };
        const options = {
            "url": this.url + "/" + namespace,
            "headers": headers
        }
        return new Promise(function (resolve, reject) {
            request.put(options, function(err, res, body){
                resolve(body);
                reject(err);
            });
        }.bind(this));
    }

    async deleteNamespace(namespace) {
        const headers = {
            "authorization": this.api_key
        };
        const options = {
            "url": this.url + "/" + namespace,
            "headers": headers
        }
        return new Promise(function (resolve, reject) {
            request.delete(options, function(err, res, body){
                resolve(body);
            });
        }.bind(this));
    }

    async getObject(namespace, file_name, download_path) {
        const headers = {
            "authorization": this.api_key
        };
        const options = {
            "url": this.url + "/" + namespace + "/" + file_name,
            "headers": headers
        }
        return new Promise(function (resolve, reject) {
            const r = request.get(options, function(err, res, body){
                if (res.statusCode == 400) {
                    resolve(body);
                    return;
                }
            });
    
            
    
            // verify response code
            r.on('response', (response) => {
                if (response.statusCode < 400) {
                    var file = fs.createWriteStream(path.join(download_path, file_name));
        
                    // close() is async, call cb after close completes
                    file.on('finish', function(err, res ,body){
                        file.close();
                        resolve("Success!");
                    });
                    
                    r.pipe(file);
                }
            });
        }.bind(this));
    }

    putObject(namespace, file_name, file_path) {


        const stream = fs.createReadStream(file_path);
        const options = {
            headers: {
                "Content-Type": "multipart/form-data",
                "authorization": this.api_key
            },
            formData : {
                "file" : stream
            }
        };

        return new Promise(function (resolve, reject) {
            var r = request.put(this.url + "/" + namespace + "/" + file_name, options, function(err, res, body){
                if (err){
                    resolve(err);
                }
                else {
                    resolve(body);
                }
            });
        }.bind(this));
    }

    deleteObject(namespace, file_name) {
        const headers = {
            "authorization": this.api_key
        };
        const options = {
            "url": this.url + "/" + namespace + "/" + file_name,
            "headers": headers
        }
        return new Promise(function (resolve, reject) {
            request.delete(options, function(err, res, body){
                resolve(body);
            });
        }.bind(this))
    }
}

module.exports = ObjectStorageClient;
