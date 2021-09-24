const path = require("path");
var request = require('request');
const axios = require('axios');
var fs = require('fs');
const FormData = require('form-data');
const crypto = require("crypto");

class ObjectStorageClient {
    constructor(config) {
        this.app_id = config.APP_ID
        this.secret_key = config.SECRET_KEY;
        this.url = config.URL;
        this.test_filename = new RegExp('^[A-Za-z0-9]+[A-Za-z0-9.-]+[A-Za-z0-9]+$');
        this.test_url = new RegExp('^(http|https):\/\/[0-9a-z.]*(:[0-9]*){0,1}$');

        if (!this.test_url.test(this.url)){
            throw("Error: bad url format. " + this.url);
        }
    }

    gen_nonce() {
        var result = ''
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < 20; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    gen_sha256_hmac(method, uri, date, nonce) {
        const str = method + '\n' + uri + '\n' + date + '\n' + nonce + '\n' + this.app_id
        return this.app_id + ":" + crypto.createHmac('sha256', this.secret_key).update(str).digest('hex');
    }

    async getNamespaceFiles(namespace) {
        const date = Date.now().toString();
        const nonce = this.gen_nonce();
        const method = "GET";
        const uri = "/" + namespace;

        const auth_string = this.gen_sha256_hmac(method, uri, date, nonce);
        const req_headers = {
            "authorization": auth_string,
            "date": date,
            "nonce": nonce
        }
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + uri,
                method: "GET",
                headers: req_headers
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });

        }.bind(this));
    }

    async putNamespace(namespace) {
        const date = Date.now().toString();
        const nonce = this.gen_nonce();
        const method = "PUT";
        const uri = "/" + namespace;

        const auth_string = this.gen_sha256_hmac(method, uri, date, nonce);
        const req_headers = {
            "authorization": auth_string,
            "date": date,
            "nonce": nonce
        }
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + uri,
                method: "PUT",
                headers: req_headers
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });

        }.bind(this));
    }

    async deleteNamespace(namespace) {
        const date = Date.now().toString();
        const nonce = this.gen_nonce();
        const method = "DELETE";
        const uri = "/" + namespace;

        const auth_string = this.gen_sha256_hmac(method, uri, date, nonce);
        const req_headers = {
            "authorization": auth_string,
            "date": date,
            "nonce": nonce
        }
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + uri,
                method: "DELETE",
                headers: req_headers
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });
        }.bind(this));
    }

    async getObject(namespace, file_name, download_path) {
        const date = Date.now().toString();
        const nonce = this.gen_nonce();
        const method = "GET";
        const uri = "/" + namespace + "/" + file_name;

        const auth_string = this.gen_sha256_hmac(method, uri, date, nonce);
        const req_headers = {
            "authorization": auth_string,
            "date": date,
            "nonce": nonce
        }
        return new Promise(async function (resolve, reject) {


            axios({
                url: this.url + uri,
                method: "GET",
                headers: req_headers,
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

        const date = Date.now().toString();
        const nonce = this.gen_nonce();
        const method = "PUT";
        const uri = "/" + namespace + "/" + file_name;

        const auth_string = this.gen_sha256_hmac(method, uri, date, nonce);
        const req_headers = {
            "authorization": auth_string,
            "date": date,
            "nonce": nonce,
            "content-type": formData.getHeaders()['content-type']
        }


        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + uri,
                method: "PUT",
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                data: formData,
                headers: req_headers
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data);
            });
        }.bind(this));
    }

    deleteObject(namespace, file_name) {
        const date = Date.now().toString();
        const nonce = this.gen_nonce();
        const method = "DELETE";
        const uri = "/" + namespace + "/" + file_name;

        const auth_string = this.gen_sha256_hmac(method, uri, date, nonce);
        const req_headers = {
            "authorization": auth_string,
            "date": date,
            "nonce": nonce
        }
        return new Promise(function (resolve, reject) {
            axios({
                url: this.url + uri,
                method: "DELETE",
                headers: req_headers
            }).then(function(response) {
                resolve(response.data);
            }).catch(function(err) {
                resolve(err.response.data)
            });
        }.bind(this))
    }
}

module.exports = ObjectStorageClient;
