users = []

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username||!room){
        return {
            error : 'Username and room are required!'
        }
    }

    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })

    if(existingUser){
        return {
            error: 'User already exists!'
        }
    }

    const user = { id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}


const getUser = (id) => {
    const user = users.find((user)=>{
        return user.id === id
    })

    return user
}

const getUsersRoom = (room) => {
    const roomUsers = users.filter((user)=>{
        return user.room === room 
    }) 

    return roomUsers
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersRoom
}
// const added = addUser({
//     id: 22,
//     username : 'deep',
//     room : 'nirmal'
// }) 

// const added2 = addUser({
//     id: 23,
//     username : 'deepu',
//     room : 'nirmal'
// }) 

// const added3 = addUser({
//     id: 24,
//     username : 'deepu.b',
//     room : 'nirmal2'
// }) 

// console.log(users)

// console.log(getUser(22))
// console.log(getUsersRoom('nirmal'))