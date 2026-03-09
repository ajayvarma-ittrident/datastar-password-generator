"use strict";
let cryptoObject = null;

// Initialize characterset
function initCharSet(numbers, uppercase, lowercase, ascii, space, customcheck, customchar) {
    const numChar = numbers ? "0123456789" : "";
    const upperChar = uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "";
    const lowerChar = lowercase ? "abcdefghijklmnopqrstuvwxyz" : "";
    const asciiChar = ascii ? "!\"#$%" + String.fromCharCode(38) + "'()*+,-./:;" + String.fromCharCode(60) + "=>?@[\\]^_`{|}~" : "";
    const spaceChar = space ? " " : "";
    const customCharset = customcheck ? removeDuplicate(customchar) : "";
    let rawCharset = numChar + lowerChar + upperChar + asciiChar + spaceChar + customCharset;
    console.log(rawCharset);
    return rawCharset;
}

// Removes duplicate entries
function removeDuplicate(customchar){
    customchar = customchar.replace(/\s/g, "\u00A0");
    let orgCharset = "";
    for (const ch of customchar) {
        if (!orgCharset.includes(ch)){
            orgCharset+=ch;
        }
    }
    return orgCharset;
}

function initCrypto() {
    if ("crypto" in window){
        cryptoObject = crypto;
    }else if ("msCrypto" in window){
        cryptoObject = msCrypto;
    }else{
        return;
    }
    
    if (!("getRandomValues" in cryptoObject) || !("Uint32Array" in window) || typeof Uint32Array != "function"){
        cryptoObject = null;
    }
}

//  Calculate length 
function calcLength(type, len, entropy, charset){
    let wholelen;
    if (type==='length'){
        wholelen= parseInt(len);        
    }else if(type==='entropy'){
        if (charset.length<2){
            return 0;
        }
        wholelen= Math.ceil(parseFloat(entropy) * Math.log(2) / Math.log(charset.length));
    }else{
        throw new Error("Assertion error");
    }
    return wholelen;
}

// Calculate entropy for display 
function calcentropy(charset, wholelen){
    const entropy = Math.log(charset.length) * wholelen / Math.log(2);
    let entropystr;
    if (70 > entropy){
        entropystr = entropy.toFixed(2);
    }else if (200 > entropy){
        entropystr = entropy.toFixed(1);
    }else{
        entropystr = entropy.toFixed(0);
    }
    return entropystr;
}

function generatePassword(charset, wholelen) {
    if (wholelen<0 || wholelen>10000){
        return "";
    }
    let result = "";
    for (let i = 0; wholelen > i; i++)
        result += charset[randomInt(charset.length)];
    return result;
}

function copy() {
    const text= document.getElementById("password").textContent;
    return navigator.clipboard.writeText(text);
}

// Returns a random integer in the range [0, n) using a variety of methods.
function randomInt(n) {
    let x = randomIntMathRandom(n);
    x = (x + randomIntBrowserCrypto(n)) % n;
    return x;
}

// Not secure or high quality, but always available.
function randomIntMathRandom(n) {
    let x = Math.floor(Math.random() * n);
    if (0 > x || x >= n)
        throw new Error("Arithmetic exception");
    return x;
}

// Uses a secure, unpredictable random number generator if available; otherwise returns 0.
function randomIntBrowserCrypto(n) {
    if (cryptoObject === null)
        return 0;
    // Generate an unbiased sample
    let x = new Uint32Array(1);
    do cryptoObject.getRandomValues(x);
    while (x[0] - x[0] % n > 4294967296 - n);
    return x[0] % n;
}

initCrypto();