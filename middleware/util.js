import iconvLite from 'iconv-lite';


export function getDownloadFilename(req, filename) {
    var header = req.headers['user-agent'];
    
    if (header.includes("MSIE") || header.includes("Trident")) { 
        return encodeURIComponent(filename).replace(/\\+/gi, "%20");
    } else if (header.includes("Chrome")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    } else if (header.includes("Opera")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    } else if (header.includes("Firefox")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    }

    return filename;
  }

export function getDate(){
    const offset = 1000 * 60 * 60 * 9
    const koreaNow = new Date((new Date()).getTime() + offset)
    const registerDate = koreaNow.toISOString().replace("T", " ").split('.')[0]
    return registerDate
}

