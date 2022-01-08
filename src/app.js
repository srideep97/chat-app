const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const Filter = require('bad-words')
const { env } = require('process')
const { generateMessage } = require('./utils/message')
const {addUser, removeUser, getUser, getUsersRoom} = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectorypath = path.join(__dirname,'../public')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(express.static(publicDirectorypath))


io.on('connection', (socket)=>{
    console.log('New Socket Connection')

    

    socket.on('join', ({ username,room },callback)=>{
        const { error, user } = addUser({
            id : socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }
        socket.join(user.room)


        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('userData', {
            room : user.room,
            users : getUsersRoom(user.room)
        })
        callback()
    })

    socket.on('cli-message',(clientmessage, callback)=>{
        const filter = new Filter()

        if(filter.isProfane(clientmessage)){
            return callback('Foul words are not allowed')
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,clientmessage))
        callback()
    })

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location shared!')
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left now!`))
            io.to(user.room).emit('userData', {
                room : user.room,
                users : getUsersRoom(user.room)
            })
        }
        
    })
})

app.get('/', (req, res)=>{
    res.render('index')
})

server.listen(port, ()=>{
    console.log('server up at',port)
})