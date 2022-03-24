const express = require('express')
const ExpressError = require('../expressError')
const router = new express.Router()
const db = require('../db')
const slugify = require('slugify')

router.get('/', async function (req,res,next) {
    try {
        const compIndustries = await db.query(
            `SELECT i.industry, c.name as companies 
            FROM companies as c 
            LEFT JOIN companies_industries as ci 
            ON c.code = ci.comp_code 
            LEFT JOIN industries as i 
            ON i.code = ci.ind_code;`)
        return res.json(compIndustries.rows)
    } catch(e){
        return next(e)
    }
    
})


router.post('/', async function (req, res, next){
    const newIn = req.body
    const slug = slugify(newIn.industry, {strict: true, lower: true, remove: true, replacement: '-'})
    
    try{
        const results = await db.query(`INSERT INTO industries VALUES ($1, $2) RETURNING code, industry`, [slug, newIn.industry])
        return res.json({industry: results.rows[0]})
    } catch (e) {
       return next(e)
    }
})

router.post('/:code', async function (req, res, next){
    try{
        const results = await db.query(`INSERT INTO companies_industries VALUES ($1, $2) RETURNING comp_code, ind_code`, [req.body.code, req.params.code])
        return res.json({company_industry: results.rows[0]})
    } catch (e) {
       return next(e)
    }
})



module.exports = router;