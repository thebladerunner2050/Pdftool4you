/**
 * pdf-decrypt.js — Pure client-side PDF decryption with AES-256 and RC4 support
 * Adapted from @pdfsmaller/pdf-decrypt for direct browser inclusion.
 * Handles both user and owner passwords. All processing is 100% on-device.
 */

(function (global) {
  'use strict';

  // ========== MD5 and RC4 Crypto Utilities ==========

  function md5(data) {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    const S = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];

    const K = new Uint32Array([
      0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
      0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
      0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
      0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
      0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
      0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
      0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
      0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
      0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
      0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
      0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
      0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
      0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
      0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
      0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
      0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ]);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;

    const msgLen = bytes.length;
    const msgBitLen = msgLen * 8;
    const msgLenPadded = ((msgLen + 9 + 63) & ~63);
    const msg = new Uint8Array(msgLenPadded);
    msg.set(bytes);
    msg[msgLen] = 0x80;

    const dataView = new DataView(msg.buffer);
    dataView.setUint32(msgLenPadded - 8, msgBitLen, true);
    dataView.setUint32(msgLenPadded - 4, 0, true);

    for (let offset = 0; offset < msgLenPadded; offset += 64) {
      const chunk = new Uint32Array(msg.buffer, offset, 16);

      let a = a0, b = b0, c = c0, d = d0;

      for (let i = 0; i < 64; i++) {
        let f, g;

        if (i < 16) {
          f = (b & c) | ((~b) & d);
          g = i;
        } else if (i < 32) {
          f = (d & b) | ((~d) & c);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          f = b ^ c ^ d;
          g = (3 * i + 5) % 16;
        } else {
          f = c ^ (b | (~d));
          g = (7 * i) % 16;
        }

        f = (f + a + K[i] + chunk[g]) >>> 0;
        a = d;
        d = c;
        c = b;
        b = (b + ((f << S[i]) | (f >>> (32 - S[i])))) >>> 0;
      }

      a0 = (a0 + a) >>> 0;
      b0 = (b0 + b) >>> 0;
      c0 = (c0 + c) >>> 0;
      d0 = (d0 + d) >>> 0;
    }

    const result = new Uint8Array(16);
    const view = new DataView(result.buffer);
    view.setUint32(0, a0, true);
    view.setUint32(4, b0, true);
    view.setUint32(8, c0, true);
    view.setUint32(12, d0, true);

    return result;
  }

  class RC4 {
    constructor(key) {
      this.s = new Uint8Array(256);
      this.i = 0;
      this.j = 0;

      for (let i = 0; i < 256; i++) {
        this.s[i] = i;
      }

      let j = 0;
      for (let i = 0; i < 256; i++) {
        j = (j + this.s[i] + key[i % key.length]) & 0xFF;
        const temp = this.s[i];
        this.s[i] = this.s[j];
        this.s[j] = temp;
      }
    }

    process(data) {
      const result = new Uint8Array(data.length);

      for (let k = 0; k < data.length; k++) {
        this.i = (this.i + 1) & 0xFF;
        this.j = (this.j + this.s[this.i]) & 0xFF;

        const temp = this.s[this.i];
        this.s[this.i] = this.s[this.j];
        this.s[this.j] = temp;

        const t = (this.s[this.i] + this.s[this.j]) & 0xFF;
        result[k] = data[k] ^ this.s[t];
      }

      return result;
    }
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ========== AES and SHA Cryptographic Utilities (Web Crypto API) ==========

  function concat(...arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  async function sha256(data) {
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
  }

  async function sha384(data) {
    const hash = await crypto.subtle.digest('SHA-384', data);
    return new Uint8Array(hash);
  }

  async function sha512(data) {
    const hash = await crypto.subtle.digest('SHA-512', data);
    return new Uint8Array(hash);
  }

  async function aes128CbcEncrypt(data, key, iv) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt']);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
    return new Uint8Array(encrypted).slice(0, data.byteLength);
  }

  async function aes256CbcDecryptNoPad(ciphertext, key, iv) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt', 'decrypt']);

    const lastBlock = ciphertext.slice(ciphertext.length - 16);

    const xored = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      xored[i] = lastBlock[i] ^ 0x10;
    }

    const zeroIV = new Uint8Array(16);
    const encResult = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: zeroIV }, cryptoKey, xored);
    const cFake = new Uint8Array(encResult).slice(0, 16);

    const extended = concat(ciphertext, cFake);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, extended);
    return new Uint8Array(decrypted).slice(0, ciphertext.length);
  }

  async function aes256EcbDecryptBlock(block, key) {
    const zeroIV = new Uint8Array(16);
    return aes256CbcDecryptNoPad(block, key, zeroIV);
  }

  async function importAES256DecryptKey(key) {
    return await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt', 'decrypt']);
  }

  async function aes256CbcDecryptWithKey(data, cryptoKey, iv) {
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
    return new Uint8Array(decrypted);
  }

  async function computeHash2B(password, salt, userKey) {
    const input = concat(password, salt, userKey);
    let K = await sha256(input);

    let i = 0;
    let E;

    while (true) {
      const block = concat(password, K, userKey);
      const K1 = new Uint8Array(block.length * 64);
      for (let j = 0; j < 64; j++) {
        K1.set(block, j * block.length);
      }

      const aesKey = K.slice(0, 16);
      const aesIV = K.slice(16, 32);
      E = await aes128CbcEncrypt(K1, aesKey, aesIV);

      let byteSum = 0;
      for (let j = 0; j < 16; j++) {
        byteSum += E[j];
      }
      const hashSelect = byteSum % 3;

      if (hashSelect === 0) {
        K = await sha256(E);
      } else if (hashSelect === 1) {
        K = await sha384(E);
      } else {
        K = await sha512(E);
      }

      i++;
      if (i >= 64 && E[E.length - 1] <= i - 32) {
        break;
      }
    }

    return K.slice(0, 32);
  }

  // ========== PDF-Lib Decryption Engine ==========

  const PADDING = new Uint8Array([
    0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41,
    0x64, 0x00, 0x4E, 0x56, 0xFF, 0xFA, 0x01, 0x08,
    0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
    0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A
  ]);

  const BATCH_SIZE = 100;

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function extractBytes(pdfObj) {
    if (!pdfObj) return null;

    const { PDFHexString, PDFString } = global.PDFLib;

    if (pdfObj instanceof PDFHexString) {
      return hexToBytes(pdfObj.asString());
    }

    if (pdfObj instanceof PDFString) {
      return pdfObj.asBytes();
    }

    const str = pdfObj.toString();
    if (str.startsWith('<') && str.endsWith('>')) {
      return hexToBytes(str.slice(1, -1));
    }

    return null;
  }

  function saslPrepPassword(password) {
    const bytes = new TextEncoder().encode(password);
    return bytes.length > 127 ? bytes.slice(0, 127) : bytes;
  }

  function readEncryptParams(context) {
    const { PDFName, PDFRef, PDFDict, PDFArray } = global.PDFLib;
    
    // Find the Encrypt reference and trailer dictionary safely
    let encryptRef = null;
    let trailerDict = null;
    let trailerID = null;

    // 1. Try context.trailerInfo (standard pdf-lib plain JS object)
    if (context.trailerInfo) {
      encryptRef = context.trailerInfo.Encrypt;
      trailerID = context.trailerInfo.ID;
    }

    // 2. Try context.trailer (PDFDict)
    if (!encryptRef && context.trailer && context.trailer instanceof PDFDict) {
      encryptRef = context.trailer.get(PDFName.of('Encrypt'));
      trailerDict = context.trailer;
      trailerID = context.trailer.get(PDFName.of('ID'));
    }

    // 3. Scan all indirect objects for any dictionary containing /Encrypt
    if (!encryptRef) {
      const indirectObjects = context.enumerateIndirectObjects();
      for (const [ref, obj] of indirectObjects) {
        if (obj instanceof PDFDict) {
          const enc = obj.get(PDFName.of('Encrypt'));
          if (enc) {
            encryptRef = enc;
            break;
          }
        }
      }
    }

    if (!encryptRef) {
      return null;
    }

    let encryptDict;
    if (encryptRef instanceof PDFRef) {
      encryptDict = context.lookup(encryptRef);
    } else if (encryptRef instanceof PDFDict) {
      encryptDict = encryptRef;
    } else {
      return null;
    }

    if (!encryptDict || !(encryptDict instanceof PDFDict)) {
      return null;
    }

    const V = encryptDict.get(PDFName.of('V'));
    const R = encryptDict.get(PDFName.of('R'));
    const Length = encryptDict.get(PDFName.of('Length'));
    const P = encryptDict.get(PDFName.of('P'));
    const O = encryptDict.get(PDFName.of('O'));
    const U = encryptDict.get(PDFName.of('U'));

    const version = V ? (typeof V.asNumber === 'function' ? V.asNumber() : Number(V.toString())) : 0;
    const revision = R ? (typeof R.asNumber === 'function' ? R.asNumber() : Number(R.toString())) : 0;

    const permissions = P ? (typeof P.asNumber === 'function' ? P.asNumber() : Number(P.toString())) : 0;

    const ownerKey = extractBytes(O);
    const userKey = extractBytes(U);

    if (!ownerKey || !userKey) {
      throw new Error('Could not read /O or /U values from encryption dictionary');
    }

    let fileId = new Uint8Array(0);
    const idArray = trailerID;

    if (idArray) {
      if (Array.isArray(idArray) && idArray.length > 0) {
        fileId = extractBytes(idArray[0]) || new Uint8Array(0);
      } else if (idArray instanceof PDFArray) {
        const firstId = idArray.lookup(0);
        fileId = extractBytes(firstId) || new Uint8Array(0);
      } else {
        fileId = extractBytes(idArray) || new Uint8Array(0);
      }
    }

    const params = {
      version,
      revision,
      ownerKey,
      userKey,
      permissions,
      fileId,
      encryptRef,
      encryptDict
    };

    if (version === 5 && revision === 6) {
      const OE = encryptDict.get(PDFName.of('OE'));
      const UE = encryptDict.get(PDFName.of('UE'));
      const Perms = encryptDict.get(PDFName.of('Perms'));
      const EncryptMetadata = encryptDict.get(PDFName.of('EncryptMetadata'));

      params.ownerEncryptKey = extractBytes(OE);
      params.userEncryptKey = extractBytes(UE);
      params.perms = extractBytes(Perms);

      if (!params.ownerEncryptKey || !params.userEncryptKey || !params.perms) {
        throw new Error('Missing /OE, /UE, or /Perms in AES-256 encryption dictionary');
      }

      if (EncryptMetadata) {
        const emStr = EncryptMetadata.toString();
        params.encryptMetadata = emStr !== 'false';
      } else {
        params.encryptMetadata = true;
      }

      params.algorithm = 'AES-256';
      params.keyLength = 32;
    } else if (version <= 3 && revision <= 4) {
      let keyLengthBits = Length ? (typeof Length.asNumber === 'function' ? Length.asNumber() : Number(Length.toString())) : 40;
      if (revision >= 3 && !Length) keyLengthBits = 128;
      params.keyLength = keyLengthBits / 8;
      params.algorithm = 'RC4';
    } else {
      throw new Error(
        `Unsupported encryption: V=${version}, R=${revision}. ` +
        `Only RC4 (V=1-2, R=2-3) and AES-256 (V=5, R=6) are supported.`
      );
    }

    return params;
  }

  function padPassword(password) {
    const pwdBytes = typeof password === 'string' ? new TextEncoder().encode(password) : password;
    const padded = new Uint8Array(32);

    if (pwdBytes.length >= 32) {
      padded.set(pwdBytes.slice(0, 32));
    } else {
      padded.set(pwdBytes);
      padded.set(PADDING.slice(0, 32 - pwdBytes.length), pwdBytes.length);
    }

    return padded;
  }

  function computeEncryptionKey(password, ownerKey, permissions, fileId, revision, keyLength) {
    const paddedPwd = padPassword(password);

    const hashInput = new Uint8Array(
      paddedPwd.length +
      ownerKey.length +
      4 +
      fileId.length
    );

    let offset = 0;
    hashInput.set(paddedPwd, offset);
    offset += paddedPwd.length;

    hashInput.set(ownerKey, offset);
    offset += ownerKey.length;

    hashInput[offset++] = permissions & 0xFF;
    hashInput[offset++] = (permissions >> 8) & 0xFF;
    hashInput[offset++] = (permissions >> 16) & 0xFF;
    hashInput[offset++] = (permissions >> 24) & 0xFF;

    hashInput.set(fileId, offset);

    let hash = md5(hashInput);

    if (revision >= 3) {
      const n = keyLength;
      for (let i = 0; i < 50; i++) {
        hash = md5(hash.slice(0, n));
      }
    }

    return hash.slice(0, keyLength);
  }

  function validateUserPasswordRC4(password, encryptParams) {
    const { ownerKey, userKey, permissions, fileId, revision, keyLength } = encryptParams;

    const encryptionKey = computeEncryptionKey(password, ownerKey, permissions, fileId, revision, keyLength);

    if (revision === 2) {
      const rc4 = new RC4(encryptionKey);
      const computed = rc4.process(new Uint8Array(PADDING));

      if (arraysEqual(computed, userKey)) {
        return encryptionKey;
      }
    } else {
      const hashInput = new Uint8Array(PADDING.length + fileId.length);
      hashInput.set(PADDING);
      hashInput.set(fileId, PADDING.length);
      const hash = md5(hashInput);

      let result = new RC4(encryptionKey).process(hash);
      for (let i = 1; i <= 19; i++) {
        const iterKey = new Uint8Array(encryptionKey.length);
        for (let j = 0; j < encryptionKey.length; j++) {
          iterKey[j] = encryptionKey[j] ^ i;
        }
        result = new RC4(iterKey).process(result);
      }

      if (arraysEqual(result.slice(0, 16), userKey.slice(0, 16))) {
        return encryptionKey;
      }
    }

    return null;
  }

  function validateOwnerPasswordRC4(ownerPassword, encryptParams) {
    const { ownerKey, revision, keyLength } = encryptParams;

    const paddedOwner = padPassword(ownerPassword);

    let hash = md5(paddedOwner);

    if (revision >= 3) {
      for (let i = 0; i < 50; i++) {
        hash = md5(hash);
      }
    }

    const ownerDecryptKey = hash.slice(0, keyLength);

    let recoveredUserPwd;

    if (revision === 2) {
      const rc4 = new RC4(ownerDecryptKey);
      recoveredUserPwd = rc4.process(new Uint8Array(ownerKey));
    } else {
      let result = new Uint8Array(ownerKey);
      for (let i = 19; i >= 0; i--) {
        const iterKey = new Uint8Array(ownerDecryptKey.length);
        for (let j = 0; j < ownerDecryptKey.length; j++) {
          iterKey[j] = ownerDecryptKey[j] ^ i;
        }
        result = new RC4(iterKey).process(result);
      }
      recoveredUserPwd = result;
    }

    return validateUserPasswordRC4(recoveredUserPwd, encryptParams);
  }

  function decryptObjectRC4(data, objectNum, generationNum, encryptionKey) {
    const keyInput = new Uint8Array(encryptionKey.length + 5);
    keyInput.set(encryptionKey);

    keyInput[encryptionKey.length] = objectNum & 0xFF;
    keyInput[encryptionKey.length + 1] = (objectNum >> 8) & 0xFF;
    keyInput[encryptionKey.length + 2] = (objectNum >> 16) & 0xFF;

    keyInput[encryptionKey.length + 3] = generationNum & 0xFF;
    keyInput[encryptionKey.length + 4] = (generationNum >> 8) & 0xFF;

    const objectKey = md5(keyInput);

    const rc4 = new RC4(objectKey.slice(0, Math.min(encryptionKey.length + 5, 16)));

    return rc4.process(data);
  }

  function decryptStringsRC4(obj, objectNum, generationNum, encryptionKey) {
    if (!obj) return;

    const { PDFString, PDFHexString, PDFDict, PDFArray } = global.PDFLib;

    if (obj instanceof PDFString) {
      const originalBytes = obj.asBytes();
      const decrypted = decryptObjectRC4(originalBytes, objectNum, generationNum, encryptionKey);
      obj.value = Array.from(decrypted).map(b => String.fromCharCode(b)).join('');
    } else if (obj instanceof PDFHexString) {
      const originalBytes = obj.asBytes();
      const decrypted = decryptObjectRC4(originalBytes, objectNum, generationNum, encryptionKey);
      obj.value = bytesToHex(decrypted);
    } else if (obj instanceof PDFDict) {
      const entries = obj.entries();
      for (const [key, value] of entries) {
        const keyName = key.asString();
        if (keyName !== '/Length' && keyName !== '/Filter' && keyName !== '/DecodeParms') {
          decryptStringsRC4(value, objectNum, generationNum, encryptionKey);
        }
      }
    } else if (obj instanceof PDFArray) {
      const array = obj.asArray();
      for (const element of array) {
        decryptStringsRC4(element, objectNum, generationNum, encryptionKey);
      }
    }
  }

  async function validateUserPasswordAES256(password, encryptParams) {
    const { userKey, userEncryptKey } = encryptParams;

    const validationSalt = userKey.slice(32, 40);
    const hash = await computeHash2B(password, validationSalt, new Uint8Array(0));

    if (!arraysEqual(hash, userKey.slice(0, 32))) {
      return null;
    }

    const keySalt = userKey.slice(40, 48);
    const ueKey = await computeHash2B(password, keySalt, new Uint8Array(0));
    const zeroIV = new Uint8Array(16);
    const fileKey = await aes256CbcDecryptNoPad(userEncryptKey, ueKey, zeroIV);

    return fileKey;
  }

  async function validateOwnerPasswordAES256(password, encryptParams) {
    const { ownerKey, userKey, ownerEncryptKey } = encryptParams;

    const validationSalt = ownerKey.slice(32, 40);
    const hash = await computeHash2B(password, validationSalt, userKey);

    if (!arraysEqual(hash, ownerKey.slice(0, 32))) {
      return null;
    }

    const keySalt = ownerKey.slice(40, 48);
    const oeKey = await computeHash2B(password, keySalt, userKey);
    const zeroIV = new Uint8Array(16);
    const fileKey = await aes256CbcDecryptNoPad(ownerEncryptKey, oeKey, zeroIV);

    return fileKey;
  }

  async function verifyPerms(fileKey, encryptParams) {
    const { perms, permissions, encryptMetadata } = encryptParams;

    try {
      const decrypted = await aes256EcbDecryptBlock(perms, fileKey);

      const p0 = decrypted[0] | (decrypted[1] << 8) | (decrypted[2] << 16) | (decrypted[3] << 24);
      if ((p0 | 0) !== (permissions | 0)) {
        return false;
      }

      const expectedEM = encryptMetadata ? 0x54 : 0x46;
      if (decrypted[8] !== expectedEM) {
        return false;
      }

      if (decrypted[9] !== 0x61 || decrypted[10] !== 0x64 || decrypted[11] !== 0x62) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  function collectEncryptedItems(context, encryptRefNum, encryptMetadata) {
    const { PDFDict, PDFRawStream, PDFName } = global.PDFLib;
    const streamItems = [];
    const stringItems = [];
    const indirectObjects = context.enumerateIndirectObjects();

    for (const [ref, obj] of indirectObjects) {
      const objectNum = ref.objectNumber;
      const generationNum = ref.generationNumber || 0;

      if (encryptRefNum !== null && objectNum === encryptRefNum) {
        continue;
      }

      if (obj instanceof PDFDict && !(obj instanceof PDFRawStream)) {
        const type = obj.get(PDFName.of('Type'));
        if (type && type.toString() === '/Sig') continue;
      }

      if (obj instanceof PDFRawStream && obj.dict) {
        const type = obj.dict.get(PDFName.of('Type'));
        if (type) {
          const typeName = type.toString();
          if (typeName === '/XRef' || typeName === '/Sig') continue;
          if (typeName === '/Metadata' && !encryptMetadata) continue;
        }
      }

      if (obj instanceof PDFRawStream) {
        const streamData = obj.contents;
        if (streamData.length >= 16) {
          streamItems.push({ ref, obj, data: streamData, objectNum, generationNum });
        }

        if (obj.dict) {
          collectStringsFromObject(obj.dict, objectNum, generationNum, stringItems);
        }
      }

      if (!(obj instanceof PDFRawStream)) {
        collectStringsFromObject(obj, objectNum, generationNum, stringItems);
      }
    }

    return { streamItems, stringItems };
  }

  function collectStringsFromObject(obj, objectNum, generationNum, items) {
    if (!obj) return;

    const { PDFString, PDFHexString, PDFDict, PDFArray } = global.PDFLib;

    if (obj instanceof PDFString) {
      const bytes = obj.asBytes();
      if (bytes.length >= 16) {
        items.push({ obj, bytes, type: 'string', objectNum, generationNum });
      }
    } else if (obj instanceof PDFHexString) {
      const bytes = obj.asBytes();
      if (bytes.length >= 16) {
        items.push({ obj, bytes, type: 'hex', objectNum, generationNum });
      }
    } else if (obj instanceof PDFDict) {
      for (const [key, value] of obj.entries()) {
        const keyName = key.asString();
        if (keyName !== '/Length' && keyName !== '/Filter' && keyName !== '/DecodeParms') {
          collectStringsFromObject(value, objectNum, generationNum, items);
        }
      }
    } else if (obj instanceof PDFArray) {
      for (const element of obj.asArray()) {
        collectStringsFromObject(element, objectNum, generationNum, items);
      }
    }
  }

  async function decryptAES256Blob(data, cryptoKey) {
    if (data.length < 16) {
      return data;
    }
    const iv = data.slice(0, 16);
    const ciphertext = data.slice(16);

    if (ciphertext.length === 0) {
      return new Uint8Array(0);
    }

    if (ciphertext.length % 16 !== 0) {
      return data;
    }

    try {
      return await aes256CbcDecryptWithKey(ciphertext, cryptoKey, iv);
    } catch {
      return data;
    }
  }

  async function decryptAllAES256(streamItems, stringItems, cryptoKey) {
    const { PDFString } = global.PDFLib;

    for (let i = 0; i < streamItems.length; i += BATCH_SIZE) {
      const batch = streamItems.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(item => decryptAES256Blob(item.data, cryptoKey))
      );

      for (let j = 0; j < batch.length; j++) {
        batch[j].obj.contents = results[j];
      }
    }

    for (let i = 0; i < stringItems.length; i += BATCH_SIZE) {
      const batch = stringItems.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(item => decryptAES256Blob(item.bytes, cryptoKey))
      );

      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const decrypted = results[j];

        if (item.type === 'string') {
          item.obj.value = Array.from(decrypted).map(b => String.fromCharCode(b)).join('');
        } else {
          item.obj.value = bytesToHex(decrypted);
        }
      }
    }
  }

  function decryptAllRC4(context, encryptionKey, encryptRefNum) {
    const { PDFDict, PDFRawStream, PDFName } = global.PDFLib;
    const indirectObjects = context.enumerateIndirectObjects();

    for (const [ref, obj] of indirectObjects) {
      const objectNum = ref.objectNumber;
      const generationNum = ref.generationNumber || 0;

      if (encryptRefNum !== null && objectNum === encryptRefNum) {
        continue;
      }

      if (obj instanceof PDFDict && !(obj instanceof PDFRawStream)) {
        const type = obj.get(PDFName.of('Type'));
        if (type && type.toString() === '/Sig') continue;
      }

      if (obj instanceof PDFRawStream && obj.dict) {
        const type = obj.dict.get(PDFName.of('Type'));
        if (type) {
          const typeName = type.toString();
          if (typeName === '/XRef' || typeName === '/Sig') {
            continue;
          }
        }
      }

      if (obj instanceof PDFRawStream) {
        const streamData = obj.contents;
        const decrypted = decryptObjectRC4(streamData, objectNum, generationNum, encryptionKey);
        obj.contents = decrypted;

        if (obj.dict) {
          decryptStringsRC4(obj.dict, objectNum, generationNum, encryptionKey);
        }
      }

      if (!(obj instanceof PDFRawStream)) {
        decryptStringsRC4(obj, objectNum, generationNum, encryptionKey);
      }
    }
  }

  // ========== Public API Attachment ==========

  async function decryptPDF(pdfBytes, password) {
    if (!global.PDFLib) {
      throw new Error('PDFLib is not loaded. Please ensure pdf-lib.min.js is included first.');
    }

    const { PDFDocument, PDFRef, PDFDict, PDFName } = global.PDFLib;

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
        updateMetadata: false
      });

      const context = pdfDoc.context;

      const encryptParams = readEncryptParams(context);

      if (!encryptParams) {
        throw new Error('This PDF is not encrypted. No /Encrypt dictionary found.');
      }

      const encryptRefNum = (encryptParams.encryptRef instanceof PDFRef)
        ? encryptParams.encryptRef.objectNumber
        : null;

      if (encryptParams.algorithm === 'AES-256') {
        const pwdBytes = saslPrepPassword(password);

        let fileKey = await validateUserPasswordAES256(pwdBytes, encryptParams);

        if (!fileKey) {
          fileKey = await validateOwnerPasswordAES256(pwdBytes, encryptParams);
        }

        if (!fileKey) {
          throw new Error('Incorrect password. The password does not match.');
        }

        const permsValid = await verifyPerms(fileKey, encryptParams);
        // Note: proceed even if perms verification fails since some tools write relaxed blocks

        const cryptoKey = await importAES256DecryptKey(fileKey);

        const { streamItems, stringItems } = collectEncryptedItems(
          context, encryptRefNum, encryptParams.encryptMetadata
        );

        await decryptAllAES256(streamItems, stringItems, cryptoKey);

      } else {
        let encryptionKey = validateUserPasswordRC4(password, encryptParams);

        if (!encryptionKey) {
          encryptionKey = validateOwnerPasswordRC4(password, encryptParams);
        }

        if (!encryptionKey) {
          throw new Error('Incorrect password. The password does not match.');
        }

        decryptAllRC4(context, encryptionKey, encryptRefNum);
      }

      if (context.trailerInfo) {
        delete context.trailerInfo.Encrypt;
      }
      if (context.trailer && context.trailer instanceof PDFDict) {
        context.trailer.delete(PDFName.of('Encrypt'));
      }

      const decryptedBytes = await pdfDoc.save({
        useObjectStreams: false
      });

      return decryptedBytes;

    } catch (error) {
      console.error('decryptPDF error:', error);
      if (error.message.includes('not encrypted') ||
          error.message.includes('Incorrect password') ||
          error.message.includes('Unsupported encryption') ||
          error.message.includes('does not match')) {
        throw error;
      }
      throw new Error(`Failed to decrypt PDF: ${error.message}`);
    }
  }

  async function isEncrypted(pdfBytes) {
    if (!global.PDFLib) {
      throw new Error('PDFLib is not loaded. Please ensure pdf-lib.min.js is included first.');
    }

    const { PDFDocument } = global.PDFLib;

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
        updateMetadata: false
      });

      const encryptParams = readEncryptParams(pdfDoc.context);

      if (!encryptParams) {
        return { encrypted: false };
      }

      return {
        encrypted: true,
        algorithm: encryptParams.algorithm,
        version: encryptParams.version,
        revision: encryptParams.revision,
        keyLength: encryptParams.keyLength * 8
      };
    } catch (error) {
      throw new Error(`Failed to read PDF: ${error.message}`);
    }
  }

  global.PDFDecrypt = {
    decryptPDF,
    isEncrypted
  };

})(typeof window !== 'undefined' ? window : this);
