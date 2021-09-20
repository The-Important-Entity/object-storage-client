const ObjectStorageClient = require("..");

const client = new ObjectStorageClient({
    "API_KEY": "123",
    "URL": "http://localhost:4000"
});

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

const run_lock_test = async function(file_path){
    var iteration = 0;
    while(true) {
        responses = new Array(20);
        for (var i = 0; i < 20; i++) {
            responses[i] = client.put("test.txt", file_path);
        }
        for (var i = 0; i < 20; i++) {
            const thisResponse = await responses[i];
            if (thisResponse == "File upload Successful!"){
                console.log("Iteration " + iteration.toString() + ": " + thisResponse);
            }
        }
        iteration++;
        await sleep(10000);
        await client.delete("test.txt")
    }
}
var counter = 1;
var passed = 0;
var failed = 0;

const assert = function(test_data, expected) {
    if (test_data === expected) {
        passed++;
        console.log("Test " + counter.toString() + ": Passed");
    }
    else {
        failed++;
        console.log("-------------");
        console.log("Test " + counter.toString() + ": Failed");
        console.log("-------------");
    }
    counter++;
}

const getNamespaceFiles = async function(){
    return await client.getNamespaceFiles("joe-namespace");
}

const putNamespace = async function(){
    return await client.putNamespace("joe-namespace");
}

const deleteNamespace = async function(){
    return await client.deleteNamespace("joe-namespace");
}

const getFile = async function(download_path){
    return await client.getObject("joe-namespace", "test.txt", download_path);
}

const putFile = async function(file_path){
    return client.putObject("joe-namespace", "test.txt", file_path);
}

const deleteFile = async function(){
    return await client.deleteObject("joe-namespace", "test.txt");
}

const run_tests = async function(file_path, download_path) {
    await deleteFile();
    await deleteNamespace();

    assert(await getNamespaceFiles(), "Error: namespace doesn't exist");
    assert(await deleteNamespace(), "Error: namespace doesn't exist");
    assert(await putFile(file_path), "Error: namespace doesn't exist");
    assert(await getFile(download_path), "Error: namespace doesn't exist");
    assert(await deleteFile(), "Error: namespace doesn't exist");

    assert(await putNamespace(), "Success!");
    assert(await putNamespace(), "Error: namespace already exists");
    assert((await getNamespaceFiles()).length, 0);

    assert(await getFile(download_path), "Error: object doesn't exist");
    assert(await deleteFile(), "Error: object doesn't exist");

    assert(await putFile(file_path), "Success!");
    assert(await getFile(download_path), "Success!");
    assert((await getNamespaceFiles()).length, 1);
    assert((await getNamespaceFiles())[0], "test.txt");

    assert(await deleteNamespace(), "Error: namespace is not empty");
    assert(await deleteFile(), "Success!");
    assert(await getFile(download_path), "Error: object doesn't exist");
    assert(await deleteNamespace(), "Success!");
    assert(await getFile(download_path), "Error: namespace doesn't exist");


    console.log();
    console.log("Tests Passed: " + passed.toString());
    console.log("Tests Failed: " + failed.toString());

}
run_tests("/home/jscalera/test.txt", "/home/jscalera");