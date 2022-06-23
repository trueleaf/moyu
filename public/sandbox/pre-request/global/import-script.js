
async function importScript(url) {
    const data = await fetch(url);
    const textData = await data.text();
    return textData
}