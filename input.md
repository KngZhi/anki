we have to #procure the data that we’re going to be working with.
it will be able to import documents in bulk, like the #corpus of Project Gutenberg documents produced in the preceding chapter
The #upshot of this approach is that neither the bulk file nor the response from Elasticsearch needs to be wholly resident in the Node.js process’s memory
A Promise is a special kind of object that presents a #unified way of dealing with synchronous and asynchronous code flows
The Express framework helps with these and #myriad other tasks.
It’s not that some other code will #preempt your async function, but rather that you choose to unblock the event loop to await a Promise.
The #moral of the story is always provide a try/catch block when using an async function as an Express route handler
Note that Express routes treat forward slashes as #delimiters
The sending and receiving lines may be #interleaved
