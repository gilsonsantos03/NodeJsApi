const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth.json');

const User = require('../models/User');

const router = express.Router(); //podemos definir as rotas

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

router.post('/register', async (request, response) => {
    const { email } = request.body

    try {
        if (await User.findOne({ email }))
            return response.status(400).send({ error: 'User already exists!' })

        const user = await User.create(request.body); //estamos criando um user, onde o require.body possui as informações do usuário

        user.password = undefined; //para que a senha não apareça quando enviarmos a requisição

        return response.send({ user, token: generateToken({ id: user.id }) });
    } catch (err) {
        return response.status(400).send({ error: 'Registration failed!' }); //para capturar error
    }
});

//login
router.post('/authenticate', async (request, response) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email }).select('+password'); //esse .select é pra saber se a senha eh realmente do user

    if (!user) {
        return response.status(400).send({ error: 'User not found!' });
    }

    //fazer a verificação pra ver se a senha, é a senha que o user se cadastrou
    //comparando a senha digitada com a senha que ele se registrou
    //usando o bcrypt, pois a senha tá encriptada
    if (!await bcrypt.compare(password, user.password)) {
        return response.status(400).send({ error: 'Invalid password!' });
    }

    user.password = undefined;

    response.send({ user, token: generateToken({ id: user.id }) });
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found!' });

        //token com 20 caracteres
        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        }, { new: true, useFindAndModify: false }
        );

        mailer.sendMail({
            to: email,
            from: 'gilsonsantos1998@gmail.com',
            template: 'auth/forgot_password',
            context: {token},
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email!' });
            
            return res.send();
        })

    } catch (err) {
        res.status(400).send({ error: 'Error on forgot password, try again!' });
    }
});

router.post('/reset_password', async (req, res) => {
    const {email, token, password} = req.body;

    try{
        const user = await User.findOne({email})
            .select('+passwordResetToken passwordresetExpires');

        if (!user)
            return res.status(400).send({error: 'User not found!'});
        
        if (token !== user.passwordResetToken)
            return res.status(400).send({error: 'Token invalid'});
        
        const now = new Date();

        if(now > user.passwordResetExpires)
            return res.status(400).send({error: 'Token expired, generate a new one!'});

        user.password = password;
        
        await user.save();

        res.send();   
    }catch (err){
        res.status(400).send({error: 'Cannot reset password, please try again!'});
    }
});

module.exports = app => app.use('/auth', router); //todas as rotas definidas vão ser prefixadas com o /auth