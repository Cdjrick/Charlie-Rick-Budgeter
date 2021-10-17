// Create variable to hold db connection
let db

// Establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1)

// This event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
    // Save a reference to the database 
    const db = event.target.result
    // Create an object store (table) called `transactions`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_purchase', { autoIncrement: true })
}

// upon a successful 
request.onsuccess = function (event) {
    /* When db is successfully created with its object store (from onupgradedneeded event above) or simply established a 
       connection, save reference to db in global variable */
    db = event.target.result;

    // Check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // We haven't created this yet, but we will soon, so let's comment it out for now
        uploadPurchase()
    }
}

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
}

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // Open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_purchase'], 'readwrite')

    // Access the object store for `transactions`
    const purchaseObjectStore = transaction.objectStore('new_purchase')

    // Add record to your store with add method
    purchaseObjectStore.add(record)
}

function uploadPurchase() {
    // Open a transaction on your db
    const transaction = db.transaction(['new_purchase'], 'readwrite');

    // Access your object store
    const purchaseObjectStore = transaction.objectStore('new_purchase');

    // Get all records from store and set to a variable
    const getAll = purchaseObjectStore.getAll();

    // Upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // If there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // Open one more transaction
                    const transaction = db.transaction(['new_purchase'], 'readwrite');
                    // Access the new_purchase object store
                    const purchaseObjectStore = transaction.objectStore('new_purchase');
                    // Clear all items in your store
                    purchaseObjectStore.clear();

                    alert('All saved purchases has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

window.addEventListener('online', uploadPurchase);