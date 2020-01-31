const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false //para proteger a senha
    },
    passwordResetToken:{
        type: String,
        select: false
    },
    passwordResetExpires:{
        type: Date,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//pra mostrar a senha encriptada
UserSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
}); //para fazer algo antes de salvar

const User = mongoose.model('User', UserSchema);

module.exports = User; //para ser visível em todo o projeto