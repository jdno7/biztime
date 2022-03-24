const express = require('express')
const ExpressError = require('../expressError')
const router = new express.Router()
const db = require('../db')

router.get('/', async function (req,res,next) {
    try {
        const results = await db.query("SELECT * FROM companies")
        return res.json({companies: results.rows})
    } catch(e){
        return next(e)
    }
    
})

router.get('/:code', async function (req, res, next){
    const code = req.params.code
    
    try {
        const results = await db.query('SELECT * FROM companies WHERE code=$1', [code])
        if (results.rows.length === 0){
            throw new ExpressError('Company Code NOT Found', 404)
        }
        return res.json({company:results.rows[0]})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async function (req, res, next){
    const newCo = req.body
    
    try{
        const results = await db.query(`INSERT INTO companies VALUES ($1, $2, $3) RETURNING code, name, description`, [newCo.code, newCo.name, newCo.description])
        return res.json({company: results.rows[0]})
    } catch (e) {
       return next(e)
    }
})

router.put('/:code', async function (req, res, next){
    const updatedCo = req.body
    
    try{
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [updatedCo.name, updatedCo.description, req.params.code ])
        if (results.rows.length === 0){
            throw new ExpressError('Company Code NOT Found', 404)
        }
        return res.json({company: results.rows[0]})
    } catch (e) {
       return next(e)
    }
})

router.delete('/:code', async function (req, res, next){
    const check = await db.query(`SELECT COUNT(*) FROM companies WHERE code=$1;`, [req.params.code])
    if (check.rows[0].count === '0'){
        throw new ExpressError('Company Code NOT Found', 404)
    }
    console.log(results.rows[0].count)
    
    try{
        const results = await db.query(`DELETE FROM companies WHERE code=$1`, [req.params.code ])
        return res.json({status: "deleted"})
    } catch (e) {
       return next(e)
    }
})

module.exports = router;