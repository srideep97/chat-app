const socket = io()

const $messageForm = document.getElementById('form')
const $messageFormInput = document.getElementById('message')
const $locationButton = document.getElementById('location')

const $messageContainer = document.getElementById('messages')
const $messageTemplate = document.getElementById('messages-template').innerHTML
const $locmessageTemplate = document.getElementById('locmessages-template').innerHTML
const $sidebarTemplate = document.getElementById('sidebar-template').innerHTML
const $sidebarContainer = document.querySelector('.chat__sidebar')

const { username,room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messageContainer.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messageContainer.offsetHeight
    const containerHeight = $messageContainer.scrollHeight
    const scrollOffset = $messageContainer.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messageContainer.scrollTop = $messageContainer.scrollHeight
    }
}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render($messageTemplate, {
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messageContainer.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(locationMessage)=>{
    console.log(locationMessage)
    const html = Mustache.render($locmessageTemplate, {
        username : locationMessage.username,
        url : locationMessage.text,
        createdAt : moment(locationMessage.createdAt).format('h:mm a')
    })
    $messageContainer.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e)=>{
        e.preventDefault()

        $messageForm.setAttribute('disabled','disabled')
        let cli = $messageFormInput.value;
        socket.emit('cli-message',cli, (error)=>{
            $messageForm.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()
            if(error){
                return console.log(error)
            }
            console.log('Message Delivered!')
        })
    })

$locationButton.addEventListener('click', (e)=>{
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation!')
    }
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, (ack)=>{
            $locationButton.removeAttribute('disabled')
            console.log(ack)
        })
    })
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('userData', ({room,users})=>{
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sidebarContainer.innerHTML = html
})

