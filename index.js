'use strict'

const { URL } = require('url')

const AWS = require('aws-sdk')
const aws4 = require('aws4')
const axios = require('axios')

module.exports = function signedAxios (request) {
  const { host, pathname, search } = new URL(request.url)
  request.host = host
  request.path = pathname + search

  let body = request.data
  if (body) {
    if (typeof body === 'object') {
      body = JSON.stringify(body)
      request.data = body
      request.headers = request.headers || {}
      request.headers['Content-Type'] = 'application/json'
    }
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    accessKeyId: AWS.config.credentials.accessKeyId,
    sessionToken: AWS.config.credentials.sessionToken
  })

  delete signedRequest.headers['Host']
  delete signedRequest.headers['Content-Length']
  return axios.request(signedRequest)
}
