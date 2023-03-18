const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // //new message element 
    // const $newMessage = $messages.lastElementChild

    // //height of new message
    // const newMessageStyles = getComputedStyle($newMessage)
    // const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // //visible height
    // const visibleHeight = $messages.offsetHeight

    // //height of messages container
    // const containerHeight = $messages.scrollHeight

    // //how far i scrolled
    // const scrolloffset = $messages.scrollTop + visibleHeight

    // if (containerHeight - newMessageHeight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
        console.log($messages.scrollTop);
        console.log($messages.scrollHeight);
    // }
}

//message receiver
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
//location receiver
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//roomdata for sidebar
socket.on('roomData', ({room, users}) => {
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})

//Message sender
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    //send message to server
    socket.emit('sendMessage', message, (error) => {
        //enable button,set input null, focus on input
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error);
        }
        console.log('Message Delivered!')
    })
})

//Location sender 
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    //disable button
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        //send location to server
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, () => {
            //enable button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })  
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
