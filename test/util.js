function headers (token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

module.exports = {
  headers
}
