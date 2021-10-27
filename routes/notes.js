const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// ROUTE 1: GET ALL NOTES (AUTH)
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.send(notes);
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

// ROUTE 2: POST A NOTE (AUTH)
router.post('/addnote', [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })
], fetchuser, async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        const { title, description, tag } = req.body
        const note = new Notes({
            user: req.user.id,
            title,
            description,
            tag,
        })
        const saveNote = await note.save()
        res.send(saveNote);
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

// ROUTE 3: PUT A NOTE (AUTH)
router.put('/updatenote/:id', [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })
], fetchuser, async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        const { title, description, tag } = req.body
        const newNote = {}
        if (title) {
            newNote.title = title
        }
        if (description) {
            newNote.description = description
        }
        if (tag) {
            newNote.tag = tag
        }
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).json({ error: 'Not found.' })
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not allowed.' })
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.send(note);
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

// ROUTE 4: DELETE A NOTE (AUTH)
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).json({ error: 'Not found.' })
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not allowed.' })
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.send({ success: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

module.exports = router