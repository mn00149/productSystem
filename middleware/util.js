export function getDate(){
    const offset = 1000 * 60 * 60 * 9
    const koreaNow = new Date((new Date()).getTime() + offset)
    const registerDate = koreaNow.toISOString().replace("T", " ").split('.')[0]
    return registerDate
}
