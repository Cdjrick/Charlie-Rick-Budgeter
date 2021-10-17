// Create variable to hold db connection
let db

// Establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1)

// This event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
    // Save a reference to the database 
    const db = event.target.result
    // Create an object store (table) called `transactions`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('transaction', { autoIncrement: true })
}

// upon a successful 
request.onsuccess = function (event) {
    /* When db is successfully created with its object store (from onupgradedneeded event above) or simply established a 
       connection, save reference to db in global variable */
    db = event.target.result;

    // Check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // We haven't created this yet, but we will soon, so let's comment it out for now
        // uploadTransaction()
    }
}

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
}

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // Open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['transactions'], 'readwrite')

    // Access the object store for `transactions`
    const transactionsObjectStore = transaction.objectStore('transactions')

    // Add record to your store with add method
    transactionsObjectStore.add(record)
}

