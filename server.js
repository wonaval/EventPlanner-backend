require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const rowdy = require ('rowdy-logger');
const routesReport = rowdy.begin(app);

app.use(express.json());
app.use(require('cors')());

const morgan = require('morgan');
app.use(morgan('tiny'));

const models = require('./models')

// --- MEMBERS ---
// POST - /members - Create new account
const createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hashSync(req.body.password, 10)

        const user = await models.user.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        level: req.body.level,
        password: hashedPassword
    })
    const encryptedId = jwt.sign({ userId: user.id }, process.env.JWT_SECRET)

    res.json({message: 'Registration successful', userId: encryptedId})
    } catch (error) {
        res.json({error: error.message})
    }
}
app.post('/members', createUser)


// POST - /members/login - Account login
const signIn = async (req, res) => {
    try {
        const user = await models.user.findOne({
            where: {
            email: req.body.email
            }
        })
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const encryptedId = jwt.sign({ userId: user.id }, process.env.JWT_SECRET)
            res.json({ message: 'Sign-in successful', user: encryptedId })
        } else {
            res.status(401)
            res.json({error: 'Sign-in failed'})
        }
    } catch (error){
        res.status(400)
        res.json({ error: 'Sign-in failed'})
    }
}
app.post('/members/login', signIn)


// GET - /members/account_info - Retrieve account status information
const accountStatus = async (req, res) => {
    try {
    
        const decryptedId = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        const user = await models.user.findOne({
            where: {
                id: decryptedId.userId
            }
        })
            
        if (user === null) {
            res.status(404).json({error: 'Account status not found'})
        } else if (user) {
            res.json({message: 'Account status has been located', user})
        } else {
            res.json({error: 'Account status not found'}).status(404)
        }
    } catch (error) {
        res.json({error: error.messages})
    }
}
app.get('/members/account_info', accountStatus)


// GET - /members/events - Retrieve all events for current user
const lookupEvent = async (req, res) => {
    try {
        const decryptedId = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        const user = await models.user.findOne({
            where: {
                id: decryptedId.userId
            }
        })
        const allEvents = await user.getEvents();
        res.json({message: 'All events retrieved', allEvents})
    } catch (error) {
        res.json({error: 'No events found'}).status(404)
    }
}
app.get('/members/events', lookupEvent)

const updateSubscription = async (req, res) => {
    try {
        const decryptedId = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        const sub = await models.user.update(
            { level: req.body.level },
            { where: { id: decryptedId.userId }}
        )
        res.json('Subscription level updated')
    } catch (error) {
        console.log({error})
    }
}
app.put('/members', updateSubscription)

// DELETE - /members - Delete account
const deleteUser = async (req, res) => {
    try {
        const decryptedId = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        const events = await models.event.destroy({
            where: {
                userId: decryptedId.userId
            }
        })
        
        const user = await models.user.destroy({
            where: {
                id: decryptedId.userId
            }
        })
        res.json({message: 'User deleted successfully'})
    } catch (error) {
        res.json({error: error.message})
    }
}
app.delete('/members', deleteUser)


// --- EVENTS ---
// POST - /events - Create event
const createEvent = async (req, res) => {
    try {
        const decryptedId = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        const user = await models.user.findOne({
            where: {
                id: decryptedId.userId
            }
        })

        const event = await models.event.create({
            date: req.body.date,
            location: req.body.location,
            description: req.body.description
        })
        await user.addEvent(event)
        res.json({message: 'Event creation successful'})
    } catch (error) {
        res.json({error: error.message})
    }
}
app.post('/events', createEvent)

// DELETE - /events - Delete event by ID
const deleteEvent = async (req, res) => {
    try {
        const decryptedId = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        const event = await models.event.destroy({
            where: {
                id: req.body.id
            }
        })
        res.json({message: 'Event deleted successfully'})
    } catch (error) {
        res.json({error: 'Event not found'}).status(404)
    }
}
app.delete('/events', deleteEvent)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
    routesReport.print()
})

