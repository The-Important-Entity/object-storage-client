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

const run_lock_test = async function(){
    var iteration = 0;
    while(true) {
        responses = new Array(20);
        for (var i = 0; i < 20; i++) {
            responses[i] = client.put("NewProject.mp4", "C:\\Users\\Joe\\Downloads\\NewProject.mp4");
        }
        for (var i = 0; i < 20; i++) {
            const thisResponse = await responses[i];
            if (thisResponse == "File upload Successful!"){
                console.log("Iteration " + iteration.toString() + ": " + thisResponse);
            }
        }
        iteration++;
        await sleep(10000);
        await client.delete("NewProject.mp4")
    }
}

const single_put_test = async function(){
    console.log(await client.put("NewProject.mp4", "C:\\Users\\Joe\\Downloads\\NewProject.mp4"));
}
//run_lock_test();
single_put_test();