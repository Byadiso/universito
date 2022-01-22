/* eslint-disable no-undef */
const chai = require('chai')
const { expect } = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../app')

// let server = 'http://localhost:3000'

chai.should()
chai.use(chaiHttp)
describe('TEST for Logout', () => {
    it('should log out the user', (done) => {
        chai.request(app)
            .get('/logout')
            .end((err, res) => {
                if (err) done(err)
                res.should.have.status(200)
                done()
            })
    })

    it('should not logout the user', (done) => {
        chai.request(app)
            .get('/logoutss')
            .end((err, res) => {
                if (err) done(err)
                res.should.have.status(404)
                done()
            })
    })
})
