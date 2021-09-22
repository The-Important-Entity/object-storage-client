const path = require("path");
var request = require('request');
const axios = require('axios');
var fs = require('fs');
const FormData = require('form-data');


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
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + "/" + namespace,
                method: "GET",
                headers: {
                    "authorization": this.api_key
                }
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });

        }.bind(this));
    }

    async putNamespace(namespace) {
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + "/" + namespace,
                method: "PUT",
                headers: {
                    "authorization": this.api_key
                }
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });

        }.bind(this));
    }

    async deleteNamespace(namespace) {
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + "/" + namespace,
                method: "DELETE",
                headers: {
                    "authorization": this.api_key
                }
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });
        }.bind(this));
    }

    async getObject(namespace, file_name, download_path) {

        return new Promise(async function (resolve, reject) {


            axios({
                url: this.url + "/" + namespace + "/" + file_name,
                method: "GET",
                headers: {
                    "authorization": this.api_key
                },
                responseType: 'stream'
            }).then(function(response){
                var file = fs.createWriteStream(path.join(download_path, file_name));

                // close() is async, call cb after close completes
                file.on('finish', function(err, res ,body){
                    file.close();
                    resolve("Success!");
                });
                
                response.data.pipe(file);
            }).catch(function(err) {
                const statusCode = err.response.status;
                if (statusCode == 400) {
                    resolve("Error: Unauthorized!");
                }
                else if (statusCode == 401) {
                    resolve("Error: object is write locked");
                }
                else if (statusCode == 402) {
                    resolve("Error: namespace doesn't exist");
                }
                else if (statusCode == 403) {
                    resolve("Error: object doesn't exist");
                }
                else {
                    resolve("Error: unknown error");
                }
            });
        }.bind(this));
    }

    putObject(namespace, file_name, file_path) {

        const formData = new FormData();
        formData.append('file', fs.createReadStream(file_path));
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + "/" + namespace + "/" + file_name,
                method: "PUT",
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                data: formData,
                headers: {
                    "content-type": formData.getHeaders()['content-type'],
                    "authorization": this.api_key
                }
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data);
            });
        }.bind(this));
    }

    deleteObject(namespace, file_name) {
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + "/" + namespace + "/" + file_name,
                method: "DELETE",
                headers: {
                    "authorization": this.api_key
                }
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });
        }.bind(this))
    }
}

module.exports = ObjectStorageClient;
