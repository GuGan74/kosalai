const assert = require('assert');

let listingType = 'livestock';

function toggle() {
    const next = listingType === 'livestock' ? 'pets' : 'livestock';
    listingType = next;
    return listingType;
}

console.log("Start:", listingType);
console.log("Click 1 (should be pets):", toggle());
console.log("Click 2 (should be livestock):", toggle());
console.log("Click 3 (should be pets):", toggle());
