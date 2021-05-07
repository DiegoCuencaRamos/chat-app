const generateMessage = (username, message) => ({
    username,
    message,
    createdAt: new Date().getTime()
})

const generateLocationMessage = (username, url) => ({
    username,
    url,
    createdAt: new Date().getTime()
})

module.exports = {
    generateMessage,
    generateLocationMessage
}