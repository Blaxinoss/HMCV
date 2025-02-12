const express = require('express');
const router = express.Router();
const Trainers = require('../models/Trainers');


router.get('/', async (req, res) => {
    try {
        const result = await Trainers.find()
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})


router.post('/', async (req, res) => {
    try {
        const Trainerdata = req.body
        const Trainer = new Trainers(Trainerdata)
        const savedTrainer = await Trainer.save();
        res.status(201).json(savedTrainer)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const TrainerToDelete = await Trainers.findByIdAndDelete(id)
        if (!TrainerToDelete) {
            return res.status(404).json({ error: 'Trainee not found' });
        }
        res.status(200).json({ message: 'Trainer deleted successfully', TrainerToDelete })
    } catch (error) {
        res.status(400).json({ error: error.message })

    }
})

router.put('/:id', async (req, res) => {
    try {
        const updatedTrainer = await Trainers.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!updatedTrainer) {
            return res.status(404).json({ error: 'Trainer not found', updatedTrainer });
        }
        res.status(200).json()
    } catch (error) {
        res.status(400).json({ error: error.message })

    }
})

module.exports = router