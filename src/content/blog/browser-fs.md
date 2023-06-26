---
draft: false
title: "Creating a filesystem in the browser"
description: "In this post I'll show you how I implemented a filesystem in the browser and how you to can do it"
image:
  src: https://images.unsplash.com/photo-1569235186275-626cb53b83ce?auto=format&fit=crop&w=1000&q=80
  alt: Photo of an old file cabinet with a drawer open and full of files
  attribution: Photo by Maksym Kaharlytskyi on Unsplash
publishDate: 2020-06-04
lastEditDate: 2022-06-08
tags: [web, javascript]
---

Recently I have been both creating and maintaining zesterer's programing
language [tao](https://github.com/zesterer/tao) playground that you can check
out at https://tao.jsbarretto.com/. One of the new features that is coming is a
module system, the module system allows better code organization by splitting
your code into virtual units called 🥁 modules. A single file is a module (some
languages can have multiple modules per file) and you can get the public
exports from other modules.

## The problem

Only problem is that the playground only supports one file right now, heck even
that isn't true it's just a single text editor from where the code is directly
extracted. If you look at other languages playgrounds, you might notice that they
normally don't have multiple files support, but I want it so I'll have it.

There's actually a `file and directory entries api` but it's non standard and
only chromium based browsers seems to support it (you can check it here
https://caniuse.com/#feat=filesystem) 😢, so we'll need to roll out our own
solution.

> **Note**: Capucho from the future here, the `caniuse` link that I used is actually
> the wrong one, the correct one is https://caniuse.com/mdn-api_filesystem and this
> one shows that it's supported by most browsers, so if you're planning to do
> something similar to what's described in this article consider using this api
> instead, continue reading if you want to explore a little about `indexedDB`.

## Alternatives

So the filesystem api is out, we need to find another way to store large-ish
amounts of data in the browser and make it accessible from javascript, and our
options are `indexedDB` and ... wait, what do you mean `indexedDB` is our only
option? Well I guess `indexedDB` it is.

## indexedDB

`indexedDB` is as the name says a database that works with unique indexes,
compared with others web apis it's fairly low level but it can quickly and
efficiently handle large amounts data, just remember that it's bound by the
browser eviction criteria so don't store data that you can't risk to lose, use
instead a backend with a real database for that.

## Opening the DB

Now that we know what we'll be using let's start coding. The first step to use
the `indexedDB` api is opening a DB, this is akin to opening a database
connection to a real DB except that you actually create the DB if it doesn't
exist. So first we want to get the `indexedDB` object but it might not be
available in every browser or use a prefix (all major browsers have a
prefix-less object, some older browsers have it exposed with a prefix, the
prefix implementations might not be complete or may not work at all so for the
sake of our mental sanity we'll use only the prefix-less object), so
let's define a quick check to see if `indexedDB` is available.

```javascript
if (!window.indexedDB) return; // 😢 No indexedDB for us
```

Now that we know that it's available, let's open the DB.

```javascript
var db;
var request = indexedDB.open("TestDatabase", 1);
```

The star of the show here is the `open` method it takes a string and an integer
as arguments (we can omit the integer if we don't need versioning), the string
is the database name and the integer is the version of the database (It is an
integer, if you use a float it will be implicitly cast to an integer, rounding
it and causing all sorts of trouble). We also define a variable that we will
use later to store our database connection.

> **NOTE**: The MDN documentation about using `indexedDB` (great resource about
> pratical use of the API, available at https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
> , warns to not define any `var indexedDB` if not inside a function.

All operations on `indexedDB` are asynchronous (not your standard `Promise`
though, it's a `IDBRequest` 🤷‍♂️) and so we need to add two callbacks
to our request, `onsuccess` and `onerror`, `onsuccess` will be called if everything
goes well and contain the database in the object passed as the first argument
to the callback under `.target.result`, `onerror` will be called if there's any
problem, proper error handling won't be covered in this article.

```javascript
// In case something goes boom
request.onerror = function (event) {
  console.log(event); // Do proper error handling kids
};

// In case everything goes 🥳
request.onsuccess = function (event) {
  // Assign to the variable we created earlier it will come in handy later
  db = event.target.result /* event.target.result contains the database */;
};
```

So now we have our database, but that isn't all, we need to add a third
callback to our request, `onupgradeneeded`, this callback is called both when
we first create the DB and when we upgrade (i.e. increase our version number,
downgrading is not allowed and will cause an error) and it's also where we can
define and upgrade our database schema, the database schema consists of stores
and indicies, stores are responsible for holding the data while indicies are
created per store and can be used to speed up queries, in our case we'll only
need to create one store.

```javascript
request.onupgradeneeded = function (event) {
  // `onsuccess` will be called afterwards so we don't need to save
  // the database to the global we defined earlier, nonetheless we will
  // need to call some methods on the database right now so we create a
  // `let` binding to avoid having to type `event.target.result` everytime
  // we need access to it.
  let db = event.target.result;

  // Finally create the store
  var objectStore = db.createObjectStore("files", { keyPath: "path" });

  // You could also create other stores and indicies to those stores
};
```

The important bit here is `createObjectStore`, it takes two arguments a name
and an optional options object with two fields, `keyPath` and `autoIncrement`,
if we use `keyPath` we need to define a index manually for each object (We want
this in our store because we will use the path of the file to index into it),
in contrast `autoIncrement` works like `SERIAL` in sql increasing the key
automatically.

> **Note**: when upgrading, all stores will remain so you only need to create new
> ones or delete existing stores

And thats it for the DB setup, so now let's focus on adding and retrieving data from it.

## Adding files

Right now our filesystem is pretty much useless, after all what good is it a
filesystem if it can't store files? To fix this let's define a new function
`createFile`, this function will be responsible for creating new empty files,
a bit like `touch` in unix systems.

```javascript
function createFile(path) {
  // ...
}
```

Our function will take a fully qualified path from root (I didn't tell you but
we'll cheat by not defining folders) and create a new object in the DB, this
object will contain the path in the filesystem and the data of the file which
will be empty.

```javascript
// We start by creating a transaction object spanning the `files` store
// and having read/write access to it
let filesObjectStore = db
  .transaction("files", "readwrite")
  // Get a reference to our object store
  .objectStore("files");

// Our "file" is just a js object with two keys, one for the path
// and another for the data
let file = {
  // The path will be our index and we will use it for querying later
  path: path,
  // The data is a Blob, it will be initialized empty and with a MIME type of text/plain
  data: new Blob([], { type: "text/plain" }),
};

// Finally add to the file to our store
let add = filesObjectStore.add(file);

// Don't forget everything is asynchronous, so we need to define callbacks
add.onsuccess = function (event) {
  console.log("File added 😎");
};
```

To do any operation on a `indexedDB` we need to create a transaction, to create
one we use the db method `transaction`, it takes an array of strings or a
string as it's first argument, this is the list of object stores our
transaction will span across, the smaller it is, the less stores will be locked
while performing the transaction, allowing for faster transactions, so only
declare the stores that are absolutely needed. Next we define our mode this can
either be `readonly` or `readwrite`, the former can be faster but only the
latter can mutate data, as such doing a `readonly` transaction and mutating
data will cause an error to be signaled.

The call will return a `IDBTransaction` object, we can call the `objectStore`
method on it to get a reference to the object store and proceed to call `add`
with our file to add our file to the store.

Once again all this interface is callback based so it will only be completed when
`onsuccess` is called. But you may notice we omitted the `onerror` callback.

Like most errors in JS, the errors produced in `indexedDB` do what it's called
bubbling, this means that they will go up the error chain until they find a
error handler in this case it is from `add` -> `indexedDB` -> `browser` this
means that having a handler in `indexedDB` is enough to catch the errors without
it reaching the browser, in a real scenario error handling should be done as close
to the source as possible.

Our file structure is very simple, we just have a path that we use as the key to
our file, and the file data that we store as a `Blob`, for our purposes a
string would have been enough as we only store text, but by using `Blob`s it's
also possible to store binary data, as such you can add whatever data you want
later on and even embed other metadata like creation time, not to mention
adding download functionality becomes easier (But that's beyond the scope of this
post).

## Querying files

We can now create files in our virtual filesystems, but we cannot yet retrieve
them, so to fix that we'll implement two functions, one to get a single file by
it's path and another to get all the files present in the filesystem.

### Single file

The first function is going to be called `getFile` and it will take one
argument, the full path to the file we want to retrieve, and it will return
a promise that will resolve to the text stored in the file.

```javascript
function getFile(path) {
  return new Promise((resolve, _) => {
    // We create a transaction that will work on our files object store
    let filesObjectStore = db
      // We won't write to the store so we can use readonly
      .transaction("files", "readonly")
      // Get a reference to our object store
      .objectStore("files");

    // Queue the operation to get the file on the store
    let get = filesObjectStore.get(path);

    // Don't forget everything is asynchronous, so we need to register
    // a callback for when the operation finishes
    get.onsuccess = function (event) {
      // To actually read the file we use the FileReader interface
      const reader = new FileReader();

      // FileReader is asynchronous, as such we need to listen for the `loadend`
      // event that will be fired when it finishes loading and parsing the `Blob`
      reader.addEventListener("loadend", (e) => {
        const text = e.srcElement.result;
        // Signal that the promise is finished and pass the parsed text
        resolve(text);
      });

      // Read our blob of data as a string
      reader.readAsText(event.target.result.data);
    };
  });
}
```

The first thing to note, is the fact that all the logic is wrapped in a unnamed
function that's passed to the `Promise` constructor, this function is passed
two other functions as it's inputs, the first when called resolves the
`Promise` and the second signals an error to the consumers of the `Promise`.

This allows us to adapt the callback style of the `indexedDB` to the more modern
`Promise` interface allowing us to `await` on it.

Inside the unnamed function, we start by creating our transaction and getting
a reference to the store like in `createFile`, but this time we create the
transaction as `readonly` since we don't need to mutate the store.

Then we call `get` on the store with the path of our file, as always we need to
register the `onsuccess` callback, the callback will have our file object in the
first argument under `.target.result`.

Since we stored the data as `Blob` but want to return a string we need to use
the `FileReader` api to convert from a blob to a string to do so we use the
`readAsText` method, the `FileReader` api signals completion with events, in
this case we listen to the `loadend` event that will be fired when the
conversion finishes. The callback to this event will contain the text as a
string in the first argument under `.srcElement.result`

Finally, we call the `resolve` method, provided by the `Promise` function, with
the text we just decoded to signal the consumers that it's finished.

### All files

Next we want to define a function to get all the files currently stored in our
virtual filesystem, to do so we'll define the `getAllFiles` function.

```javascript
function getAllFiles() {
  return new Promise((resolve, _) => {
    // We create a transaction that will work on our files object store
    let filesObjectStore = db
      // We won't write to the store so we can use readonly
      .transaction("files", "readonly")
      // Get a reference to our object store
      .objectStore("files");
    // Queue the operation to get all the files in the store
    let getAll = filesObjectStore.getAll();
    // Don't forget everything is asynchronous, so we need to register
    // a callback for when the operation finishes
    getAll.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}
```

The code is very similar to `getFile`, only instead of calling `get` with the
path to the file, we just call `getAll`, and we don't do any processing of the
result.

## Updating files

We almost have a working filesystem we are just missing a way to update the
files, since empty files aren't a whole lot useful, let's introduce the
`updateFile` function to do so.

```javascript
function updateFile(path, text) {
  // We create a transaction that will work on our files object store
  let filesObjectStore = db
    // We will write to the store so we must use readwrite
    .transaction("files", "readwrite")
    // Get a reference to our object store
    .objectStore("files");
  // To update our file we define one with the same path but with the new data
  let file = {
    path: path,
    // Our new data, text is wrapped in brackets because all Blobs
    // need to have it's part be a sequence
    data: new Blob([text], { type: "text/plain" }),
  };
  // Finally put the updated file on the store
  let put = filesObjectStore.put(file);
  // Don't forget everything is asynchronous, so we need to register
  // a callback for when the operation finishes
  put.onsuccess = function (event) {
    console.log("File updated 😎");
  };
}
```

The code is almost identical to that of creating a file, except that this time
we put some data in the file and use `put` instead of `add`, this will
overwrite the file with the new data (if we had used `add` we would get an
error about the key already existing).

## Deleting files

We can now do everything that was required by the project, we can create, read and
update files, but as a bonus let's also add a way to delete the files, so for the
last time lets define a new function, `deleteFile`.

```javascript
function deleteFile(path) {
  // We create a transaction that will work on our files object store
  let filesObjectStore = db
    // We will write to the store so we must use readwrite
    .transaction("files", "readwrite")
    // Get a reference to our object store
    .objectStore("files");
  // Delete the file from the store
  let delete = filesObjectStore.delete(path);
  // Don't forget everything is asynchronous, so we need to register
  // a callback for when the operation finishes
  delete.onsuccess = function(event) {
    console.log("File deleted 😎");
  };
}
```

The code is very simple, we create a `readwrite` transaction to the files store, and
call `delete` on the object store passing the path of the file, and that's it.

## Fin

That was one hell of a ride, but now we have a virtual file system running in
the browser (it isn't really a file system but serves a similar purpose).

There's no error reporting so things like path collisions won't be handled, and
instead will throw errors to the console, but it should be enough to get you
started, if you want to learn more about `indexedDB` then take a look at the
[mdn docs](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

See you next time.
