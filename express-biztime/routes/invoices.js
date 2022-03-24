const express = require('express')
const ExpressError = require('../expressError')
const router = new express.Router()
const db = require('../db')


router.get('/', async function (req, res, next) {
    try {
        const results = await db.query("SELECT * FROM invoices")
        return res.json({invoices: results.rows})
    } catch(e){
        return next(e)
    }
})

router.get('/:id', async function (req, res, next){
    const id = req.params.id
    try {
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id])
        if (results.rows.length === 0){
            throw new ExpressError('Invoice Not Found', 404)
        }
        return res.json({invoice:results.rows[0]})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async function (req, res, next){
    const newInvoice = req.body
    
    
    try{
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [newInvoice.comp_code, newInvoice.amt])
        return res.json({invoice: results.rows[0]})
    } catch (e) {
       return next(e)
    }
})

router.put('/:id', async function (req, res, next){
    const updatedIV = req.body
    
    try{
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [updatedIV.amt, req.params.id ])
        if (results.rows.length === 0){
            throw new ExpressError('Company Code NOT Found', 404)
        }
        return res.json({invoice: results.rows[0]})
    } catch (e) {
       return next(e)
    }
})

router.delete('/:id', async function (req, res, next){
    const check = await db.query(`SELECT COUNT(*) FROM invoices WHERE id=$1;`, [req.params.id])
    if (check.rows[0].count === '0'){
        throw new ExpressError('Company Code NOT Found', 404)
    }
    
    try{
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id])
        return res.json({status: "deleted"})
    } catch (e) {
       return next(e)
    }
})

module.exports = router;