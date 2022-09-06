
async function importScript(url) {
    if (url.match(/^https?:\/\//)) {
        const data = await fetch(url);
        const textData = await data.text();
        return textData
    } else {
        const matchedData = GlobalData.packages.find(v => v.name === url)
        if (matchedData) {
            return matchedData.code;
        } 
        return ""
    }
}