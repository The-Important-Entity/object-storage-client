const ObjectStorageClient = require("..");

const client = new ObjectStorageClient({
    "API_KEY": "123",
    "URL": "http://localhost:4000"
});


const run_test = async function(){
    var response = await client.put("NewProject.mp4", "C:\\Users\\Joe\\Downloads\\NewProject.mp4");
    console.log(response);
    //await client.get("gitignore", ".");
    // response = await client.delete("NewProject.mp4");
    // console.log(response);
}
run_test();