export function concatArrayBuffers(array: ArrayBuffer[]): ArrayBuffer {
    let totalLength = 0;
    for (let i = 0; i < array.length; i++) {
      totalLength += array[i].byteLength;
    }
  
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let i = 0; i < array.length; i++) {
      result.set(new Uint8Array(array[i]), offset);
      offset += array[i].byteLength;
    }
  
    return result.buffer;
}

export function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
  const strippedString = hexString.replace(/[^0-9A-Fa-f]/g, '');
  const byteLength = strippedString.length / 2;
  const buffer = new ArrayBuffer(byteLength);
  const uint8Array = new Uint8Array(buffer);

  for (let i = 0; i < byteLength; i++) {
    const hexByte = strippedString.substr(i * 2, 2);
    uint8Array[i] = parseInt(hexByte, 16);
  }

  return buffer;
}
  