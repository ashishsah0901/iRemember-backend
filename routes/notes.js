const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// ROUTE 1: GET ALL NOTES (AUTH)
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    let success = false
    try {
        const notes = await Notes.find({ user: req.user.id });
        success = true;
        res.status(500).json({ success, notes })
    } catch (error) {
        res.status(500).json({ success, error: "Some Error Occured" })
    }
})

// ROUTE 2: POST A NOTE (AUTH)
router.post('/addnote', [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })
], fetchuser, async (req, res) => {
    let success = false
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ success, errors: error.array() })
        }
        const { title, description, tag } = req.body
        const note = new Notes({
            user: req.user.id,
            title,
            description,
            tag,
        })
        success = true
        const saveNote = await note.save()
        res.status(200).json({ success, notes: saveNote })
    } catch (error) {
        res.status(500).json({ success, error: "Some Error Occured" })
    }
})

// ROUTE 3: PUT A NOTE (AUTH)
router.put('/updatenote/:id', [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })
], fetchuser, async (req, res) => {
    let success = false
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ success, errors: error.array() })
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
            return res.status(404).json({ success, error: 'Not found.' })
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success, error: 'Not allowed.' })
        }
        success = true
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.status(200).json({ success, note })
    } catch (error) {
        res.status(500).json({ success, error: "Some Error Occured" })
    }
})

// ROUTE 4: DELETE A NOTE (AUTH)
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    let success = false
    try {
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).json({ success, error: 'Not found.' })
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success, error: 'Not allowed.' })
        }
        success = true
        note = await Notes.findByIdAndDelete(req.params.id)
        res.status(200).send({ success, message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ success, error: "Some Error Occured" })
    }
})

module.exports = router