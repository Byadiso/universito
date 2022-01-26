/* eslint-disable no-undef */
const chai = require('chai')
const { expect } = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../app')

// let server = 'http://localhost:3000'

chai.should()
chai.use(chaiHttp)

describe('TEST Router  /message', () => {
    it(' You  should be able to see all message in your inbox', (done) => {
        chai.request(app)
            .get('/messages')
            .end((err, res) => {
                if (err) done(err)
                res.should.have.status(200)
                expect(res.body).to.be.a('object')
                done()
            })
    })

    it('You  should not be able to see all message in your inbox ', function (done) {
        chai.request(app)
            .get('/messagess')
            .end((err, res) => {
                if (err) done(err)
                res.should.have.status(404)
                done()
            })
    })

    it(' You  should be able to display a new message page', (done) => {
        chai.request(app)
            .get('/messages/new')
            .end((err, res) => {
                if (err) done(err)
                res.should.have.status(200)
                res.should.be.html
                done()
            })
    })

    // it('it should not login user, should show not found api ', function (done) {
    //     const otherUserId = 123131;
    //     const userLoggedInId = 123131;
    //     getChatByUserId(userLoggedInId, otherUserId).should.have.a('object')
    //     chai.request(app)
    //         .post('/message')
    //         .send(details)
    //         .end((err, res) => {
    //             if (err) done(err)
    //             res.should.have.status(404)
    //             done()
    //         })
    // })
})
