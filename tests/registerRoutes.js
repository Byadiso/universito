/* eslint-disable no-undef */
const chai = require('chai')
const { expect } = require('chai')
const chaiHttp = require('chai-http')
const { app } = require('../app')

// let server = 'http://localhost:3000'

chai.should()
chai.use(chaiHttp)

describe('/POST User /register', () => {
    it('it should register new user ', (done) => {
        const details = {
            email: 'ngana@gmail.com',
            firstname: 'tech',
            lastname: 'ngana',
            password: '111111111',
        }

        chai.request(app)
            .post('/register')
            .send(details)
            .then((err, res) => {
                if (err) done(err)
                res.should.have.status(201)
                expect(res.body).to.be.a('object')
                done()
            })
            .catch(done())
    })

    it(' email and password should be not empty', (done) => {
        const details = {
            email: '',
            password: '',
        }

        chai.request(app)
            .post('/register')
            .send(details)
            .then((err, res) => {
                if (err) done(err)
                res.should.have.status(400)
                expect(res.body).to.have.property('message')
                done()
            })
            .catch(done())
    })

    it('it should return password  does not match', function (done) {
        const details = {
            email: 'nganatech@gmail.com',
            password: '123451234',
        }

        chai.request(app)
            .post('/register')
            .send(details)
            .then((err, res) => {
                if (err) done(err)
                res.should.have.status(400)
                expect(res.body).to.be.a('object')
                done()
            })
            .catch(done())
    })

    it('it should return all field required ', function (done) {
        const details = {
            email: 'nganatech@gmail.com',
            first_name: '12341234',
            last_name: '',
            password: '12341234',
            address: '',
            phone_number: '',
        }

        chai.request(app)
            .post('/register')
            .field(details)
            .then((err, res) => {
                if (err) done(err)
                res.should.have.status(400)
                expect(res.body).to.be.a('object')
                done()
            })
            .catch(done())
    })

    it('it should return first_name and last_name field can only be letter ', (done) => {
        const details = {
            email: 'kigali@gmail.com',
            firstname: 'k234igali',
            lastname: '11rwanda',
            password: '12341234',
        }

        chai.request(app)
            .post('/register')
            .field(details)
            .then((err, res) => {
                if (err) done(err)
                res.should.have.status(400)
                expect(res.body).to.be.a('object')
                done()
            })
            .catch(done())
    })

    it('it should return invalid email ', (done) => {
        const details = {
            email: 'kigaligml.com',
            password: '12341234',
        }

        chai.request(app)
            .post('/register')
            .send(details)
            .then((err, res) => {
                if (err) done(err)
                res.should.have.status(400)
                expect(res.body).to.be.a('object')
                done()
            })
            .catch(done())
    })
})
