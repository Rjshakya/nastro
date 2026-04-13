# Architecture

## flow

- first we will focus on page
- our goal is to get all the blocks of page no matter how much nested they are;
- even the deepest page block will be included in the result

### how we gonna do this

- create a fn processPage its type signature is ProcessPage defined in types.ts
- this will take a pageId
- in this first we will getPage ; this will give the metadata or properties stuff of page;
- then we call the fn getBlocks

#### getBlocks

- in this first we fetch the fist layer of blocks of page
- then getRecurBlockAndProcess - type <A , B>(a:A) => B
- this will check if the block has children then call it again;
- and pre recursion we will process each block ; to our custom need
- and post recursion we return {... , children:resultFromRecursiveCall}
- we will pass this for each block - simple pass this to blocks.map(getRecurBlockAndProcess)


