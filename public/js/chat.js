const socket = io()

// DOM elements
const $messageForm = document.querySelector('form')
const $messageFormInput = document.querySelector('input[name="message"]')
const $sendLocationBtn = document.querySelector('#send-location')
const $messagesWrapper = document.querySelector('#messages-wrapper')
const $sidebar = document.querySelector('#sidebar')

// Template
const messageTemplate = ({ username, message, createdAt } = {}) => {
    const newDiv = document.createElement('div')
    newDiv.setAttribute('class', 'message')
    const messageName = `<span class="message__name">${username}</span>`
    const messageMeta = `<span class="message__meta">${dayjs(createdAt).format('hh:mm a')}</span>`
    newDiv.innerHTML = `<p>${messageName} ${messageMeta}</p> <p>${message}</p>`
    return newDiv
}

const locationTemplate = ({ username, url, createdAt } = {}) => {
    const newDiv = document.createElement('div')
    newDiv.setAttribute('class', 'message')
    const messageName = `<span class="message__name">${username}</span>`
    const messageMeta = `<span class="message__meta">${dayjs(createdAt).format('hh:mm a')}</span>`
    const link = `<a href="${url}" target="_blank">My current location</a>`
    newDiv.innerHTML = `<p>${messageName} ${messageMeta}</p> <p>${link}</p>`
    return newDiv
}

const sidebarTemplate = ({ room, users } = {}) => {
    const title = `<h2 class="room-title">${room}</h2>`
    const subtitle = '<h3 class=list-title>Users</h3>'

    const usersList = (users) => {
        let userItems = ''
        users.forEach(user => userItems += `<li>${user.username}</li>`)
        return `<ul class="users">${userItems}</ul>` 
    }
    
    return `${title} ${subtitle} ${usersList(users)}`
} 

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = $messagesWrapper.lastElementChild
    
    // Heigth of the new message
    const { marginTop, marginBottom } = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(marginTop) + parseInt(marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messagesWrapper.offsetHeight

    // Height of messages container
    const containerHeight = $messagesWrapper.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messagesWrapper.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messagesWrapper.scrollTop = $messagesWrapper.scrollHeight
    }
}

// Recibe socket events
socket.on('message', (data) => {
    $messagesWrapper.insertAdjacentElement('beforeend', messageTemplate(data))
    autoScroll()
})

socket.on('locationMessage', (data) => {
    $messagesWrapper.insertAdjacentElement('beforeend', locationTemplate(data))
    autoScroll()
})

socket.on('roomData', (data) => {
    $sidebar.innerHTML = sidebarTemplate(data)
})

// Send socket events
socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value

    if(message) {
        $messageFormInput.setAttribute('disabled', 'disabled')

        socket.emit('sendMessage', message, (error) => {
            $messageFormInput.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()

            if(error) {
                return console.log(error)
            }

            console.log('Message delivered!')
        })
    }
})

$sendLocationBtn.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationBtn.removeAttribute('disabled')
            console.log('Location shared!')
        })
    }, (error) => {
        console.log(error)
    })
})