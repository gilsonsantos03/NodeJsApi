const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

const Project  = require('../models/Project');
const Task  = require('../models/Task');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks']); //esse populate faz com que apareça mais infos do usuário

        return res.send({projects});
    } catch (err) {
        return res.status(400).send({error: 'Error when loading projects!'});
    }
});

router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']); //esse populate faz com que apareça mais infos do usuário

        return res.send({project});
    } catch (err) {
        return res.status(400).send({error: 'Error when loading project!'});
    }
});

router.post('/', async (req, res) => {
    try{   
        const { title, description, tasks} = req.body;
        
        const project = await Project.create({title, description, user: req.userId});

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({...task, project: project._id});

            await projectTask.save();
            
            project.tasks.push(projectTask);
            
        }));

        await project.save();

        return res.send({project});
    }catch (err){
        return res.status(400).send({error: 'Error when creating a new project!'});
    }
});

router.put('/:projectId', async (req, res) => {
    try{   
        const { title, description, tasks} = req.body;
        
        const project = await Project.findByIdAndUpdate(req.params.projectId,{
            title,
            description
         }, {new: true}); //esse new: true é pra retornar o projeto atualizado
         //porque por padrão o mongoose retorna o valor antigo

         project.tasks = [];
         await Task.remove({project: project._id}); //vai remover as tasks antigas pra dps adicionar as novas
         //como pode-se ver logo abaixo

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({...task, project: project._id});

            await projectTask.save();
            
            project.tasks.push(projectTask);
            
        }));

        await project.save();

        return res.send({project});
    }catch (err){
        return res.status(400).send({error: 'Error when updating project!'});
    }
});

router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId).populate('user'); //esse populate faz com que apareça mais infos do usuário

        return res.send();
    } catch (err) {
        return res.status(400).send({error: 'Error when deleting project!'});
    }
});

module.exports = app => app.use('/projects', router);